import { cn } from "@/lib/utils";
import type { Message } from "@shared/schema";
import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check, ThumbsUp, ThumbsDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChartVisualization from './chart-visualization';
import { QuickReplies } from './quick-replies';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Enhanced markdown formatting function
function formatMarkdownContent(text: string): string {
  if (!text) return '';
  
  let formatted = text;
  
  // Headers
  formatted = formatted.replace(/^## (.+)$/gm, '<h2 class="markdown-h2">$1</h2>');
  formatted = formatted.replace(/^### (.+)$/gm, '<h3 class="markdown-h3">$1</h3>');
  formatted = formatted.replace(/^#### (.+)$/gm, '<h4 class="markdown-h4">$1</h4>');
  
  // Bold text
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong class="markdown-bold">$1</strong>');
  
  // Italic text  
  formatted = formatted.replace(/\*([^*]+?)\*/g, '<em class="markdown-italic">$1</em>');
  
  // Code blocks
  formatted = formatted.replace(/`([^`]+?)`/g, '<code class="markdown-code">$1</code>');
  
  // Bullet points (• or -)
  formatted = formatted.replace(/^[•\-\*] (.+)$/gm, '<li class="markdown-li">$1</li>');
  
  // Numbered lists
  formatted = formatted.replace(/^(\d+)\. (.+)$/gm, '<li class="markdown-numbered-li"><span class="list-number">$1.</span> $2</li>');
  
  // Blockquotes
  formatted = formatted.replace(/^> (.+)$/gm, '<blockquote class="markdown-quote">$1</blockquote>');
  
  // Convert line breaks
  formatted = formatted.replace(/\n\n+/g, '</p><p class="markdown-p">');
  formatted = formatted.replace(/\n/g, '<br/>');
  
  // Wrap orphaned lists
  formatted = formatted.replace(/(<li class="markdown-li">(?:(?!<\/li>).)*<\/li>)/g, (match) => {
    return `<ul class="markdown-ul">${match}</ul>`;
  });
  formatted = formatted.replace(/(<li class="markdown-numbered-li">(?:(?!<\/li>).)*<\/li>)/g, (match) => {
    return `<ol class="markdown-ol">${match}</ol>`;
  });
  
  // Wrap content in paragraphs if it doesn't start with a block element
  if (!formatted.match(/^<[h2-4]|^<ul|^<ol|^<blockquote/)) {
    formatted = `<p class="markdown-p">${formatted}</p>`;
  }
  
  return formatted;
}

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
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const { toast } = useToast();
  
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
      // Error parsing chart data
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
      // Failed to copy text
    }
  };

  const handleFeedback = async (type: 'helpful' | 'not-helpful') => {
    try {
      setFeedback(type);
      await apiRequest('POST', `/api/messages/${message.id}/feedback`, {
        type,
        rating: rating > 0 ? rating : undefined
      });
      toast({
        title: "Thanks for your feedback!",
        description: "Your feedback helps improve our AI responses.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit feedback"
      });
    }
  };

  const handleRating = (stars: number) => {
    setRating(stars);
    setShowFeedback(true);
  };

  return (
    <div className={cn(
      "flex transition-all duration-300 ease-out", 
      isUser ? "justify-end" : "justify-start", 
      isLatest && "message-entrance"
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
            "rounded-2xl px-4 py-3 relative group message-bubble interactive-hover",
            "hover:scale-[1.02] hover:shadow-lg breathe",
            isUser ? "message-bubble-user rounded-br-md hover:shadow-blue-500/20" : "message-bubble-bot rounded-bl-md hover:shadow-gray-500/20",
            isHovered && "scale-[1.01]"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Text Content */}
          {textContent && (
            <div 
              className="text-base leading-relaxed font-medium search-result-text" 
              data-testid={`text-message-${message.id}`}
              dangerouslySetInnerHTML={{
                __html: formatMarkdownContent(displayContent)
              }}
            />
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
          
          {/* Action buttons (visible on hover) */}
          {!isUser && (
            <div className={cn(
              "absolute top-2 right-2 flex gap-1 transition-all duration-300",
              "opacity-0 group-hover:opacity-70"
            )}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "p-1 hover:opacity-100 hover:scale-110 hover:bg-primary/20 hover:text-primary",
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
              
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "p-1 hover:opacity-100 hover:scale-110 hover:bg-green-500/20 hover:text-green-500",
                  feedback === 'helpful' && "opacity-100 text-green-500 bg-green-500/20"
                )}
                onClick={() => handleFeedback('helpful')}
                data-testid={`button-helpful-${message.id}`}
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "p-1 hover:opacity-100 hover:scale-110 hover:bg-red-500/20 hover:text-red-500",
                  feedback === 'not-helpful' && "opacity-100 text-red-500 bg-red-500/20"
                )}
                onClick={() => handleFeedback('not-helpful')}
                data-testid={`button-not-helpful-${message.id}`}
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {/* Rating Stars (show on latest bot message) */}
          {!isUser && isLatest && (
            <div className={cn(
              "mt-3 pt-2 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground",
              "opacity-70 hover:opacity-100 transition-opacity"
            )}>
              <span>Rate this response:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className={cn(
                    "transition-all duration-200 hover:scale-110",
                    star <= rating ? "text-yellow-500" : "text-muted-foreground/50 hover:text-yellow-400"
                  )}
                  data-testid={`star-rating-${star}-${message.id}`}
                >
                  <Star className={cn("h-4 w-4", star <= rating && "fill-current")} />
                </button>
              ))}
            </div>
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
