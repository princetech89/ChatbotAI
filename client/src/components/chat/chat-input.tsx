import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Lightbulb, PenTool, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const insertQuickPrompt = (prompt: string) => {
    setMessage(prompt);
  };

  const quickPrompts = [
    { icon: Lightbulb, text: "Explain quantum computing in simple terms", category: "educational" },
    { icon: PenTool, text: "Write a creative story about time travel", category: "creative" },
    { icon: Search, text: "Research the latest AI trends in 2025", category: "research" },
    { icon: Settings, text: "Help me solve a coding problem", category: "technical" }
  ];

  return (
    <footer className="bg-background border-t border-border px-4 py-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          
          {/* Message Input */}
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything... I'll analyze and categorize your query automatically"
              className="w-full px-4 py-3 pr-12 bg-input border border-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 max-h-32 min-h-[48px]"
              rows={1}
              disabled={disabled}
              data-testid="textarea-message"
            />
          </div>

          {/* Send Button */}
          <Button 
            type="submit"
            className={cn(
              "bg-primary text-primary-foreground p-3 rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200",
              (!message.trim() || disabled) && "opacity-50 cursor-not-allowed"
            )}
            disabled={!message.trim() || disabled}
            data-testid="button-send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {/* Smart Quick Actions */}
        <div className="mt-4">
          <p className="text-xs text-muted-foreground text-center mb-3">
            Try these smart prompts - I'll automatically categorize and provide detailed responses:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs text-left justify-start px-3 py-2 h-auto hover:bg-accent transition-colors"
                onClick={() => insertQuickPrompt(prompt.text)}
                data-testid={`button-quick-${prompt.category}`}
              >
                <prompt.icon className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="truncate">{prompt.text}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Enhanced Disclaimer */}
        <p className="text-xs text-muted-foreground text-center mt-3">
          Smart AI with category detection • Full-screen mode available • Advanced search capabilities
        </p>
      </div>
    </footer>
  );
}
