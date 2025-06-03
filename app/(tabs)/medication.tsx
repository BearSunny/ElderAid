import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { Plus, X, Camera, Calendar, Clock } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Text from '@/components/typography/Text';
import Button from '@/components/Button';
import MedicationCard from '@/components/MedicationCard';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { FontSizes } from '@/constants/Fonts';
import { Medication, MedicationLog } from '@/types';
import { 
  getMedications, 
  saveMedication, 
  getMedicationLogs, 
  addMedicationLog,
  updateElderStatus,
} from '@/utils/storage';
import { requestCameraPermissions } from '@/utils/permissions';
import { scheduleMedicationReminder } from '@/utils/notifications';

export default function MedicationScreen() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('08:00');
  const [days, setDays] = useState<string[]>(['daily']);
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
    
    // Update the elder's status
    updateElderStatus({
      lastSeen: Date.now(),
    });
  }, []);

  const loadData = async () => {
    const medsData = await getMedications();
    setMedications(medsData);

    const logsData = await getMedicationLogs();
    setMedicationLogs(logsData);
  };

  const handleAddMedication = async () => {
    if (!name.trim() || !dosage.trim()) {
      Alert.alert('Missing Information', 'Please enter a medication name and dosage.');
      return;
    }

    // Create new medication
    const newMedication: Medication = {
      id: Date.now().toString(),
      name,
      dosage,
      schedule: [
        {
          time,
          days: days,
        },
      ],
      imageUri,
      notes,
    };

    // Save medication
    await saveMedication(newMedication);
    
    // Schedule notification reminders
    await scheduleMedicationReminder(newMedication, time, days);
    
    // Refresh list
    await loadData();
    
    // Reset form and close modal
    resetForm();
    setModalVisible(false);
  };

  const resetForm = () => {
    setName('');
    setDosage('');
    setTime('08:00');
    setDays(['daily']);
    setImageUri(undefined);
    setNotes('');
  };

  const handleTakeMedication = async (medication: Medication) => {
    // Create log entry
    const log: MedicationLog = {
      id: Date.now().toString(),
      medicationId: medication.id,
      status: 'taken',
      timestamp: Date.now(),
      scheduledTime: medication.schedule[0].time,
    };
    
    await addMedicationLog(log);
    
    // Update elder status
    await updateElderStatus({
      lastMedicationTaken: {
        name: medication.name,
        timestamp: Date.now(),
      },
    });
    
    // Refresh data
    await loadData();
    
    // Show confirmation
    Alert.alert('Medication Taken', `${medication.name} has been marked as taken.`);
  };

  const handleMissMedication = async (medication: Medication) => {
    // Create log entry
    const log: MedicationLog = {
      id: Date.now().toString(),
      medicationId: medication.id,
      status: 'missed',
      timestamp: Date.now(),
      scheduledTime: medication.schedule[0].time,
    };
    
    await addMedicationLog(log);
    
    // Refresh data
    await loadData();
    
    // Show confirmation
    Alert.alert('Medication Missed', `${medication.name} has been marked as missed.`);
  };

  const takePicture = async () => {
    const hasPermission = await requestCameraPermissions();
    
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Camera permission is needed to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const getLastLogForMedication = (medicationId: string): MedicationLog | undefined => {
    return medicationLogs
      .filter(log => log.medicationId === medicationId)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
  };

  const renderMedicationCard = ({ item }: { item: Medication }) => (
    <View style={styles.medicationCardContainer}>
      <MedicationCard
        medication={item}
        lastLog={getLastLogForMedication(item.id)}
        onPress={() => showMedicationDetails(item)}
      />
    </View>
  );

  const showMedicationDetails = (medication: Medication) => {
    Alert.alert(
      medication.name,
      `Dosage: ${medication.dosage}\n${medication.notes || ''}`,
      [
        {
          text: 'Taken',
          onPress: () => handleTakeMedication(medication),
          style: 'default',
        },
        {
          text: 'Missed',
          onPress: () => handleMissMedication(medication),
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="h2">Medications</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {medications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text variant="h3" center style={styles.emptyTitle}>
            No Medications
          </Text>
          <Text variant="body" center color={Colors.gray[500]} style={styles.emptyText}>
            Tap the + button to add your medications and set reminders.
          </Text>
          <Button
            title="Add Medication"
            size="large"
            onPress={() => setModalVisible(true)}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <FlatList
          data={medications}
          renderItem={renderMedicationCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.medicationList}
        />
      )}

      {/* Add Medication Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text variant="h2">Add Medication</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <X size={24} color={Colors.gray[600]} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text variant="bodyLarge" bold style={styles.label}>
                Medication Name
              </Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter medication name"
                placeholderTextColor={Colors.gray[400]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text variant="bodyLarge" bold style={styles.label}>
                Dosage
              </Text>
              <TextInput
                style={styles.input}
                value={dosage}
                onChangeText={setDosage}
                placeholder="e.g., 10mg, 1 tablet"
                placeholderTextColor={Colors.gray[400]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text variant="bodyLarge" bold style={styles.label}>
                Time
              </Text>
              <View style={styles.inputWithIcon}>
                <Clock size={24} color={Colors.gray[500]} style={styles.inputIcon} />
                <TextInput
                  style={styles.iconInput}
                  value={time}
                  onChangeText={setTime}
                  placeholder="08:00"
                  placeholderTextColor={Colors.gray[400]}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <Text variant="caption" color={Colors.gray[500]}>
                Enter time in 24-hour format (HH:MM)
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text variant="bodyLarge" bold style={styles.label}>
                Take a Photo
              </Text>
              <Button
                title="Take Photo of Medication"
                variant="outline"
                icon={<Camera size={20} color={Colors.primary[600]} />}
                onPress={takePicture}
                style={styles.photoButton}
              />
              {imageUri && (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setImageUri(undefined)}
                  >
                    <X size={20} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text variant="bodyLarge" bold style={styles.label}>
                Notes (Optional)
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any special instructions..."
                placeholderTextColor={Colors.gray[400]}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <Button
              title="Save Medication"
              size="large"
              onPress={handleAddMedication}
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
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  addButton: {
    backgroundColor: Colors.primary[600],
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    marginTop: Spacing.lg,
  },
  medicationList: {
    padding: Spacing.lg,
  },
  medicationCardContainer: {
    marginBottom: Spacing.md,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    paddingLeft: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  iconInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
  },
  photoButton: {
    marginTop: Spacing.sm,
  },
  imagePreviewContainer: {
    marginTop: Spacing.md,
    position: 'relative',
    alignSelf: 'flex-start',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: 100,
    height: 100,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
});