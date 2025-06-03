import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Check, Clock, X } from 'lucide-react-native';
import Text from '@/components/typography/Text';
import Card from '@/components/Card';
import StatusPill from '@/components/StatusPill';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { Medication, MedicationLog } from '@/types';

interface MedicationCardProps {
  medication: Medication;
  lastLog?: MedicationLog;
  onPress?: () => void;
}

export default function MedicationCard({ medication, lastLog, onPress }: MedicationCardProps) {
  // Get next scheduled time
  const getNextScheduledTime = () => {
    if (!medication.schedule || medication.schedule.length === 0) {
      return null;
    }
    
    // For the MVP, simply return the first scheduled time
    return medication.schedule[0].time;
  };

  const nextTime = getNextScheduledTime();
  
  // Determine status
  const getStatus = () => {
    if (!lastLog) return 'upcoming';
    
    return lastLog.status === 'taken' ? 'taken' : 'missed';
  };
  
  const status = getStatus();

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.content}>
          <View style={styles.imageContainer}>
            {medication.imageUri ? (
              <Image source={{ uri: medication.imageUri }} style={styles.image} />
            ) : (
              <View style={styles.placeholderImage} />
            )}
          </View>
          
          <View style={styles.details}>
            <Text variant="h3" bold numberOfLines={1}>
              {medication.name}
            </Text>
            <Text variant="body" numberOfLines={1}>
              {medication.dosage}
            </Text>
            
            {nextTime && (
              <View style={styles.timeContainer}>
                <Clock size={16} color={Colors.gray[500]} />
                <Text variant="bodySmall" color={Colors.gray[500]} style={styles.timeText}>
                  Next: {nextTime}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.statusContainer}>
            {status === 'taken' && (
              <StatusPill
                type="success"
                label="Taken"
              />
            )}
            {status === 'missed' && (
              <StatusPill
                type="error"
                label="Missed"
              />
            )}
            {status === 'upcoming' && (
              <StatusPill
                type="info"
                label="Upcoming"
              />
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: Spacing.md,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: Colors.gray[200],
  },
  details: {
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  timeText: {
    marginLeft: Spacing.xxs,
  },
  statusContainer: {
    paddingLeft: Spacing.sm,
  },
});