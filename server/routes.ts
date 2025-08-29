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

      // Get AI response
      try {
        // Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
        const response = await genai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [{ 
                text: `You are a helpful AI assistant. Provide clear, accurate, and engaging responses to user questions. Be conversational but informative.

User question: ${content}` 
              }]
            }
          ],
        });

        const aiResponse = response.text || "I apologize, but I couldn't generate a response. Please try again.";

        // Save AI response
        const botMessage = await storage.createMessage({
          conversationId,
          content: aiResponse,
          role: "assistant",
        });

        res.json({
          userMessage,
          botMessage,
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
