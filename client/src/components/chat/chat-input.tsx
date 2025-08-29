import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Lightbulb, PenTool, Search, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

const textPredictions = [
  "Can you explain how",
  "What is the difference between",
  "How do I",
  "Can you help me with",
  "What are the benefits of",
  "Can you create a",
  "Please write a",
  "Can you analyze",
  "What would happen if",
  "Can you compare",
  "How does",
  "Can you teach me",
  "What are some examples of",
  "Can you solve this problem:",
  "Can you research information about",
  "Can you generate an image of"
];

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (message.length > 1) {
      const filtered = textPredictions.filter(pred => 
        pred.toLowerCase().startsWith(message.toLowerCase()) ||
        pred.toLowerCase().includes(' ' + message.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestion(prev => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestion(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === "Tab") {
        e.preventDefault();
        setMessage(suggestions[selectedSuggestion]);
        setShowSuggestions(false);
      }
    }
    
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (showSuggestions && suggestions.length > 0) {
        setMessage(suggestions[selectedSuggestion]);
        setShowSuggestions(false);
      } else {
        handleSubmit(e);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setMessage(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const insertQuickPrompt = (prompt: string) => {
    setMessage(prompt);
    setShowSuggestions(false);
  };

  const quickPrompts = [
    { icon: Lightbulb, text: "Explain quantum computing in simple terms", category: "educational" },
    { icon: PenTool, text: "Write a creative story about time travel", category: "creative" },
    { icon: Search, text: "Research the latest AI trends in 2025", category: "research" },
    { icon: Settings, text: "Help me solve a coding problem", category: "technical" },
    { icon: Sparkles, text: "Generate an image of a futuristic city", category: "creative" },
    { icon: Sparkles, text: "Create a picture of a peaceful mountain landscape", category: "creative" }
  ];

  return (
    <footer className="bg-background border-t border-border px-4 py-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          
          {/* Message Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Start typing for smart predictions... I'll analyze and categorize your query automatically"
              className="w-full px-4 py-3 pr-12 bg-input border border-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 max-h-32 min-h-[48px]"
              rows={1}
              disabled={disabled}
              data-testid="textarea-message"
            />
            
            {/* Text Predictions */}
            {showSuggestions && (
              <div className="text-prediction">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={cn("prediction-item", index === selectedSuggestion && "selected")}
                    onClick={() => selectSuggestion(suggestion)}
                    data-testid={`prediction-${index}`}
                  >
                    <Sparkles className="h-3 w-3 inline mr-2 text-primary" />
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
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
          🚀 Smart AI with auto-complete • 🎨 Image generation • 📊 Category detection • 🔍 Enhanced search • 🖥️ Full-screen mode
        </p>
      </div>
    </footer>
  );
}
