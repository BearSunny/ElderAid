import { auth } from './firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { 
  getUserMedications, 
  getUserMedicationLogs, 
  getUserEmergencyContacts, 
  addMedication, 
  logMedicationTaken, 
  addEmergencyContact,
  removeEmergencyContact,
  updateUserLastSeen,
  getUserProfile,
  MedicationDocument,
  MedicationLogDocument,
  EmergencyContactDocument,
  UserProfile,
  saveChatMessage, 
  getUserChatHistory, 
  ChatMessageDocument 
} from './firestoreSetup';
import { Medication, MedicationLog, EmergencyContact, ChatMessage, ElderStatus } from '@/types';

// Helper function to convert Firestore documents to app types
const convertMedicationFromFirestore = (doc: MedicationDocument): Medication => ({
  id: doc.id,
  name: doc.name,
  dosage: doc.dosage,
  frequency: doc.frequency,
  instructions: doc.instructions || '',
  prescribedBy: doc.prescribedBy || '',
  startDate: doc.startDate.toMillis(),
  endDate: doc.endDate?.toMillis(),
  isActive: doc.isActive,
  schedule: Array.isArray(doc.schedule)
    ? doc.schedule.map((item: any) =>
        typeof item === 'object' && item !== null && 'time' in item && 'days' in item
          ? item
          : { time: '', days: Array.isArray(item) ? item : [] }
      )
    : [],
});

const convertMedicationLogFromFirestore = (doc: MedicationLogDocument): MedicationLog => ({
  id: doc.id,
  medicationId: doc.medicationId,
  timestamp: doc.timestamp.toMillis(),
  taken: doc.taken,
  notes: doc.notes,
  status: 'taken',
  scheduledTime: ''
});

const convertEmergencyContactFromFirestore = (doc: EmergencyContactDocument): EmergencyContact => ({
  id: doc.id,
  name: doc.name,
  phone: doc.phone,
  relationship: doc.relationship,
  isPrimary: doc.isPrimary,
});

const convertChatMessageFromFirestore = (doc: ChatMessageDocument): ChatMessage => ({
  id: doc.id,
  message: doc.message,
  action: undefined,
  sender: doc.sender as 'user' | 'bot',
  timestamp: doc.timestamp.toMillis(),
  response: doc.response,
  isEmergency: doc.isEmergency,
});

// Medication functions
export const getMedications = async (): Promise<Medication[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('No authenticated user found');
      return [];
    }
    
    const medications = await getUserMedications(user.uid);
    return medications.map(convertMedicationFromFirestore);
  } catch (error) {
    console.error('Error getting medications:', error);
    return [];
  }
};

export const saveMedication = async (medication: Omit<Medication, 'id'>): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }

    const medicationDoc: Omit<MedicationDocument, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: user.uid,
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency ?? '',
      instructions: medication.instructions,
      prescribedBy: medication.prescribedBy,
      startDate: new Date(medication.startDate) as any, // Will be converted to Timestamp
      endDate: medication.endDate ? new Date(medication.endDate) as any : undefined,
      isActive: medication.isActive,
      schedule: medication.schedule,
    };

    const id = await addMedication(medicationDoc);
    return id;
  } catch (error) {
    console.error('Error saving medication:', error);
    return null;
  }
};

// Medication log functions
export const getMedicationLogs = async (): Promise<MedicationLog[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('No authenticated user found');
      return [];
    }
    
    const logs = await getUserMedicationLogs(user.uid);
    return logs.map(convertMedicationLogFromFirestore);
  } catch (error) {
    console.error('Error getting medication logs:', error);
    return [];
  }
};

export const saveMedicationLog = async (log: Omit<MedicationLog, 'id'>): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }

    const logDoc: Omit<MedicationLogDocument, 'id' | 'createdAt'> = {
      userId: user.uid,
      medicationId: log.medicationId,
      timestamp: new Date(log.timestamp) as any, // Will be converted to Timestamp
      taken: log.taken,
      notes: log.notes,
      reportedBy: user.uid,
    };

    const id = await logMedicationTaken(logDoc);
    return id;
  } catch (error) {
    console.error('Error saving medication log:', error);
    return null;
  }
};

// Emergency contact functions
export const getEmergencyContacts = async (): Promise<EmergencyContact[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('No authenticated user found');
      return [];
    }
    
    const contacts = await getUserEmergencyContacts(user.uid);
    return contacts.map(convertEmergencyContactFromFirestore);
  } catch (error) {
    console.error('Error getting emergency contacts:', error);
    return [];
  }
};

export const saveEmergencyContact = async (contact: Omit<EmergencyContact, 'id'>): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }

    const contactDoc: Omit<EmergencyContactDocument, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: user.uid,
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      isPrimary: contact.isPrimary,
    };

    const id = await addEmergencyContact(contactDoc);
    return id;
  } catch (error) {
    console.error('Error saving emergency contact:', error);
    return null;
  }
};

export const deleteEmergencyContact = async (contactId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user found');
    await removeEmergencyContact(user.uid, contactId); // You should have this Firestore helper
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
  }
};

export const getUserPreferences = async <T = any>(): Promise<T | null> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user found');
    const docRef = doc(db, 'users', user.uid, 'preferences', 'main');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as T;
    }
    return null;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
};

export const saveUserPreferences = async (preferences: any): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user found');
    const docRef = doc(db, 'users', user.uid, 'preferences', 'main');
    await setDoc(docRef, preferences, { merge: true });
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
};

// User status functions
export const updateElderStatus = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('No authenticated user found');
      return;
    }
    
    await updateUserLastSeen(user.uid);
  } catch (error) {
    console.error('Error updating elder status:', error);
  }
};

// Get current user profile
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    
    return await getUserProfile(user.uid);
  } catch (error) {
    console.error('Error getting current user profile:', error);
    return null;
  }
};

// Chat function
export const getChatMessages = async (): Promise<ChatMessage[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('No authenticated user found');
      return [];
    }

    const messages = await getUserChatHistory(user.uid);
    return messages.map(convertChatMessageFromFirestore);
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return [];
  }
};

export const addChatMessage = async (message: Omit<ChatMessage, 'id'>): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user found');

    const messageDoc: Omit<ChatMessageDocument, 'id'> = {
      userId: user.uid,
      message: message.message,
      sender: message.sender,
      timestamp: new Date(message.timestamp) as any, // will be cast to Firestore Timestamp
      response: message.response,
      isEmergency: message.isEmergency,
    };

    const id = await saveChatMessage(messageDoc);
    return id;
  } catch (error) {
    console.error('Error saving chat message:', error);
    return null;
  }
};

export const getElderStatus = async (): Promise<ElderStatus | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('No authenticated user found');
      return null;
    }

    const profile = await getUserProfile(user.uid);
    if (!profile || profile.role !== 'elder') return null;

    const lastSeen = profile.lastSeen?.toMillis?.() || Date.now();

    const elderStatus: ElderStatus = {
      lastSeen,
      lastLocation: (profile as any).lastLocation ?? undefined,
      lastMedicationTaken: (profile as any).lastMedicationTaken ?? undefined,
      lastChatInteraction: undefined
    };

    return elderStatus;
  } catch (error) {
    console.error('Error getting elder status:', error);
    return null;
  }
};

