import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medication, MedicationLog, ChatMessage, Memory, EmergencyContact, ElderStatus } from '@/types';

// Keys for storage
const KEYS = {
  MEDICATIONS: '@ElderAid:medications',
  MEDICATION_LOGS: '@ElderAid:medication-logs',
  CHAT_MESSAGES: '@ElderAid:chat-messages',
  MEMORIES: '@ElderAid:memories',
  EMERGENCY_CONTACTS: '@ElderAid:emergency-contacts',
  ELDER_STATUS: '@ElderAid:elder-status',
  USER_PREFERENCES: '@ElderAid:user-preferences',
};

// Generic storage helpers
async function storeData<T>(key: string, value: T): Promise<void> {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error saving data:', e);
  }
}

async function getData<T>(key: string): Promise<T | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error reading data:', e);
    return null;
  }
}

// Medications
export async function saveMedications(medications: Medication[]): Promise<void> {
  return storeData(KEYS.MEDICATIONS, medications);
}

export async function getMedications(): Promise<Medication[]> {
  return (await getData<Medication[]>(KEYS.MEDICATIONS)) || [];
}

export async function saveMedication(medication: Medication): Promise<void> {
  const medications = await getMedications();
  const existingIndex = medications.findIndex(m => m.id === medication.id);
  
  if (existingIndex >= 0) {
    medications[existingIndex] = medication;
  } else {
    medications.push(medication);
  }
  
  return saveMedications(medications);
}

export async function deleteMedication(id: string): Promise<void> {
  const medications = await getMedications();
  const updatedMedications = medications.filter(m => m.id !== id);
  return saveMedications(updatedMedications);
}

// Medication Logs
export async function saveMedicationLogs(logs: MedicationLog[]): Promise<void> {
  return storeData(KEYS.MEDICATION_LOGS, logs);
}

export async function getMedicationLogs(): Promise<MedicationLog[]> {
  return (await getData<MedicationLog[]>(KEYS.MEDICATION_LOGS)) || [];
}

export async function addMedicationLog(log: MedicationLog): Promise<void> {
  const logs = await getMedicationLogs();
  logs.push(log);
  return saveMedicationLogs(logs);
}

// Chat Messages
export async function saveChatMessages(messages: ChatMessage[]): Promise<void> {
  return storeData(KEYS.CHAT_MESSAGES, messages);
}

export async function getChatMessages(): Promise<ChatMessage[]> {
  return (await getData<ChatMessage[]>(KEYS.CHAT_MESSAGES)) || [];
}

export async function addChatMessage(message: ChatMessage): Promise<void> {
  const messages = await getChatMessages();
  messages.push(message);
  return saveChatMessages(messages);
}

// Memories
export async function saveMemories(memories: Memory[]): Promise<void> {
  return storeData(KEYS.MEMORIES, memories);
}

export async function getMemories(): Promise<Memory[]> {
  return (await getData<Memory[]>(KEYS.MEMORIES)) || [];
}

export async function addMemory(memory: Memory): Promise<void> {
  const memories = await getMemories();
  memories.push(memory);
  return saveMemories(memories);
}

export async function deleteMemory(id: string): Promise<void> {
  const memories = await getMemories();
  const updatedMemories = memories.filter(m => m.id !== id);
  return saveMemories(updatedMemories);
}

// Emergency Contacts
export async function saveEmergencyContacts(contacts: EmergencyContact[]): Promise<void> {
  return storeData(KEYS.EMERGENCY_CONTACTS, contacts);
}

export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  return (await getData<EmergencyContact[]>(KEYS.EMERGENCY_CONTACTS)) || [];
}

export async function addEmergencyContact(contact: EmergencyContact): Promise<void> {
  const contacts = await getEmergencyContacts();
  
  // If this is set as primary, remove primary flag from other contacts
  if (contact.isPrimary) {
    contacts.forEach(c => {
      if (c.id !== contact.id) {
        c.isPrimary = false;
      }
    });
  }
  
  const existingIndex = contacts.findIndex(c => c.id === contact.id);
  
  if (existingIndex >= 0) {
    contacts[existingIndex] = contact;
  } else {
    contacts.push(contact);
  }
  
  return saveEmergencyContacts(contacts);
}

export async function deleteEmergencyContact(id: string): Promise<void> {
  const contacts = await getEmergencyContacts();
  const updatedContacts = contacts.filter(c => c.id !== id);
  return saveEmergencyContacts(updatedContacts);
}

// Elder Status
export async function saveElderStatus(status: ElderStatus): Promise<void> {
  return storeData(KEYS.ELDER_STATUS, status);
}

export async function getElderStatus(): Promise<ElderStatus | null> {
  return getData<ElderStatus>(KEYS.ELDER_STATUS);
}

export async function updateElderStatus(updatedFields: Partial<ElderStatus>): Promise<void> {
  const currentStatus = await getElderStatus() || { lastSeen: Date.now() };
  const newStatus = { ...currentStatus, ...updatedFields, lastSeen: Date.now() };
  return saveElderStatus(newStatus);
}

// User Preferences
export async function getUserPreferences<T>(): Promise<T | null> {
  return getData<T>(KEYS.USER_PREFERENCES);
}

export async function saveUserPreferences<T>(preferences: T): Promise<void> {
  return storeData(KEYS.USER_PREFERENCES, preferences);
}