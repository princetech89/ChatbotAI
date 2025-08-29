import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Lightbulb, PenTool, Search, Settings, Sparkles, Upload, Camera, Image, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import VoiceAssistant from './voice-assistant';

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
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
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if ((message.trim() || attachedFiles.length > 0) && !disabled) {
      onSendMessage(message.trim() || "Analyze this file:", attachedFiles);
      setMessage("");
      setAttachedFiles([]);
      setShowSuggestions(false);
      setIsTyping(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'text/plain', 'application/pdf'];
      return validTypes.includes(file.type) && file.size < 10 * 1024 * 1024; // 10MB limit
    });
    
    setAttachedFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleVoiceInput = (transcript: string) => {
    setMessage(transcript);
    if (transcript.trim()) {
      setTimeout(() => {
        onSendMessage(transcript.trim(), []);
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
            <div className="relative">
              <Textarea
                ref={inputRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setIsTyping(e.target.value.length > 0);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Type your message..."
                className={cn(
                  "w-full px-4 py-3 bg-input border border-border rounded-2xl resize-none",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "transition-all duration-300 max-h-32 min-h-[48px] transform",
                  isFocused && "scale-[1.02] shadow-lg ring-2 ring-primary/20",
                  isTyping && "border-primary/50"
                )}
                rows={1}
                disabled={disabled}
                data-testid="textarea-message"
              />
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="absolute bottom-1 right-3 flex gap-1">
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
                </div>
              )}
            </div>
          </div>

          {/* File Upload Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl hover:bg-primary/10 transition-all duration-300 hover:scale-110"
            data-testid="button-file-upload"
          >
            <Upload className="h-4 w-4 text-muted-foreground" />
          </Button>

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
              "bg-primary text-primary-foreground p-3 rounded-xl transition-all duration-300 transform",
              "hover:bg-primary/90 hover:scale-110 hover:shadow-lg hover:shadow-primary/30",
              "focus:outline-none focus:ring-2 focus:ring-ring active:scale-95",
              (message.trim() || attachedFiles.length > 0) && !disabled ? "pulse-glow" : "opacity-50 cursor-not-allowed"
            )}
            disabled={(!message.trim() && attachedFiles.length === 0) || disabled}
            data-testid="button-send"
          >
            <Send className={cn(
              "h-4 w-4 transition-all duration-200",
              (message.trim() || attachedFiles.length > 0) && !disabled && "animate-pulse"
            )} />
          </Button>
        </form>

        {/* File Attachments Preview */}
        {attachedFiles.length > 0 && (
          <div className="mt-3 p-3 bg-muted/30 rounded-xl border border-border">
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg border border-primary/20">
                  {file.type.startsWith('image/') ? (
                    <Image className="h-4 w-4 text-primary" />
                  ) : (
                    <FileText className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm font-medium text-primary truncate max-w-32">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-muted-foreground hover:text-destructive transition-colors ml-2 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              📎 {attachedFiles.length} file{attachedFiles.length !== 1 ? 's' : ''} attached - The AI will analyze your files
            </p>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.txt,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </footer>
  );
}
