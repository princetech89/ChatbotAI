import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import fs from "fs";
import path from "path";
import { storage } from "./storage";
import { insertMessageSchema, insertConversationSchema } from "@shared/schema";
import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "default_key"
});

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'text/plain', 'application/pdf'];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});

// Helper functions for enhanced chatbot features
function analyzeSentiment(text: string): "positive" | "negative" | "neutral" | "confused" | "frustrated" {
  const lowerText = text.toLowerCase();
  
  // Check for frustration indicators
  if (lowerText.includes('frustrated') || lowerText.includes('annoying') || 
      lowerText.includes('stupid') || lowerText.includes('wrong') ||
      lowerText.includes('terrible') || lowerText.includes('awful')) {
    return 'frustrated';
  }
  
  // Check for confusion indicators
  if (lowerText.includes('confused') || lowerText.includes('don\'t understand') ||
      lowerText.includes('unclear') || lowerText.includes('what do you mean') ||
      lowerText.includes('i don\'t get it') || lowerText.includes('explain')) {
    return 'confused';
  }
  
  // Check for positive indicators
  if (lowerText.includes('thank') || lowerText.includes('great') ||
      lowerText.includes('awesome') || lowerText.includes('perfect') ||
      lowerText.includes('excellent') || lowerText.includes('love')) {
    return 'positive';
  }
  
  // Check for negative indicators
  if (lowerText.includes('bad') || lowerText.includes('hate') ||
      lowerText.includes('dislike') || lowerText.includes('problem') ||
      lowerText.includes('issue') || lowerText.includes('error')) {
    return 'negative';
  }
  
  return 'neutral';
}

