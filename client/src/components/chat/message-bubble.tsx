import { cn } from "@/lib/utils";
import type { Message } from "@shared/schema";

interface MessageBubbleProps {
  message: Message;
  isLatest?: boolean;
}

export function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit' 
  }) : "";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start", isLatest && "fade-in")}>
      <div className={cn("max-w-xs md:max-w-md", !isUser && "lg:max-w-2xl")}>
        <div className={cn(
          "rounded-2xl px-4 py-3",
          isUser ? "message-bubble-user rounded-br-md" : "message-bubble-bot rounded-bl-md"
        )}>
          <div className="text-sm leading-relaxed whitespace-pre-wrap" data-testid={`text-message-${message.id}`}>
            {message.content}
          </div>
        </div>
        <div className={cn(
          "text-xs text-muted-foreground mt-1",
          isUser ? "text-right" : "text-left"
        )}>
          <span data-testid={`text-timestamp-${message.id}`}>{timestamp}</span>
        </div>
      </div>
    </div>
  );
}
