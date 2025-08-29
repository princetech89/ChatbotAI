import { cn } from "@/lib/utils";
import type { Message } from "@shared/schema";
import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageBubbleProps {
  message: Message;
  isLatest?: boolean;
  category?: string;
}

function detectCategory(content: string): string {
  const lowercaseContent = content.toLowerCase();
  
  if (lowercaseContent.includes('code') || lowercaseContent.includes('programming') || lowercaseContent.includes('debug') || lowercaseContent.includes('api')) {
    return 'technical';
  }
  if (lowercaseContent.includes('write') || lowercaseContent.includes('create') || lowercaseContent.includes('design') || lowercaseContent.includes('story')) {
    return 'creative';
  }
  if (lowercaseContent.includes('learn') || lowercaseContent.includes('explain') || lowercaseContent.includes('how to') || lowercaseContent.includes('what is')) {
    return 'educational';
  }
  if (lowercaseContent.includes('research') || lowercaseContent.includes('find') || lowercaseContent.includes('search') || lowercaseContent.includes('information')) {
    return 'research';
  }
  if (lowercaseContent.includes('solve') || lowercaseContent.includes('help') || lowercaseContent.includes('fix') || lowercaseContent.includes('problem')) {
    return 'problem-solving';
  }
  return 'general';
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'technical': 'Technical',
    'creative': 'Creative',
    'educational': 'Educational',
    'research': 'Research',
    'problem-solving': 'Problem Solving',
    'general': 'General'
  };
  return labels[category] || 'General';
}

export function MessageBubble({ message, isLatest, category }: MessageBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const isUser = message.role === "user";
  const detectedCategory = category || (isUser ? detectCategory(message.content) : 'general');
  const isLongMessage = message.content.length > 300;
  const shouldTruncate = isLongMessage && !isExpanded;
  
  // Check if message contains an image
  const imageMatch = message.content.match(/!\[.*?\]\((data:image\/[^)]+)\)/);
  const hasImage = !!imageMatch;
  const imageUrl = imageMatch?.[1];
  const textContent = hasImage ? message.content.replace(/!\[.*?\]\([^)]+\)/, '').trim() : message.content;
  const displayContent = shouldTruncate ? textContent.substring(0, 300) + "..." : textContent;
  
  const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit' 
  }) : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start", isLatest && "fade-in")}>
      <div className={cn("max-w-xs md:max-w-2xl", !isUser && "lg:max-w-4xl w-full")}>
        {/* Category Badge for user messages */}
        {isUser && (
          <div className="mb-1 flex justify-end">
            <span className={cn("category-badge", `category-${detectedCategory}`)}>
              {getCategoryLabel(detectedCategory)}
            </span>
          </div>
        )}
        
        <div className={cn(
          "rounded-2xl px-4 py-3 relative group",
          isUser ? "message-bubble-user rounded-br-md" : "message-bubble-bot rounded-bl-md"
        )}>
          {/* Text Content */}
          {textContent && (
            <div className="text-sm leading-relaxed whitespace-pre-wrap" data-testid={`text-message-${message.id}`}>
              {displayContent}
            </div>
          )}
          
          {/* Generated Image */}
          {hasImage && imageUrl && (
            <div className="mt-3">
              <div className="relative rounded-lg overflow-hidden border border-border max-w-md">
                <img
                  src={imageUrl}
                  alt="Generated Image"
                  className={cn(
                    "w-full h-auto transition-opacity duration-300",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={() => setImageLoaded(true)}
                  data-testid={`image-${message.id}`}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
                    <div className="text-sm text-muted-foreground">Loading image...</div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Expand/Collapse for long messages */}
          {isLongMessage && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 p-1 h-auto text-xs opacity-70 hover:opacity-100"
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid={`button-expand-${message.id}`}
            >
              {isExpanded ? (
                <>Show Less <ChevronUp className="h-3 w-3 ml-1" /></>
              ) : (
                <>Show More <ChevronDown className="h-3 w-3 ml-1" /></>
              )}
            </Button>
          )}
          
          {/* Copy button (visible on hover) */}
          {!isUser && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity"
              onClick={handleCopy}
              data-testid={`button-copy-${message.id}`}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          )}
        </div>
        
        <div className={cn(
          "text-xs text-muted-foreground mt-1 flex items-center",
          isUser ? "justify-end" : "justify-start"
        )}>
          <span data-testid={`text-timestamp-${message.id}`}>{timestamp}</span>
          {!isUser && detectedCategory !== 'general' && (
            <span className={cn("category-badge ml-2", `category-${detectedCategory}`)}>
              {getCategoryLabel(detectedCategory)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
