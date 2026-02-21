import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Volume2, AlertCircle } from 'lucide-react';

interface VoiceControlProps {
  onCommand?: (command: string) => void;
  enabled?: boolean;
}

/**
 * Voice Control Component
 * Provides TTS announcements and voice command input
 */
export default function VoiceControl({ onCommand, enabled = true }: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognitionRef.current.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript(transcriptPart);
            onCommand?.(transcriptPart);
          } else {
            interim += transcriptPart;
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setError('Speech Recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onCommand]);

  // Text-to-speech function
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setError('Text-to-Speech not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    synthesisRef.current = new SpeechSynthesisUtterance(text);
    synthesisRef.current.rate = 1;
    synthesisRef.current.pitch = 1;
    synthesisRef.current.volume = 1;

    synthesisRef.current.onstart = () => setIsSpeaking(true);
    synthesisRef.current.onend = () => setIsSpeaking(false);
    synthesisRef.current.onerror = (event: any) => {
      setError(`Speech synthesis error: ${event.error}`);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(synthesisRef.current);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech Recognition not available');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const handleAnnouncement = (message: string) => {
    speak(message);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Voice Input Control */}
      <div className="flex gap-2">
        <Button
          onClick={toggleListening}
          disabled={!enabled}
          className={`flex items-center gap-2 font-mono text-xs ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 animate-pulse'
              : 'bg-cyan-600 hover:bg-cyan-700'
          }`}
        >
          <Mic className="w-4 h-4" />
          {isListening ? 'LISTENING...' : 'START VOICE'}
        </Button>

        <Button
          onClick={() => handleAnnouncement('System ready. All agents online.')}
          disabled={!enabled || isSpeaking}
          className="flex items-center gap-2 font-mono text-xs bg-green-600 hover:bg-green-700"
        >
          <Volume2 className="w-4 h-4" />
          TEST TTS
        </Button>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="p-3 bg-gray-900 border border-cyan-400 rounded font-mono text-xs">
          <div className="text-cyan-400 mb-1">RECOGNIZED:</div>
          <div className="text-white">{transcript}</div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-900 border border-red-400 rounded font-mono text-xs flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-red-300">{error}</div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="text-xs text-gray-400 font-mono">
        <div>Voice Input: {enabled ? 'ENABLED' : 'DISABLED'}</div>
        <div>TTS Status: {isSpeaking ? 'SPEAKING' : 'IDLE'}</div>
      </div>
    </div>
  );
}

// Export TTS function for use in other components
export const useTextToSpeech = () => {
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };

  return { speak };
};
