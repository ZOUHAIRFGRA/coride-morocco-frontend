import React, { createContext, useContext, ReactNode } from "react";
import {
  useVoiceAssistant,
  UseVoiceAssistantResult, // Import the result type from your hook file
} from "@/hooks/useVoiceAssistant"; // Reverted back to original hook

// Create the context with an initial undefined value
// We use the hook's return type for the context shape
const SpeechContext = createContext<UseVoiceAssistantResult | undefined>(undefined);

// Define props for the provider component
interface VoiceAssistantProviderProps {
  children: ReactNode;
}

// Create the Provider Component
export const SpeechProvider = ({ children }: VoiceAssistantProviderProps) => {
  // Call the hook within the provider
  const voiceAssistant = useVoiceAssistant();

  // Provide the hook's return value (state and functions) to children
  return <SpeechContext.Provider value={voiceAssistant}>{children}</SpeechContext.Provider>;
};

export const useSpeech = () => {
  const context = useContext(SpeechContext);
  if (context === undefined) {
    throw new Error("useSpeech must be used within a SpeechProvider");
  }
  return context;
};
