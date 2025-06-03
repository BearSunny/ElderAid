import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, X } from 'lucide-react-native';
import Text from '@/components/typography/Text';
import Button from '@/components/Button';
import Card from '@/components/Card';
import EmergencyContactCard from '@/components/EmergencyContactCard';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { FontSizes } from '@/constants/Fonts';
import { EmergencyContact } from '@/types';
import {
  getEmergencyContacts,
  addEmergencyContact,
  deleteEmergencyContact,
  getUserPreferences,
  saveUserPreferences,
} from '@/utils/storage';

interface UserPreferences {
  emergencyNumber: string;
  enableNotifications: boolean;
  enableLocationTracking: boolean;
  enableVoiceInteraction: boolean;
  darkMode: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    emergencyNumber: '911',
    enableNotifications: true,
    enableLocationTracking: true,
    enableVoiceInteraction: true,
    darkMode: false,
  });
  
  // Form state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelationship, setContactRelationship] = useState('');
  const [contactIsPrimary, setContactIsPrimary] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load contacts
    const contactsData = await getEmergencyContacts();
    setContacts(contactsData);
    
    // Load preferences
    const prefsData = await getUserPreferences<UserPreferences>();
    if (prefsData) {
      setPreferences(prefsData);
    }
  };

  const handleAddContact = async () => {
    if (!contactName.trim() || !contactPhone.trim() || !contactRelationship.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    // Create new contact
    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: contactName,
      phone: contactPhone,
      relationship: contactRelationship,
      isPrimary: contactIsPrimary || contacts.length === 0, // First contact is primary by default
    };

    // Save contact
    await addEmergencyContact(newContact);
    
    // Refresh list
    await loadData();
    
    // Reset form and close modal
    resetForm();
    setAddModalVisible(false);
  };

  const resetForm = () => {
    setContactName('');
    setContactPhone('');
    setContactRelationship('');
    setContactIsPrimary(false);
  };

  const handleDeleteContact = async (contactId: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            await deleteEmergencyContact(contactId);
            await loadData();
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleSetPrimaryContact = async (contact: EmergencyContact) => {
    const updatedContact = { ...contact, isPrimary: true };
    await addEmergencyContact(updatedContact);
    await loadData();
  };

  const updatePreference = async (key: keyof UserPreferences, value: any) => {
    const updatedPreferences = { ...preferences, [key]: value };
    setPreferences(updatedPreferences);
    await saveUserPreferences(updatedPreferences);
  };

  const renderToggleSetting = (
    label: string,
    value: boolean,
    onChange: (newValue: boolean) => void,
    description?: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text variant="bodyLarge" bold>
          {label}
        </Text>
        {description && (
          <Text variant="bodySmall" color={Colors.gray[500]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Colors.gray[300], true: Colors.primary[400] }}
        thumbColor={value ? Colors.primary[600] : Colors.gray[50]}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.gray[800]} />
        </TouchableOpacity>
        <Text variant="h2">Settings</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Emergency Contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h3">Emergency Contacts</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setAddModalVisible(true)}
            >
              <Plus size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
          
          {contacts.length === 0 ? (
            <Card>
              <View style={styles.emptyContacts}>
                <Text variant="body" center color={Colors.gray[500]}>
                  No emergency contacts added yet.
                </Text>
              </View>
            </Card>
          ) : (
            contacts.map(contact => (
              <EmergencyContactCard
                key={contact.id}
                contact={contact}
                onCall={() => {
                  // In a real app, this would call the contact
                  Alert.alert('Call', `Calling ${contact.name}...`);
                }}
                onDelete={() => handleDeleteContact(contact.id)}
                onSetPrimary={() => handleSetPrimaryContact(contact)}
              />
            ))
          )}
        </View>

        {/* General Settings */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>
            General Settings
          </Text>
          
          <Card>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text variant="bodyLarge" bold>
                  Emergency Number
                </Text>
                <Text variant="bodySmall" color={Colors.gray[500]}>
                  Number to call in emergencies
                </Text>
              </View>
              <TextInput
                style={styles.settingInput}
                value={preferences.emergencyNumber}
                onChangeText={(value) => updatePreference('emergencyNumber', value)}
                keyboardType="phone-pad"
              />
            </View>
            
            {renderToggleSetting(
              'Enable Notifications',
              preferences.enableNotifications,
              (value) => updatePreference('enableNotifications', value),
              'Medication and safety reminders'
            )}
            
            {renderToggleSetting(
              'Location Tracking',
              preferences.enableLocationTracking,
              (value) => updatePreference('enableLocationTracking', value),
              'Share location during emergencies'
            )}
            
            {renderToggleSetting(
              'Voice Interaction',
              preferences.enableVoiceInteraction,
              (value) => updatePreference('enableVoiceInteraction', value),
              'Enable voice commands and responses'
            )}
            
            {renderToggleSetting(
              'Dark Mode',
              preferences.darkMode,
              (value) => updatePreference('darkMode', value),
              'Use dark theme'
            )}
          </Card>
        </View>
        
        {/* About Section */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>
            About
          </Text>
          
          <Card>
            <Text variant="bodyLarge" bold style={styles.aboutTitle}>
              ElderAid
            </Text>
            <Text variant="body" style={styles.aboutText}>
              Version 1.0.0
            </Text>
            <Text variant="bodySmall" color={Colors.gray[500]} style={styles.aboutDescription}>
              ElderAid is designed to help families care for elderly individuals with Alzheimer's, providing medication management, emergency assistance, and memory support.
            </Text>
          </Card>
        </View>
      </ScrollView>
      
      {/* Add Contact Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setAddModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text variant="h2">Add Emergency Contact</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setAddModalVisible(false);
                  resetForm();
                }}
              >
                <X size={24} color={Colors.gray[600]} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text variant="bodyLarge" bold style={styles.label}>
                Name
              </Text>
              <TextInput
                style={styles.input}
                value={contactName}
                onChangeText={setContactName}
                placeholder="Contact name"
                placeholderTextColor={Colors.gray[400]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text variant="bodyLarge" bold style={styles.label}>
                Phone Number
              </Text>
              <TextInput
                style={styles.input}
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="Phone number"
                placeholderTextColor={Colors.gray[400]}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text variant="bodyLarge" bold style={styles.label}>
                Relationship
              </Text>
              <TextInput
                style={styles.input}
                value={contactRelationship}
                onChangeText={setContactRelationship}
                placeholder="e.g., Son, Daughter, Caregiver"
                placeholderTextColor={Colors.gray[400]}
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.checkboxContainer}>
                <Switch
                  value={contactIsPrimary}
                  onValueChange={setContactIsPrimary}
                  trackColor={{ false: Colors.gray[300], true: Colors.primary[400] }}
                  thumbColor={contactIsPrimary ? Colors.primary[600] : Colors.gray[50]}
                />
                <Text variant="body" style={styles.checkboxLabel}>
                  Set as primary contact
                </Text>
              </View>
              <Text variant="caption" color={Colors.gray[500]}>
                Primary contact will be called first in emergencies
              </Text>
            </View>

            <Button
              title="Add Contact"
              size="large"
              onPress={handleAddContact}
              style={styles.saveButton}
              fullWidth
            />
          </View>
        </View>
      </Modal>
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  addButton: {
    backgroundColor: Colors.primary[600],
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContacts: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  settingInfo: {
    flex: 1,
  },
  settingInput: {
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minWidth: 80,
    textAlign: 'center',
    fontSize: FontSizes.md,
  },
  aboutTitle: {
    marginBottom: Spacing.xs,
  },
  aboutText: {
    marginBottom: Spacing.md,
  },
  aboutDescription: {
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: Spacing.lg,
    elevation: 5,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  checkboxLabel: {
    marginLeft: Spacing.sm,
  },
  saveButton: {
    marginTop: Spacing.md,
  },
});