function generateQuickReplies(userMessage: string, botResponse: string, sentiment: string): string[] {
  const replies: string[] = [];
  const lowerUserMessage = userMessage.toLowerCase();
  const lowerBotResponse = botResponse.toLowerCase();
  
  // Context-aware replies based on user message type
  if (lowerUserMessage.includes('explain') || lowerUserMessage.includes('how')) {
    replies.push("Can you explain more?", "Give me an example", "What are the steps?");
  }
  
  if (lowerUserMessage.includes('compare') || lowerUserMessage.includes('difference')) {
    replies.push("Show me a comparison", "What are the pros and cons?", "Which is better?");
  }
  
  if (lowerUserMessage.includes('create') || lowerUserMessage.includes('generate')) {
    replies.push("Make another one", "Try a different style", "Show me variations");
  }
  
  if (lowerBotResponse.includes('image') || lowerBotResponse.includes('chart')) {
    replies.push("Show me another example", "Make it interactive", "Explain what I see");
  }
  
  // Sentiment-based replies
  if (sentiment === 'confused') {
    replies.push("Break it down step by step", "Use simpler terms", "Give me an analogy");
  } else if (sentiment === 'frustrated') {
    replies.push("Let's try a different approach", "Show me alternatives", "Contact support");
  } else if (sentiment === 'positive') {
    replies.push("Tell me more", "What else can you do?", "Show me related topics");
  }
  
  // General helpful replies
  replies.push("That's helpful!", "Can you elaborate?", "What's next?");
  
  // Return unique replies, limited to 4 for better UX
  return Array.from(new Set(replies)).slice(0, 4);
}

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

  // Send a message and get AI response (with file upload support)
  app.post("/api/conversations/:id/messages", upload.array('file'), async (req, res) => {
    try {
      const { id: conversationId } = req.params;
      const { content } = req.body;
      const files = req.files as Express.Multer.File[];

      if ((!content || content.trim() === '') && (!files || files.length === 0)) {
        return res.status(400).json({ error: "Message content or files are required" });
      }

      let messageContent = content || "Analyze these files:";
      let hasImageAnalysis = false;

      // Process uploaded files for analysis
      if (files && files.length > 0) {
        hasImageAnalysis = true;
        const fileDescriptions = files.map(file => `📎 ${file.originalname} (${file.mimetype})`).join('\n');
        messageContent += `\n\n${fileDescriptions}`;
      }

      // Analyze sentiment of user message
      const sentiment = analyzeSentiment(messageContent);
      
      // Save user message with sentiment analysis
      const userMessage = await storage.createMessage({
        conversationId,
        content,
        role: "user",
        sentiment: sentiment,
        messageType: "text",
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

      // Get AI response with optimized settings for faster response
      try {
        // Use faster model and optimized prompt for quick responses
        console.log('Sending request to Gemini API for:', content);
        // Enhanced prompting for better formatted responses
        const isSearchOrInfoRequest = isSearchQuery || 
          messageContent.toLowerCase().includes('what is') || 
          messageContent.toLowerCase().includes('how to') || 
          messageContent.toLowerCase().includes('explain') || 
          messageContent.toLowerCase().includes('tell me about');

        // Prepare content for AI analysis
        const contentParts: any[] = [];

        // Add text content
        const textPrompt = hasImageAnalysis && files.length > 0 ? 
          `Analyze the uploaded files and answer this question: "${messageContent}"` :
          isSearchOrInfoRequest ? 
            `You are an expert AI assistant. For this query, provide a comprehensive, well-formatted response using proper markdown:

## Format Guidelines:
- Use ## for main headings
- Use ### for sub-headings  
- Use **bold** for key terms and important concepts
- Use bullet points (•) for lists
- Use numbered lists (1. 2. 3.) for steps/processes
- Use > for important quotes or highlights
- Organize information in clear sections
- Include specific facts, numbers, and examples
- Make responses scannable and easy to read

User question: ${messageContent}` 
            :
            `You are a helpful AI assistant. Provide clear, accurate, and engaging responses with proper formatting when appropriate.\n\nUser question: ${messageContent}`;

        contentParts.push({ text: textPrompt });

        // Add image files for analysis
        if (files && files.length > 0) {
          for (const file of files) {
            if (file.mimetype.startsWith('image/')) {
              try {
                const imageBuffer = fs.readFileSync(file.path);
                contentParts.push({
                  inlineData: {
                    data: imageBuffer.toString('base64'),
                    mimeType: file.mimetype
                  }
                });
              } catch (error) {
                console.error('Error reading image file:', error);
              }
            } else if (file.mimetype === 'text/plain') {
              try {
                const textContent = fs.readFileSync(file.path, 'utf-8');
                contentParts.push({ text: `File content of ${file.originalname}:\n${textContent}` });
              } catch (error) {
                console.error('Error reading text file:', error);
              }
            }
          }
        }

        const response = await genai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user", 
              parts: contentParts
            }
          ],
        });
        console.log('Gemini API response:', response);

        let aiResponse = response.text;
        
        // Better error handling for empty responses
        if (!aiResponse || aiResponse.trim() === '') {
          aiResponse = "I'm here to help! Could you please rephrase your question or provide more details?";
        }
        
        // Generate contextual quick replies
        const quickReplies = generateQuickReplies(content, aiResponse, sentiment);
        
        // Add empathetic language based on sentiment
        if (sentiment === 'frustrated') {
          aiResponse = "I understand this might be frustrating. Let me help you with that. 😊\n\n" + aiResponse;
        } else if (sentiment === 'confused') {
          aiResponse = "I can see this might be confusing. Let me break it down for you. 🤔\n\n" + aiResponse;
        } else if (sentiment === 'positive') {
          aiResponse = "Great question! I'm happy to help. ✨\n\n" + aiResponse;
        }
        
        // Add visual content generation back
        if (shouldGenerateChart) {
          aiResponse += "\n\n📊 Creating data visualization...";
        }
        if (shouldGenerateImage || shouldAutoGenerateImage) {
          aiResponse += "\n\n🎨 Generating relevant image...";
        }

        // Save AI response with enhanced features
        const botMessage = await storage.createMessage({
          conversationId,
          content: aiResponse,
          role: "assistant",
          quickReplies: quickReplies.length > 0 ? JSON.stringify(quickReplies) : null,
          sentiment: "neutral",
          messageType: "text",
          metadata: JSON.stringify({ 
            hasVisuals: shouldGenerateImage || shouldAutoGenerateImage || shouldGenerateChart,
            isSearchResponse: isSearchQuery,
            userSentiment: sentiment
          })
        });

        // Clean up uploaded files after processing
        if (files && files.length > 0) {
          files.forEach(file => {
            try {
              fs.unlinkSync(file.path);
            } catch (error) {
              console.error('Error cleaning up file:', file.path, error);
            }
          });
        }

        // Return response immediately for better user experience
        res.json({ userMessage, botMessage });

        // Generate visual content asynchronously after sending response
        if (shouldGenerateChart || shouldGenerateImage || shouldAutoGenerateImage) {
          setImmediate(async () => {
            try {
              // Generate chart if requested
              if (shouldGenerateChart) {
                try {
                  const chartPrompt = `Create chart data for: "${content}". Return JSON with chartType (bar/line/pie), title, data array with label/value pairs, and description. 6-8 data points max.`;
                  
                  const chartResponse = await genai.models.generateContent({
                    model: "gemini-2.5-flash",
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
                    contents: chartPrompt,
                  });

                  if (chartResponse.text) {
                    const chartData = JSON.parse(chartResponse.text);
                    await storage.createMessage({
                      conversationId,
                      content: `CHART_DATA:${JSON.stringify(chartData)}`,
                      role: "assistant",
                    });
                  }
                } catch (chartError) {
                  console.error('Chart generation error:', chartError);
                  // Create fallback chart
                  const fallbackChart = {
                    chartType: "bar",
                    title: `Data Overview: ${content.substring(0, 50)}`,
                    data: [
                      { label: "Item A", value: 35, category: "data" },
                      { label: "Item B", value: 28, category: "data" },
                      { label: "Item C", value: 42, category: "data" },
                      { label: "Item D", value: 19, category: "data" },
                      { label: "Item E", value: 31, category: "data" }
                    ],
                    description: "Sample data visualization"
                  };
                  
                  await storage.createMessage({
                    conversationId,
                    content: `CHART_DATA:${JSON.stringify(fallbackChart)}`,
                    role: "assistant",
                  });
                }
              }

              // Generate image if requested
              if (shouldGenerateImage || shouldAutoGenerateImage) {
                try {
                  let imagePrompt = shouldGenerateImage 
                    ? content.replace(/generate image|create image|draw|picture of|show me|image of/gi, '').trim()
                    : `Professional illustration: ${content.substring(0, 100)}`;
                  
                  const imageResponse = await genai.models.generateContent({
                    model: "gemini-2.0-flash-exp",
                    contents: [{ role: "user", parts: [{ text: `Create a detailed image: ${imagePrompt || content}` }] }],
                    config: {
                      responseModalities: ["TEXT", "IMAGE"],
                    },
                  });

                  if (imageResponse.candidates?.[0]?.content?.parts) {
                    for (const part of imageResponse.candidates[0].content.parts) {
                      if (part.inlineData?.data) {
                        await storage.createMessage({
                          conversationId,
                          content: `![Generated Image](data:image/jpeg;base64,${part.inlineData.data})`,
                          role: "assistant",
                        });
                        break;
                      }
                    }
                  }
                } catch (imageError) {
                  console.error('Image generation error:', imageError);
                }
              }
            } catch (error) {
              console.error('Visual content generation error:', error);
            }
          });
        }

      } catch (error) {
        console.error('AI response error:', error);
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

  // Message feedback endpoint
  app.post("/api/messages/:messageId/feedback", async (req, res) => {
    try {
      const { messageId } = req.params;
      const { type, rating } = req.body;
      
      // Store feedback (in real app, save to database)
      console.log(`Message ${messageId} feedback:`, { type, rating });
      
      res.json({ success: true, message: "Feedback recorded successfully" });
    } catch (error) {
      console.error('Error storing feedback:', error);
      res.status(500).json({ error: "Failed to record feedback" });
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
