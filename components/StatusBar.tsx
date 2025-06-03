import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Battery, MapPin, Pill, MessageSquare } from 'lucide-react-native';
import Text from '@/components/typography/Text';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { ElderStatus } from '@/types';

interface StatusBarProps {
  status?: ElderStatus;
}

export default function StatusBar({ status }: StatusBarProps) {
  if (!status) {
    return null;
  }

  // Format time difference
  const formatTimeSince = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h ago`;
    } else {
      return `${Math.floor(diffMins / 1440)}d ago`;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusItem}>
        <MapPin size={16} color={Colors.gray[600]} />
        <Text variant="bodySmall" style={styles.statusText} numberOfLines={1}>
          {status.lastLocation ? 
            (status.lastLocation.address || 'Location available') : 
            'No location data'}
        </Text>
        {status.lastSeen && (
          <Text variant="caption" style={styles.timeText}>
            {formatTimeSince(status.lastSeen)}
          </Text>
        )}
      </View>
      
      {status.lastMedicationTaken && (
        <View style={styles.statusItem}>
          <Pill size={16} color={Colors.gray[600]} />
          <Text variant="bodySmall" style={styles.statusText} numberOfLines={1}>
            {status.lastMedicationTaken.name}
          </Text>
          <Text variant="caption" style={styles.timeText}>
            {formatTimeSince(status.lastMedicationTaken.timestamp)}
          </Text>
        </View>
      )}
      
      {status.lastChatInteraction && (
        <View style={styles.statusItem}>
          <MessageSquare size={16} color={Colors.gray[600]} />
          <Text variant="caption" style={styles.timeText}>
            {formatTimeSince(status.lastChatInteraction.timestamp)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: Spacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
    flex: 1,
  },
  statusText: {
    marginLeft: Spacing.xs,
    flex: 1,
  },
  timeText: {
    color: Colors.gray[500],
    marginLeft: Spacing.xxs,
  },
});