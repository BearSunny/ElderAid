import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import Text from '@/components/typography/Text';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { ChatMessage } from '@/types';

interface ChatBubbleProps {
  message: ChatMessage;
  onImagePress?: () => void;
}

export default function ChatBubble({ message, onImagePress }: ChatBubbleProps) {
  const isUserMessage = message.sender === 'user';

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View
      style={[
        styles.container,
        isUserMessage ? styles.userContainer : styles.botContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUserMessage ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text
          variant="body"
          style={styles.messageText}
          color={isUserMessage ? Colors.white : Colors.gray[800]}
        >
          {message.message}
        </Text>
        
        {message.hasMedia && message.mediaUri && message.mediaType === 'image' && (
          <TouchableOpacity 
            onPress={onImagePress} 
            style={styles.mediaContainer}
            activeOpacity={0.8}
          >
            <Image source={{ uri: message.mediaUri }} style={styles.image} />
          </TouchableOpacity>
        )}

        <Text
          variant="caption"
          style={styles.timestamp}
          color={isUserMessage ? Colors.primary[100] : Colors.gray[400]}
        >
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  botContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 20,
    padding: Spacing.md,
  },
  userBubble: {
    backgroundColor: Colors.primary[600],
  },
  botBubble: {
    backgroundColor: Colors.gray[200],
  },
  messageText: {
    marginBottom: Spacing.xs,
  },
  timestamp: {
    alignSelf: 'flex-end',
    marginTop: Spacing.xxs,
  },
  mediaContainer: {
    marginVertical: Spacing.xs,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginVertical: Spacing.xs,
  },
});