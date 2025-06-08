import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Linking,
  Alert,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Phone, ArrowLeft, MapPin } from 'lucide-react-native';
import * as Location from 'expo-location';
import Text from '@/components/typography/Text';
import Button from '@/components/Button';
import EmergencyContactCard from '@/components/EmergencyContactCard';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { EmergencyContact } from '@/types';
import { 
  getEmergencyContacts, 
  updateElderStatus,
} from '@/utils/storage';

export default function EmergencyScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);

  useEffect(() => {
    loadContacts();
    getCurrentLocation();
    
    // Update elder status
    updateElderStatus();
  }, []);

  const loadContacts = async () => {
    const contactsData = await getEmergencyContacts();
    setContacts(contactsData);
  };

  const getCurrentLocation = async () => {
    const hasPermission = await Location.requestForegroundPermissionsAsync();
    
    if (!hasPermission.granted) {
      Alert.alert(
        'Location Access Required',
        'Location is needed to share with emergency contacts.'
      );
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      
      // Try to get address
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      const addressStr = address 
        ? `${address.street || ''}, ${address.city || ''}, ${address.region || ''}`
        : undefined;
      
      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: addressStr,
      };
      
      setLocation(locationData);
      
      // Update elder status with location
      await updateElderStatus();
      
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  const handleEmergencyServices = () => {
    Alert.alert(
      'Call Emergency Services',
      'Are you sure you want to call emergency services (911)?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Call 911',
          onPress: () => makeEmergencyCall('911'),
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleCallContact = (contact: EmergencyContact) => {
    Alert.alert(
      `Call ${contact.name}`,
      `Are you sure you want to call ${contact.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: `Call ${contact.name}`,
          onPress: () => makeEmergencyCall(contact.phone),
        },
      ]
    );
  };
  
  const makeEmergencyCall = (number: string) => {
    // Share location with contacts
    if (location) {
      // In a real app, this would send the location to emergency contacts
      console.log('Sharing location with contacts:', location);
    }
    
    const phoneNumber = Platform.select({
      ios: `telprompt:${number}`,
      android: `tel:${number}`,
      default: `tel:${number}`,
    });
    
    Linking.openURL(phoneNumber).catch(err => {
      console.error('Failed to make call', err);
      Alert.alert('Error', 'Could not make phone call. Please try again.');
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.gray[800]} />
        </TouchableOpacity>
        <Text variant="h2">Emergency Help</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.emergencyButtonContainer}>
          <Text variant="h2" center style={styles.emergencyTitle}>
            Need Help?
          </Text>
          
          <Button
            title="Call Emergency Services (911)"
            size="xlarge"
            variant="danger"
            icon={<Phone size={32} color={Colors.white} />}
            onPress={handleEmergencyServices}
            style={styles.emergencyButton}
            fullWidth
          />
          
          {location && (
            <View style={styles.locationContainer}>
              <View style={styles.locationHeader}>
                <MapPin size={20} color={Colors.gray[700]} />
                <Text variant="body" bold style={styles.locationTitle}>
                  Your Current Location:
                </Text>
              </View>
              <Text variant="body" style={styles.locationAddress}>
                {location.address || 'Location data available'}
              </Text>
              <Text variant="caption" color={Colors.gray[500]}>
                This location will be shared when you call for help
              </Text>
            </View>
          )}
        </View>

        {contacts.length > 0 && (
          <View style={styles.contactsSection}>
            <Text variant="h3" style={styles.contactsTitle}>
              Emergency Contacts
            </Text>
            
            {contacts.map(contact => (
              <EmergencyContactCard
                key={contact.id}
                contact={contact}
                onCall={() => handleCallContact(contact)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
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
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  emergencyButtonContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  emergencyTitle: {
    marginBottom: Spacing.lg,
    color: Colors.error[700],
  },
  emergencyButton: {
    marginBottom: Spacing.lg,
  },
  locationContainer: {
    backgroundColor: Colors.gray[100],
    padding: Spacing.md,
    borderRadius: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  locationTitle: {
    marginLeft: Spacing.xs,
  },
  locationAddress: {
    marginBottom: Spacing.sm,
  },
  contactsSection: {
    marginBottom: Spacing.xl,
  },
  contactsTitle: {
    marginBottom: Spacing.md,
  },
});