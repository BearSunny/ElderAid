import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Phone, Star, Trash } from 'lucide-react-native';
import Text from '@/components/typography/Text';
import Card from '@/components/Card';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { EmergencyContact } from '@/types';

interface EmergencyContactCardProps {
  contact: EmergencyContact;
  onCall?: () => void;
  onDelete?: () => void;
  onSetPrimary?: () => void;
}

export default function EmergencyContactCard({
  contact,
  onCall,
  onDelete,
  onSetPrimary,
}: EmergencyContactCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text variant="h3" bold>
              {contact.name}
            </Text>
            {contact.isPrimary && (
              <Star size={16} color={Colors.warning[500]} fill={Colors.warning[500]} />
            )}
          </View>
          <Text variant="body" color={Colors.gray[600]}>
            {contact.relationship}
          </Text>
          <Text variant="bodyLarge" style={styles.phone}>
            {contact.phone}
          </Text>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={onCall}
          >
            <Phone size={24} color={Colors.white} />
          </TouchableOpacity>
          
          {!contact.isPrimary && (
            <TouchableOpacity
              style={[styles.actionButton, styles.starButton]}
              onPress={onSetPrimary}
            >
              <Star size={24} color={Colors.warning[600]} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={onDelete}
          >
            <Trash size={24} color={Colors.error[600]} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  phone: {
    marginTop: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.xs,
  },
  callButton: {
    backgroundColor: Colors.success[500],
  },
  starButton: {
    backgroundColor: Colors.gray[200],
  },
  deleteButton: {
    backgroundColor: Colors.gray[200],
  },
});