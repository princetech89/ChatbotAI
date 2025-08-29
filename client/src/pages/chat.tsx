import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageBubble } from "@/components/chat/message-bubble";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { ChatInput } from "@/components/chat/chat-input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Message, Conversation } from "@shared/schema";
import { Bot } from "lucide-react";

export default function ChatPage() {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Create a new conversation when component mounts
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/conversations", {
        title: "New Conversation",
        userId: "demo-user" // For demo purposes
      });
      return response.json();
    },
    onSuccess: (conversation: Conversation) => {
      setCurrentConversationId(conversation.id);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create conversation"
      });
    }
  });

  // Get messages for current conversation
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", currentConversationId, "messages"],
    enabled: !!currentConversationId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/conversations/${currentConversationId}/messages`, {
        content
      });
      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/conversations", currentConversationId, "messages"]
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message"
      });
    },
    onSettled: () => {
      setIsTyping(false);
    }
  });

  // Create conversation on mount
  useEffect(() => {
    if (!currentConversationId) {
      createConversationMutation.mutate();
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = (content: string) => {
    if (currentConversationId) {
      sendMessageMutation.mutate(content);
    }
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const handleClearHistory = () => {
    if (currentConversationId) {
      // Create a new conversation to replace the current one
      createConversationMutation.mutate();
    }
  };

  const handleSettings = () => {
    toast({
      title: "Settings",
      description: "Settings panel coming soon!"
    });
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // Note: Browser fullscreen API is limited in some environments, 
    // so we'll use CSS-based fullscreen mode for better compatibility
  };

  if (!currentConversationId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Bot className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Setting up your chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-screen max-w-4xl mx-auto", isFullscreen && "fullscreen-mode max-w-none")}>
      <ChatHeader 
        onClearHistory={handleClearHistory}
        onSettings={handleSettings}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div 
          ref={chatContainerRef}
          className={cn("chat-container px-4 py-6 flex-1", isFullscreen && "fullscreen")} 
          data-testid="chat-container"
        >
          
          {/* Welcome Message */}
          {(!messages || messages.length === 0) && !isLoading && (
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="text-primary-foreground text-2xl" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to AI Assistant</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                I'm here to help you with questions, provide information, and assist with various tasks. How can I help you today?
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-4 flex-1 overflow-y-auto">
            {messages.map((message: Message, index: number) => (
              <MessageBubble 
                key={message.id} 
                message={message}
                isLatest={index === messages.length - 1}
                onQuickReply={handleQuickReply}
                disabled={sendMessageMutation.isPending}
              />
            ))}

            {/* Typing Indicator */}
            {isTyping && <TypingIndicator />}
          </div>
        </div>
      </main>

      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={sendMessageMutation.isPending}
      />
    </div>
  );
}
