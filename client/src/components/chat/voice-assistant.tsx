import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
          console.error('Speech recognition error:', event.error);
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
        console.error('Error starting speech recognition:', error);
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
    <div className="flex gap-2" data-testid="voice-assistant">
      {/* Voice Input Button */}
      <Button
        variant={isListening ? "default" : "outline"}
        size="sm"
        onClick={isListening ? stopListening : startListening}
        disabled={isSpeaking}
        className={isListening ? "bg-red-500 hover:bg-red-600 text-white" : ""}
        data-testid="button-voice-input"
      >
        {isListening ? (
          <>
            <MicOff className="h-4 w-4 mr-1" />
            Stop
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
        className={isSpeaking ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
        data-testid="button-speak-response"
      >
        {isSpeaking ? (
          <>
            <VolumeX className="h-4 w-4 mr-1" />
            Stop
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