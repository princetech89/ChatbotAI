import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickRepliesProps {
  replies: string[];
  onReplySelect: (reply: string) => void;
  disabled?: boolean;
}

export function QuickReplies({ replies, onReplySelect, disabled }: QuickRepliesProps) {
  const [selectedReply, setSelectedReply] = useState<string | null>(null);

  const handleReplyClick = (reply: string) => {
    setSelectedReply(reply);
    onReplySelect(reply);
    
    // Reset selection after a brief delay for visual feedback
    setTimeout(() => setSelectedReply(null), 1000);
  };

  if (!replies || replies.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3 animate-in fade-in duration-300 delay-200">
      {replies.map((reply, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => handleReplyClick(reply)}
          disabled={disabled}
          className={cn(
            "text-sm px-3 py-1 h-auto transition-all duration-200",
            "hover:scale-105 hover:shadow-md hover:border-primary/50",
            "active:scale-95",
            selectedReply === reply && "bg-primary text-primary-foreground border-primary",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          data-testid={`quick-reply-${index}`}
        >
          {reply}
        </Button>
      ))}
    </div>
  );
}