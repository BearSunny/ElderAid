import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Send, Mic, StopCircle } from 'lucide-react-native';
import Text from '@/components/typography/Text';
import ChatBubble from '@/components/ChatBubble';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { ChatMessage } from '@/types';
import { getChatMessages, addChatMessage, updateElderStatus } from '@/utils/storage';
import { generateBotResponse, speakText, stopSpeaking } from '@/utils/elderAI';
import { useRouter } from 'expo-router';

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    
    // Update the elder's status
    updateElderStatus({
      lastSeen: Date.now(),
    });

    // Add welcome message if no messages exist
    checkWelcomeMessage();
  }, []);

  const loadMessages = async () => {
    const chatMessages = await getChatMessages();
    setMessages(chatMessages);
  };

  const checkWelcomeMessage = async () => {
    const chatMessages = await getChatMessages();
    
    if (chatMessages.length === 0) {
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        text: "Hello! I'm your ElderAid assistant. I can help you with medications, show you memories, or call for help if needed. How can I assist you today?",
        sender: 'bot',
        timestamp: Date.now(),
      };
      
      await addChatMessage(welcomeMessage);
      setMessages([welcomeMessage]);
      
      // Speak the welcome message
      speakText(welcomeMessage.text);
      setIsSpeaking(true);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Create user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: Date.now(),
    };

    // Add to state and storage
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    await addChatMessage(userMessage);
    setInputText('');

    // Update elder status
    updateElderStatus({
      lastSeen: Date.now(),
      lastChatInteraction: {
        message: inputText,
        timestamp: Date.now(),
      },
    });

    // Generate bot response
    const botResponse = await generateBotResponse(inputText, updatedMessages);
    
    // Create bot message
    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: botResponse.text,
      sender: 'bot',
      timestamp: Date.now() + 1,
      hasMedia: botResponse.hasMedia,
      mediaUri: botResponse.mediaUri,
      mediaType: botResponse.mediaType,
    };

    // Add bot message
    const finalMessages = [...updatedMessages, botMessage];
    setMessages(finalMessages);
    await addChatMessage(botMessage);

    // Handle special actions
    if (botResponse.action) {
      handleBotAction(botResponse.action);
    }
    
    // Speak the bot response
    speakText(botResponse.text);
    setIsSpeaking(true);
  };

  const handleBotAction = (action: string) => {
    // Implement specific actions based on bot response
    switch (action) {
      case 'emergency':
        // Could navigate to emergency screen
        setTimeout(() => {
          router.push('/emergency');
        }, 2000);
        break;
      case 'medication':
        // Could navigate to medication screen
        setTimeout(() => {
          router.push('/medication');
        }, 2000);
        break;
      case 'memory':
        // Could navigate to memories screen
        setTimeout(() => {
          router.push('/memories');
        }, 2000);
        break;
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      // Stop recording and process voice input
      setIsRecording(false);
      // For MVP, we'll simulate voice recognition
      setInputText('Show me a memory from last summer');
    } else {
      // Start recording
      setIsRecording(true);
      // For MVP, we're just simulating this functionality
    }
  };

  const handleSpeechToggle = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      // Get last bot message and speak it
      const lastBotMessage = [...messages]
        .reverse()
        .find(m => m.sender === 'bot');
        
      if (lastBotMessage) {
        speakText(lastBotMessage.text);
        setIsSpeaking(true);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.header}>
        <Text variant="h2">Chat Assistant</Text>
        <TouchableOpacity 
          style={styles.speakButton} 
          onPress={handleSpeechToggle}
        >
          {isSpeaking ? (
            <StopCircle size={24} color={Colors.error[500]} />
          ) : (
            <Mic size={24} color={Colors.primary[600]} />
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatBubble 
            message={item} 
            onImagePress={() => {
              // Handle image viewing, e.g. open fullscreen
              if (item.mediaType === 'image' && item.mediaUri) {
                // In a real app, this would open an image viewer
              }
            }}
          />
        )}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={Colors.gray[400]}
          multiline
        />
        <TouchableOpacity
          style={styles.voiceButton}
          onPress={handleVoiceToggle}
        >
          {isRecording ? (
            <StopCircle size={24} color={Colors.error[500]} />
          ) : (
            <Mic size={24} color={Colors.gray[500]} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Send size={24} color={inputText.trim() ? Colors.white : Colors.gray[400]} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  speakButton: {
    padding: Spacing.sm,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  messageListContent: {
    paddingVertical: Spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  input: {
    flex: 1,
    backgroundColor: Colors.gray[100],
    borderRadius: 24,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    maxHeight: 100,
  },
  voiceButton: {
    padding: Spacing.md,
    marginLeft: Spacing.sm,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray[300],
  },
});