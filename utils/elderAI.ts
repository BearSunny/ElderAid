import { ChatMessage } from '@/types';
import { addChatMessage } from './storage';

// 🔐 Store this in a secure .env file in production
const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY; // Replace with your actual key
const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

// You can change the model to another free one from https://openrouter.ai/docs#models
const MODEL = 'mistralai/mistral-7b-instruct:free'; // or try 'meta-llama/llama-3-8b-instruct'

/**
 * Generates a bot response using OpenRouter's free LLM API
 */
export async function generateBotResponse(userInput: string, history: ChatMessage[]): Promise<ChatMessage> {
  try {
    const messages = [
      {
        role: 'system',
        content: "You are ElderAid, a kind and helpful assistant for elderly users. Respond in a warm, clear, and friendly tone. Keep your replies concise and easy to understand.",
      },
      ...history.map((msg) => ({
        role: msg.sender === 'bot' ? 'assistant' : 'user',
        content: msg.message,
      })),
      {
        role: 'user',
        content: userInput,
      },
    ];

    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
      }),
    });

    const data = await response.json();

    const content = data?.choices?.[0]?.message?.content?.trim();

    const botMessage: ChatMessage = {
      id: Date.now().toString(),
      action: undefined, // this requires a complicated process so that the  bot can send to the app, such as triggering an emergency call, opening a medication reminder, etc
      message: content || 'I’m sorry, I didn’t quite catch that. Could you please repeat?',
      sender: 'bot',
      timestamp: Date.now(),
    };

    await addChatMessage(botMessage);
    return botMessage;
  } catch (error) {
    console.error('Error generating AI response:', error);

    const fallbackMessage: ChatMessage = {
      id: Date.now().toString(),
      message: 'Oops! I had trouble answering that. Please try again in a few moments.',
      sender: 'bot',
      timestamp: Date.now(),
      action: undefined
    };

    await addChatMessage(fallbackMessage);
    return fallbackMessage;
  }
}

/**
 * Optionally, this can be used to speak text using native TTS
 */
export function speakText(text: string) {
  // You could use expo-speech here or another TTS lib
  // Example: Speech.speak(text);
  console.log('[TTS]', text);
}

/**
 * Stops speaking (if TTS is active)
 */
export function stopSpeaking() {
  // Example: Speech.stop();
  console.log('[TTS stopped]');
}
