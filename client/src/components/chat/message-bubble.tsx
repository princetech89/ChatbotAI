import { cn } from "@/lib/utils";
import type { Message } from "@shared/schema";
import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChartVisualization from './chart-visualization';
import { QuickReplies } from './quick-replies';

interface MessageBubbleProps {
  message: Message;
  isLatest?: boolean;
  category?: string;
  onQuickReply?: (reply: string) => void;
  disabled?: boolean;
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

export function MessageBubble({ message, isLatest, category, onQuickReply, disabled }: MessageBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isUser = message.role === "user";
  const detectedCategory = category || (isUser ? detectCategory(message.content) : 'general');
  const isLongMessage = message.content.length > 300;
  const shouldTruncate = isLongMessage && !isExpanded;
  
  // Check if message contains an image or chart
  const imageMatch = message.content.match(/!\[.*?\]\((data:image\/[^)]+)\)/);
  const hasImage = !!imageMatch;
  const hasChart = message.content.startsWith('CHART_DATA:');
  const imageUrl = imageMatch?.[1];
  
  // Parse quick replies if available
  const quickReplies = message.quickReplies ? JSON.parse(message.quickReplies) : null;
  
  let textContent = message.content;
  let chartData = null;
  
  if (hasImage) {
    textContent = message.content.replace(/!\[.*?\]\([^)]+\)/, '').trim();
  } else if (hasChart) {
    try {
      chartData = JSON.parse(message.content.replace('CHART_DATA:', ''));
      textContent = '';
    } catch (error) {
      console.error('Error parsing chart data:', error);
      textContent = 'Error displaying chart data';
    }
  }
  
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
    <div className={cn(
      "flex transition-all duration-300 ease-out", 
      isUser ? "justify-end" : "justify-start", 
      isLatest && "animate-in slide-in-from-bottom-2 fade-in duration-500"
    )}>
      <div className={cn("max-w-xs md:max-w-2xl", !isUser && "lg:max-w-4xl w-full")}>
        {/* Category Badge for user messages */}
        {isUser && (
          <div className="mb-1 flex justify-end">
            <span className={cn("category-badge", `category-${detectedCategory}`)}>
              {getCategoryLabel(detectedCategory)}
            </span>
          </div>
        )}
        
        <div 
          className={cn(
            "rounded-2xl px-4 py-3 relative group transition-all duration-300 ease-out transform",
            "hover:scale-[1.02] hover:shadow-lg",
            isUser ? "message-bubble-user rounded-br-md hover:shadow-blue-500/20" : "message-bubble-bot rounded-bl-md hover:shadow-gray-500/20",
            isHovered && "scale-[1.01]"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Text Content */}
          {textContent && (
            <div className="text-base leading-relaxed whitespace-pre-wrap font-medium search-result-text" data-testid={`text-message-${message.id}`}>
              {displayContent}
            </div>
          )}
          
          {/* Generated Image */}
          {hasImage && imageUrl && (
            <div className="mt-3 animate-in fade-in duration-700 delay-300">
              <div className="relative rounded-lg overflow-hidden border border-border max-w-md group cursor-pointer">
                <img
                  src={imageUrl}
                  alt="Generated Image"
                  className={cn(
                    "w-full h-auto transition-all duration-500 transform",
                    "hover:scale-105 hover:brightness-110",
                    imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  )}
                  onLoad={() => setImageLoaded(true)}
                  data-testid={`image-${message.id}`}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <div className="relative">
                      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      <div className="text-sm text-muted-foreground mt-2 text-center animate-pulse">Loading image...</div>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
              </div>
            </div>
          )}

          {/* Generated Chart */}
          {hasChart && chartData && chartData.data && Array.isArray(chartData.data) && chartData.data.length > 0 && (
            <div className="mt-3 animate-in slide-in-from-left duration-700 delay-500">
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <ChartVisualization chartData={chartData} />
              </div>
            </div>
          )}
          
          {/* Quick Replies */}
          {!isUser && quickReplies && onQuickReply && (
            <QuickReplies 
              replies={quickReplies} 
              onReplySelect={onQuickReply}
              disabled={disabled}
            />
          )}
          
          {/* Expand/Collapse for long messages */}
          {isLongMessage && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 p-1 h-auto text-xs opacity-70 hover:opacity-100 transition-all duration-200 hover:scale-105 hover:bg-primary/10"
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid={`button-expand-${message.id}`}
            >
              {isExpanded ? (
                <>Show Less <ChevronUp className="h-3 w-3 ml-1 transition-transform duration-200" /></>
              ) : (
                <>Show More <ChevronDown className="h-3 w-3 ml-1 transition-transform duration-200" /></>
              )}
            </Button>
          )}
          
          {/* Copy button (visible on hover) */}
          {!isUser && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "absolute top-2 right-2 p-1 transition-all duration-300 transform",
                "opacity-0 group-hover:opacity-70 hover:opacity-100 hover:scale-110",
                "hover:bg-primary/20 hover:text-primary",
                copied && "opacity-100 text-green-500"
              )}
              onClick={handleCopy}
              data-testid={`button-copy-${message.id}`}
            >
              {copied ? (
                <Check className="h-3 w-3 animate-in zoom-in duration-200" /> 
              ) : (
                <Copy className="h-3 w-3" />
              )}
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
