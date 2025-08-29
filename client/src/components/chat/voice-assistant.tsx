import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceAssistantProps {
  onVoiceInput: (transcript: string) => void;
  onSpeakResponse: (text: string) => void;
  isEnabled?: boolean;
}

export default function VoiceAssistant({ 
  onVoiceInput, 
  onSpeakResponse, 
  isEnabled = true 
}: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check for Web Speech API support
    const hasRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const hasSynthesis = 'speechSynthesis' in window;
    setIsSupported(hasRecognition && hasSynthesis);

    if (hasRecognition) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onVoiceInput(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          // Speech recognition error
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    if (hasSynthesis) {
      synthesisRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, [onVoiceInput, isListening]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        // Error starting speech recognition
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const speakText = (text: string) => {
    if (synthesisRef.current && text) {
      // Cancel any ongoing speech
      synthesisRef.current.cancel();
      
      // Clean the text for speech (remove markdown, emojis, etc.)
      const cleanText = text
        .replace(/[*_`~#]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/🎨|📊|🔍|📈|📉|💡|✅|❌|⚠️|📌|🔧|🎯/g, '')
        .replace(/\n+/g, '. ');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthesisRef.current.speak(utterance);
      onSpeakResponse(text);
    }
  };

  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isSupported || !isEnabled) {
    return null;
  }

  return (
    <div className="flex gap-2 animate-in fade-in duration-300" data-testid="voice-assistant">
      {/* Voice Input Button */}
      <Button
        variant={isListening ? "default" : "outline"}
        size="sm"
        onClick={isListening ? stopListening : startListening}
        disabled={isSpeaking}
        className={cn(
          "transition-all duration-300 transform hover:scale-110 active:scale-95",
          isListening ? "bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/30" : 
          "hover:shadow-lg hover:shadow-primary/20"
        )}
        data-testid="button-voice-input"
      >
        {isListening ? (
          <>
            <MicOff className="h-4 w-4 mr-1 animate-bounce" />
            <span className="animate-pulse">Stop</span>
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 mr-1" />
            Speak
          </>
        )}
      </Button>

      {/* Text-to-Speech Button */}
      <Button
        variant={isSpeaking ? "default" : "outline"}
        size="sm"
        onClick={isSpeaking ? stopSpeaking : () => {}}
        disabled={isListening || !isSpeaking}
        className={cn(
          "transition-all duration-300 transform hover:scale-110 active:scale-95",
          isSpeaking ? "bg-blue-500 hover:bg-blue-600 text-white animate-pulse shadow-lg shadow-blue-500/30" : 
          "hover:shadow-lg hover:shadow-primary/20"
        )}
        data-testid="button-speak-response"
      >
        {isSpeaking ? (
          <>
            <VolumeX className="h-4 w-4 mr-1 animate-pulse" />
            <span className="animate-pulse">Stop</span>
          </>
        ) : (
          <>
            <Volume2 className="h-4 w-4 mr-1" />
            Listen
          </>
        )}
      </Button>
    </div>
  );
}

// Type definitions for Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}