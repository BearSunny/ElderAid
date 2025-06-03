import React from 'react';
import { StyleSheet, Image, TouchableOpacity, View, Dimensions } from 'react-native';
import Text from '@/components/typography/Text';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { Memory } from '@/types';

interface MemoryCardProps {
  memory: Memory;
  onPress?: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - Spacing.lg * 1.5;

export default function MemoryCard({ memory, onPress }: MemoryCardProps) {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.card}>
        <Image 
          source={{ uri: memory.imageUri }} 
          style={styles.image}
          resizeMode="cover" 
        />
        <View style={styles.overlay}>
          <Text variant="bodySmall" color={Colors.white} numberOfLines={2} style={styles.caption}>
            {memory.caption}
          </Text>
          <Text variant="caption" color={Colors.gray[300]} style={styles.date}>
            {new Date(memory.timestamp).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: Spacing.md,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.gray[200],
  },
  image: {
    width: '100%',
    height: CARD_WIDTH,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: Spacing.sm,
  },
  caption: {
    marginBottom: Spacing.xxs,
  },
  date: {
    marginTop: Spacing.xxs,
  },
});