import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings, MapPin, Clock, Phone, Pill } from 'lucide-react-native';
import Text from '@/components/typography/Text';
import Card from '@/components/Card';
import StatusBar from '@/components/StatusBar';
import MedicationCard from '@/components/MedicationCard';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { getMedications, getMedicationLogs, getElderStatus } from '@/utils/storage';
import { Medication, MedicationLog, ElderStatus } from '@/types';

export default function FamilyDashboard() {
  const router = useRouter();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [elderStatus, setElderStatus] = useState<ElderStatus | null>(null);
  const [recentMeds, setRecentMeds] = useState<
    { medication: Medication; log?: MedicationLog }[]
  >([]);

  useEffect(() => {
    loadData();
    
    // In a real app, this would use websockets or periodic polling
    const interval = setInterval(() => {
      loadData();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    // Load elder status
    const status = await getElderStatus();
    setElderStatus(status);
    
    // Load medications
    const medsData = await getMedications();
    setMedications(medsData);

    // Load medication logs
    const logsData = await getMedicationLogs();
    setMedicationLogs(logsData);
    
    // Process recent medications
    processRecentMedications(medsData, logsData);
  };

  const processRecentMedications = (meds: Medication[], logs: MedicationLog[]) => {
    // Sort logs by timestamp (newest first)
    const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);
    
    // Get unique medication IDs from recent logs (last 24 hours)
    const oneDayAgo = Date.now() - 86400000; // 24 hours in milliseconds
    const recentLogs = sortedLogs.filter(log => log.timestamp > oneDayAgo);
    
    // Map medications with their latest logs
    const medMap = new Map<string, MedicationLog>();
    recentLogs.forEach(log => {
      if (!medMap.has(log.medicationId)) {
        medMap.set(log.medicationId, log);
      }
    });
    
    // Create the list of recent medications with logs
    const recent = meds
      .filter(med => medMap.has(med.id))
      .map(med => ({
        medication: med,
        log: medMap.get(med.id),
      }));
    
    setRecentMeds(recent);
  };

  const formatLastSeen = (timestamp: number) => {
    const now = Date.now();
    const diffMinutes = Math.floor((now - timestamp) / 60000);
    
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffMinutes / 1440)}d ago`;
    }
  };

  const handleEmergency = () => {
    // In a real app, this would initiate an emergency call to the elder
    Alert.alert(
      'Emergency Contact',
      'In a full implementation, this would initiate an emergency call to the elder.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text variant="h2">Family Dashboard</Text>
          {elderStatus && (
            <Text variant="bodySmall" color={Colors.gray[600]}>
              Last activity: {formatLastSeen(elderStatus.lastSeen)}
            </Text>
          )}
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={handleEmergency}
          >
            <Phone size={20} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/family/settings')}
          >
            <Settings size={24} color={Colors.gray[700]} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <StatusBar status={elderStatus ?? undefined} />
        
        {/* Status Dashboard */}
        <Card style={styles.dashboardCard}>
          <Text variant="h3" style={styles.cardTitle}>
            Status Overview
          </Text>
          
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Clock size={24} color={Colors.primary[600]} />
              <Text variant="bodyLarge" bold style={styles.statusLabel}>
                Activity
              </Text>
              <Text variant="body">
                {elderStatus ? formatLastSeen(elderStatus.lastSeen) : 'Unknown'}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <MapPin size={24} color={Colors.primary[600]} />
              <Text variant="bodyLarge" bold style={styles.statusLabel}>
                Location
              </Text>
              <Text variant="body" numberOfLines={2} style={styles.statusValue}>
                {elderStatus?.lastLocation?.address || 'Unknown location'}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <Pill size={24} color={Colors.primary[600]} />
              <Text variant="bodyLarge" bold style={styles.statusLabel}>
                Medication
              </Text>
              <Text variant="body" numberOfLines={2} style={styles.statusValue}>
                {elderStatus?.lastMedicationTaken 
                  ? `${elderStatus.lastMedicationTaken.name} taken`
                  : 'No recent medication'}
              </Text>
              {elderStatus?.lastMedicationTaken && (
                <Text variant="caption" color={Colors.gray[500]}>
                  {formatLastSeen(elderStatus.lastMedicationTaken.timestamp)}
                </Text>
              )}
            </View>
          </View>
        </Card>
        
        {/* Recent Medications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h3">Recent Medications</Text>
          </View>
          
          {recentMeds.length === 0 ? (
            <View style={styles.emptySection}>
              <Text variant="body" color={Colors.gray[500]}>
                No recent medication activity
              </Text>
            </View>
          ) : (
            recentMeds.map(({ medication, log }) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                lastLog={log}
              />
            ))
          )}
        </View>
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
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    padding: Spacing.sm,
  },
  emergencyButton: {
    backgroundColor: Colors.error[600],
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  dashboardCard: {
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    marginBottom: Spacing.md,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusItem: {
    width: '48%',
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  statusLabel: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xxs,
  },
  statusValue: {
    marginBottom: Spacing.xxs,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptySection: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: 16,
    alignItems: 'center',
  },
});