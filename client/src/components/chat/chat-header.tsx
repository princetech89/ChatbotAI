import { Trash2, Settings, Maximize2, Minimize2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface ChatHeaderProps {
  onClearHistory: () => void;
  onSettings: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function ChatHeader({ onClearHistory, onSettings, isFullscreen, onToggleFullscreen }: ChatHeaderProps) {
  return (
    <header className="glass-morph border-b border-border px-4 py-4 flex items-center justify-between shadow-sm corner-accent">
      <div className="flex items-center space-x-3">
        <Link href="/" data-testid="button-back-home">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 mr-2 text-muted-foreground hover:text-foreground hover:bg-accent morph-button"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center breathe morph-button">
          <i className="fas fa-robot text-primary-foreground text-lg"></i>
        </div>
        <div>
          <h1 className="text-lg font-semibold gradient-text">AI Assistant</h1>
          <p className="text-sm text-muted-foreground float">Smart Search & Analysis</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent"
          onClick={onToggleFullscreen}
          data-testid="button-fullscreen"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent"
          onClick={onClearHistory}
          data-testid="button-clear-history"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent"
          onClick={onSettings}
          data-testid="button-settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
