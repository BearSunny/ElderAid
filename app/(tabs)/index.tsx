import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Linking, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageSquare, PillIcon, Album, Phone } from 'lucide-react-native';
import Text from '@/components/typography/Text';
import Button from '@/components/Button';
import MenuButton from '@/components/MenuButton';
import MedicationCard from '@/components/MedicationCard';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { getMedications, getMedicationLogs, getEmergencyContacts, updateElderStatus } from '@/utils/storage';
import { Medication, MedicationLog, EmergencyContact } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [todaysMedications, setTodaysMedications] = useState<
    { medication: Medication; log?: MedicationLog }[]
  >([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);

  useEffect(() => {
    loadData();
    
    // Update the elder's status
    updateElderStatus();
  }, []);

  const loadData = async () => {
    // Load medications
    const medsData = await getMedications();
    setMedications(medsData);

    // Load medication logs
    const logsData = await getMedicationLogs();
    setMedicationLogs(logsData);

    // Load emergency contacts
    const contactsData = await getEmergencyContacts();
    setEmergencyContacts(contactsData);

    // Process today's medications
    processTodaysMedications(medsData, logsData);
  };

  const processTodaysMedications = (meds: Medication[], logs: MedicationLog[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter logs for today
    const todayLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });
    
    // Create list of today's medications with latest logs
    const todaysMeds = meds.map(med => {
      const medLogs = todayLogs.filter(log => log.medicationId === med.id);
      const latestLog = medLogs.sort((a, b) => b.timestamp - a.timestamp)[0];
      
      return {
        medication: med,
        log: latestLog,
      };
    });
    
    setTodaysMedications(todaysMeds.slice(0, 50)); // Show only the first 3
  };

  const handleEmergencyCall = async () => {
    // Get primary contact or first contact
    const primaryContact = emergencyContacts.find(c => c.isPrimary) || emergencyContacts[0];
    
    // If we have contacts, show options dialog
    if (emergencyContacts.length > 0) {
      Alert.alert(
        'Emergency Call',
        'Who would you like to call?',
        [
          {
            text: 'Emergency Services (911)',
            onPress: () => makeEmergencyCall('911'),
            style: 'default',
          },
          {
            text: primaryContact ? `${primaryContact.name} (${primaryContact.phone})` : 'Cancel',
            onPress: () => primaryContact ? makeEmergencyCall(primaryContact.phone) : null,
          },
        ],
        { cancelable: true }
      );
    } else {
      // No contacts, call emergency services directly
      makeEmergencyCall('911');
    }
  };
  
  const makeEmergencyCall = (number: string) => {
    // Update status before making call
    updateElderStatus();
    
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
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text variant="h1" style={styles.title}>ElderAid</Text>
          <Text variant="bodyLarge">Hello there!</Text>
        </View>

        <View style={styles.menuGrid}>
          <View style={styles.menuRow}>
            <MenuButton
              title="Chat"
              icon={<MessageSquare size={40} color={Colors.white} />}
              color={Colors.primary[600]}
              route="/chat"
              style={styles.menuButton}
            />
            <MenuButton
              title="Medication"
              icon={<PillIcon size={40} color={Colors.white} />}
              color={Colors.secondary[600]}
              route="/medication"
              style={styles.menuButton}
            />
          </View>
          <View style={styles.menuRow}>
            <MenuButton
              title="Emergency"
              icon={<Phone size={40} color={Colors.white} />}
              color={Colors.error[600]}
              onPress={handleEmergencyCall}
              style={styles.menuButton}
            />
            <MenuButton
              title="Memories"
              icon={<Album size={40} color={Colors.white} />}
              color={Colors.accent[500]}
              route="/memories"
              style={styles.menuButton}
            />
          </View>
        </View>
        
        {todaysMedications.length > 0 && (
          <View style={styles.medicationSection}>
            <Text variant="h2" style={styles.sectionTitle}>Today's Medications</Text>
            {todaysMedications.map(({ medication, log }) => (
              <MedicationCard 
                key={medication.id} 
                medication={medication} 
                lastLog={log}
                onPress={() => router.push('/medication')}
              />
            ))}
          </View>
        )}
        
        <Button 
          title="View All Medications" 
          variant="outline"
          onPress={() => router.push('/medication')}
          fullWidth
          style={styles.viewAllButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    minHeight: height,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
    color: Colors.primary[800],
    fontSize: width * 0.05,
  },
  menuGrid: {
    marginBottom: Spacing.xl,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  menuButton: {
    width: width * 0.45,
  },
  medicationSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  viewAllButton: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
});