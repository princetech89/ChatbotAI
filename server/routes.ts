import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertConversationSchema } from "@shared/schema";
import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "default_key"
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
  return [...new Set(replies)].slice(0, 4);
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

  // Send a message and get AI response
  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { id: conversationId } = req.params;
      const { content } = req.body;

      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: "Message content is required" });
      }

      // Analyze sentiment of user message
      const sentiment = analyzeSentiment(content);
      
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
        const response = await genai.models.generateContent({
          model: "gemini-2.5-flash",
          config: {
            maxOutputTokens: 1000, // Limit response length for faster processing
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
          },
          contents: [
            {
              role: "user",
              parts: [{ 
                text: `Be helpful, concise, and engaging. ${shouldGenerateImage ? 'Visual content will be generated.' : ''}\n\n${content}` 
              }]
            }
          ],
        });

        let aiResponse = response.text || "I apologize, but I couldn't generate a response. Please try again.";
        
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
        
        // Add notes for different content types with emojis
        if (shouldGenerateImage || shouldAutoGenerateImage) {
          aiResponse += "\n\n🎨 Generating a relevant image...";
        }
        if (isSearchQuery) {
          aiResponse += "\n\n🔍 Researching and gathering information...";
        }
        if (shouldGenerateChart) {
          aiResponse += "\n\n📊 Creating data visualization...";
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

        // Return response immediately for better user experience
        res.json({ userMessage, botMessage });

        // Skip visual content generation for faster responses
        // (Visual content can be requested separately if needed)

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
