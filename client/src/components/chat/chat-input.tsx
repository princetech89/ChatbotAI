import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Lightbulb, PenTool, Search } from "lucide-react";
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
              placeholder="Type your message..."
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

        {/* Quick Actions */}
        <div className="flex items-center justify-center mt-3 space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground px-3 py-1 rounded-full hover:bg-accent transition-colors"
            onClick={() => insertQuickPrompt("Can you explain a concept to me?")}
            data-testid="button-quick-explain"
          >
            <Lightbulb className="h-3 w-3 mr-1" />
            Explain a concept
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground px-3 py-1 rounded-full hover:bg-accent transition-colors"
            onClick={() => insertQuickPrompt("Can you help me write something?")}
            data-testid="button-quick-write"
          >
            <PenTool className="h-3 w-3 mr-1" />
            Help me write
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground px-3 py-1 rounded-full hover:bg-accent transition-colors"
            onClick={() => insertQuickPrompt("Can you research a topic for me?")}
            data-testid="button-quick-research"
          >
            <Search className="h-3 w-3 mr-1" />
            Research topic
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center mt-2">
          AI Assistant may make mistakes. Please verify important information.
        </p>
      </div>
    </footer>
  );
}
