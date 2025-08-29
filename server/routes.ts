import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertConversationSchema } from "@shared/schema";
import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "default_key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all conversations (for demo purposes, not user-specific)
  app.get("/api/conversations", async (req, res) => {
    try {
      // For demo, get all conversations from all users
      const conversations = Array.from((storage as any).conversations.values())
        .sort((a: any, b: any) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get messages for a conversation
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      const messages = await storage.getConversationMessages(id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Create a new conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error) {
      res.status(400).json({ error: "Invalid conversation data" });
    }
  });

  // Send a message and get AI response
  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { id: conversationId } = req.params;
      const { content } = req.body;

      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: "Message content is required" });
      }

      // Save user message
      const userMessage = await storage.createMessage({
        conversationId,
        content,
        role: "user",
      });

      // Enhanced content analysis for different types of requests
      const shouldGenerateImage = content.toLowerCase().includes('generate image') || 
                                 content.toLowerCase().includes('create image') ||
                                 content.toLowerCase().includes('draw') ||
                                 content.toLowerCase().includes('picture of') ||
                                 content.toLowerCase().includes('show me') ||
                                 content.toLowerCase().includes('image of');

      // Check for search queries that should also generate visual content
      const isSearchQuery = content.toLowerCase().includes('search for') ||
                           content.toLowerCase().includes('find information') ||
                           content.toLowerCase().includes('look up') ||
                           content.toLowerCase().includes('research') ||
                           content.toLowerCase().includes('tell me about') ||
                           content.toLowerCase().includes('explain') ||
                           content.includes('?') && (content.toLowerCase().includes('what') || 
                                                   content.toLowerCase().includes('how') ||
                                                   content.toLowerCase().includes('when') ||
                                                   content.toLowerCase().includes('where') ||
                                                   content.toLowerCase().includes('why'));

      // Check for data visualization requests
      const shouldGenerateChart = content.toLowerCase().includes('chart') ||
                                 content.toLowerCase().includes('graph') ||
                                 content.toLowerCase().includes('visualization') ||
                                 content.toLowerCase().includes('data') ||
                                 content.toLowerCase().includes('statistics') ||
                                 content.toLowerCase().includes('compare') ||
                                 content.toLowerCase().includes('trend') ||
                                 content.toLowerCase().includes('analysis') ||
                                 (isSearchQuery && (content.toLowerCase().includes('market') ||
                                                   content.toLowerCase().includes('growth') ||
                                                   content.toLowerCase().includes('economy') ||
                                                   content.toLowerCase().includes('population') ||
                                                   content.toLowerCase().includes('sales')));

      // Auto-generate images for search topics that would benefit from visuals
      const shouldAutoGenerateImage = isSearchQuery && !shouldGenerateChart && (
        content.toLowerCase().includes('city') ||
        content.toLowerCase().includes('country') ||
        content.toLowerCase().includes('animal') ||
        content.toLowerCase().includes('plant') ||
        content.toLowerCase().includes('building') ||
        content.toLowerCase().includes('architecture') ||
        content.toLowerCase().includes('landscape') ||
        content.toLowerCase().includes('technology') ||
        content.toLowerCase().includes('space') ||
        content.toLowerCase().includes('ocean')
      );

      // Get AI response
      try {
        // Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
        const response = await genai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [{ 
                text: `You are a helpful AI assistant with advanced capabilities. Provide clear, accurate, and engaging responses to user questions. Be conversational but informative.

${shouldGenerateImage ? 'The user has requested visual content. Along with your text response, I will generate an image related to their request.' : ''}

User question: ${content}` 
              }]
            }
          ],
        });

        let aiResponse = response.text || "I apologize, but I couldn't generate a response. Please try again.";
        
        // Add notes for different content types
        if (shouldGenerateImage || shouldAutoGenerateImage) {
          aiResponse += "\n\n🎨 Generating a relevant image...";
        }
        if (isSearchQuery) {
          aiResponse += "\n\n🔍 Researching and gathering information...";
        }
        if (shouldGenerateChart) {
          aiResponse += "\n\n📊 Creating data visualization...";
        }

        // Save AI response
        const botMessage = await storage.createMessage({
          conversationId,
          content: aiResponse,
          role: "assistant",
        });

        // Generate chart/visualization if requested
        let chartGenerated = false;
        if (shouldGenerateChart) {
          try {
            // Generate intelligent chart data based on the specific search query
            const chartPrompt = `Based on this search query: "${content}"
            
            Create realistic, relevant chart data that would help visualize information about this topic. 
            Consider:
            - What type of chart best represents this data (bar for comparisons, line for trends, pie for parts of whole)
            - What realistic data points would be educational and interesting
            - Make the data current and accurate to 2024/2025 trends
            - Include 6-12 meaningful data points
            - Create a descriptive title and helpful description
            
            Generate the chart data as JSON.`;

            const chartResponse = await genai.models.generateContent({
              model: "gemini-2.5-pro",
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: "object",
                  properties: {
                    chartType: { type: "string", enum: ["bar", "line", "pie", "area", "scatter"] },
                    title: { type: "string" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          label: { type: "string" },
                          value: { type: "number" },
                          category: { type: "string" }
                        }
                      }
                    },
                    description: { type: "string" }
                  }
                }
              },
              contents: chartPrompt
            });

            if (chartResponse.text) {
              const chartData = JSON.parse(chartResponse.text);
              // Save chart message
              const chartMessage = await storage.createMessage({
                conversationId,
                content: `CHART_DATA:${JSON.stringify(chartData)}`,
                role: "assistant",
              });
              chartGenerated = true;
            }
          } catch (error) {
            console.error("Chart generation error:", error);
          }
        }

        // Generate image if requested or for visual search topics
        let imageGenerated = false;
        if (shouldGenerateImage || shouldAutoGenerateImage) {
          try {
            // Create image prompt based on the search topic or explicit request
            let imagePrompt;
            if (shouldGenerateImage) {
              imagePrompt = content.replace(/generate image|create image|draw|picture of|show me|image of/gi, '').trim();
            } else {
              // For auto-generated images, create a relevant visual prompt
              imagePrompt = `A high-quality, detailed illustration or photograph related to: ${content}`;
            }
            const enhancedPrompt = imagePrompt || content;
            
            // Note: only this gemini model supports image generation
            const imageResponse = await genai.models.generateContent({
              model: "gemini-2.0-flash-exp",
              contents: [{ role: "user", parts: [{ text: `Create a high-quality, detailed image: ${enhancedPrompt}` }] }],
              config: {
                responseModalities: ["TEXT", "IMAGE"],
              },
            });

            if (imageResponse.candidates && imageResponse.candidates[0]?.content?.parts) {
              for (const part of imageResponse.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                  // Save image message
                  const imageMessage = await storage.createMessage({
                    conversationId,
                    content: `![Generated Image](data:image/jpeg;base64,${part.inlineData.data})`,
                    role: "assistant",
                  });
                  imageGenerated = true;
                  break;
                }
              }
            }
          } catch (imageError) {
            console.error('Image generation failed:', imageError);
            // Update the bot message to reflect image generation failure
            await storage.createMessage({
              conversationId,
              content: "I apologize, but I wasn't able to generate an image for your request. However, I can still help you with detailed descriptions and information!",
              role: "assistant",
            });
          }
        }

        res.json({
          userMessage,
          botMessage,
          imageGenerated,
        });

      } catch (aiError) {
        // If AI fails, still save user message but return error for bot response
        const errorMessage = await storage.createMessage({
          conversationId,
          content: "I apologize, but I'm experiencing technical difficulties right now. Please try again later.",
          role: "assistant",
        });

        res.json({
          userMessage,
          botMessage: errorMessage,
        });
      }

    } catch (error) {
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // Delete a conversation
  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteConversation(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
