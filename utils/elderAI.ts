import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { ChatMessage, Memory } from '@/types';
import { getMemories } from './storage';

// Simple patterns for the MVP chatbot
const MEMORY_PATTERNS = [
  /show me (a )?memory/i,
  /show me (a )?photo/i,
  /show me (a )?picture/i,
  /view memory/i,
  /remember/i,
  /photo/i,
];

const HELP_PATTERNS = [
  /help me/i,
  /i need help/i,
  /emergency/i,
  /call for help/i,
  /call family/i,
];

const MEDICATION_PATTERNS = [
  /medication/i,
  /medicine/i,
  /pill/i,
  /drug/i,
  /dose/i,
];

interface BotResponse {
  text: string;
  hasMedia?: boolean;
  mediaUri?: string;
  mediaType?: 'image' | 'audio';
  action?: 'emergency' | 'medication' | 'memory';
}

// Simple rule-based response generation
export const generateBotResponse = async (
  userMessage: string,
  chatHistory: ChatMessage[]
): Promise<BotResponse> => {
  // Detect if the user is asking to see memories
  if (MEMORY_PATTERNS.some(pattern => pattern.test(userMessage))) {
    const memories = await getMemories();
    if (memories.length > 0) {
      // Select a random memory to show
      const randomMemory = memories[Math.floor(Math.random() * memories.length)];
      return {
        text: `Here's a memory I found: ${randomMemory.caption}`,
        hasMedia: true,
        mediaUri: randomMemory.imageUri,
        mediaType: 'image',
        action: 'memory',
      };
    } else {
      return {
        text: "I don't have any memories saved yet. Would you like to add some photos to your Memory Lane?",
      };
    }
  }

  // Detect if the user is asking for help
  if (HELP_PATTERNS.some(pattern => pattern.test(userMessage))) {
    return {
      text: "I can help you contact someone. Would you like me to call emergency services or your primary contact?",
      action: 'emergency',
    };
  }

  // Detect if the user is asking about medications
  if (MEDICATION_PATTERNS.some(pattern => pattern.test(userMessage))) {
    return {
      text: "Let me show you your medication schedule. Would you like to see your medications?",
      action: 'medication',
    };
  }

  // Default responses
  const defaultResponses = [
    "I'm here to help you. You can ask me to show memories, remind you about medication, or call for help if you need it.",
    "How are you feeling today? Is there anything specific you'd like help with?",
    "I'm your ElderAid assistant. I can help with medications, memories, or emergencies.",
    "Would you like to see some family photos or check your medication schedule?",
  ];
  
  return {
    text: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
  };
};

// Text-to-speech helper
export const speakText = async (text: string): Promise<void> => {
  if (Platform.OS === 'web') {
    console.log('Speech not fully supported on web');
    // Web browsers have their own speech synthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
    return;
  }
  
  await Speech.speak(text, {
    language: 'en',
    pitch: 1.0,
    rate: 0.9,
  });
};

export const stopSpeaking = () => {
  if (Platform.OS === 'web') {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    return;
  }
  
  Speech.stop();
};