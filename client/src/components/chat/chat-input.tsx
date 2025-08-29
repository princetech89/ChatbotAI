import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Lightbulb, PenTool, Search, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import VoiceAssistant from './voice-assistant';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  lastAssistantMessage?: string;
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

export function ChatInput({ onSendMessage, disabled, lastAssistantMessage }: ChatInputProps) {
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

  const handleVoiceInput = (transcript: string) => {
    setMessage(transcript);
    if (transcript.trim()) {
      setTimeout(() => {
        onSendMessage(transcript.trim());
        setMessage("");
      }, 500);
    }
  };

  const handleSpeakResponse = (text: string) => {
    console.log('Speaking response:', text.substring(0, 50) + '...');
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
    <footer className="bg-background border-t border-border px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          
          {/* Message Input */}
          <div className="flex-1">
            <Textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full px-4 py-3 bg-input border border-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 max-h-32 min-h-[48px]"
              rows={1}
              disabled={disabled}
              data-testid="textarea-message"
            />
          </div>

          {/* Voice Assistant */}
          <div className="shrink-0">
            <VoiceAssistant 
              onVoiceInput={handleVoiceInput}
              onSpeakResponse={handleSpeakResponse}
              isEnabled={!disabled}
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
      </div>
    </footer>
  );
}
