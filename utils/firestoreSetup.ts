import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from './firebaseConfig';
import { User } from 'firebase/auth';

// Types for Firestore documents
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'elder' | 'caregiver';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  lastSeen?: Timestamp;
  // Elder-specific fields
  emergencyContacts?: string[]; // Array of contact IDs
  medications?: string[]; // Array of medication IDs
  caregivers?: string[]; // Array of caregiver user IDs
}

export interface ElderProfile extends UserProfile {
  role: 'elder';
  dateOfBirth?: string;
  address?: string;
  medicalConditions?: string[];
  primaryCaregiverId?: string;
}

export interface CaregiverProfile extends UserProfile {
  role: 'caregiver';
  eldersUnderCare: string[]; // Array of elder user IDs
  relationship?: string; // 'family', 'professional', 'friend'
}

export interface MedicationDocument {
  id: string;
  userId: string; // Elder's user ID
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  prescribedBy?: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  schedule?: Array<{ time: string; days: string[] }>;
}

export interface MedicationLogDocument {
  id: string;
  userId: string; // Elder's user ID
  medicationId: string;
  timestamp: Timestamp;
  taken: boolean;
  notes?: string;
  reportedBy?: string; // user ID of who reported (elder or caregiver)
  createdAt: Timestamp;
}

export interface EmergencyContactDocument {
  id: string;
  userId: string; // Elder's user ID
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ChatMessageDocument {
  sender: string;
  id: string;
  userId: string; // Elder's user ID
  message: string;
  response?: string;
  timestamp: Timestamp;
  isEmergency?: boolean;
}

export interface MemoryDocument {
  id: string;
  userId: string; // Elder's user ID
  title: string;
  description?: string;
  imageUrl?: string;
  date: Timestamp;
  tags?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  MEDICATIONS: 'medications',
  MEDICATION_LOGS: 'medicationLogs',
  EMERGENCY_CONTACTS: 'emergencyContacts',
  CHAT_MESSAGES: 'chatMessages',
  MEMORIES: 'memories',
} as const;

// User Management Functions
export const createUserProfile = async (user: User, additionalData: Partial<UserProfile> = {}) => {
  if (!user) return;

  const userRef = doc(db, COLLECTIONS.USERS, user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const userProfile: Omit<UserProfile, 'id'> = {
      email: user.email || '',
      name: user.displayName || user.email?.split('@')[0] || 'User',
      role: 'elder', // Default role
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      isActive: true,
      ...additionalData,
    };

    try {
      await setDoc(userRef, userProfile);
      console.log('User profile created successfully');
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    console.log('User profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const updateUserLastSeen = async (userId: string) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      lastSeen: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating last seen:', error);
  }
};

// Medication Functions
export const addMedication = async (medication: Omit<MedicationDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const medicationRef = collection(db, COLLECTIONS.MEDICATIONS);
    const docRef = await addDoc(medicationRef, {
      ...medication,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('Medication added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding medication:', error);
    throw error;
  }
};

export const getUserMedications = async (userId: string): Promise<MedicationDocument[]> => {
  try {
    const medicationsRef = collection(db, COLLECTIONS.MEDICATIONS);
    const q = query(
      medicationsRef, 
      where('userId', '==', userId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MedicationDocument[];
  } catch (error) {
    console.error('Error fetching medications:', error);
    return [];
  }
};

export const logMedicationTaken = async (log: Omit<MedicationLogDocument, 'id' | 'createdAt'>) => {
  try {
    const logRef = collection(db, COLLECTIONS.MEDICATION_LOGS);
    const docRef = await addDoc(logRef, {
      ...log,
      createdAt: serverTimestamp(),
    });
    console.log('Medication log added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error logging medication:', error);
    throw error;
  }
};

export const getUserMedicationLogs = async (userId: string, limit = 100): Promise<MedicationLogDocument[]> => {
  try {
    const logsRef = collection(db, COLLECTIONS.MEDICATION_LOGS);
    const q = query(
      logsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MedicationLogDocument[];
  } catch (error) {
    console.error('Error fetching medication logs:', error);
    return [];
  }
};

// Emergency Contacts Functions
export const addEmergencyContact = async (contact: Omit<EmergencyContactDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const contactRef = collection(db, COLLECTIONS.EMERGENCY_CONTACTS);
    const docRef = await addDoc(contactRef, {
      ...contact,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('Emergency contact added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding emergency contact:', error);
    throw error;
  }
};

export async function removeEmergencyContact(userId: string, contactId: string): Promise<void> {
  // If your contacts are stored as top-level docs:
  await deleteDoc(doc(db, 'emergencyContacts', contactId));
}

export const getUserEmergencyContacts = async (userId: string): Promise<EmergencyContactDocument[]> => {
  try {
    const contactsRef = collection(db, COLLECTIONS.EMERGENCY_CONTACTS);
    const q = query(contactsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as EmergencyContactDocument[];
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    return [];
  }
};

// Chat Functions
export const saveChatMessage = async (message: Omit<ChatMessageDocument, 'id'>) => {
  try {
    const messageRef = collection(db, COLLECTIONS.CHAT_MESSAGES);
    const docRef = await addDoc(messageRef, message);
    console.log('Chat message saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
};

export const getUserChatHistory = async (userId: string, limit = 50): Promise<ChatMessageDocument[]> => {
  try {
    const messagesRef = collection(db, COLLECTIONS.CHAT_MESSAGES);
    const q = query(
      messagesRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatMessageDocument[];
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
};

// Memory Functions
export const addMemory = async (memory: Omit<MemoryDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const memoryRef = collection(db, COLLECTIONS.MEMORIES);
    const docRef = await addDoc(memoryRef, {
      ...memory,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('Memory added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding memory:', error);
    throw error;
  }
};

export const getUserMemories = async (userId: string): Promise<MemoryDocument[]> => {
  try {
    const memoriesRef = collection(db, COLLECTIONS.MEMORIES);
    const q = query(
      memoriesRef,
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MemoryDocument[];
  } catch (error) {
    console.error('Error fetching memories:', error);
    return [];
  }
};

// Real-time listeners
export const subscribeToUserProfile = (userId: string, callback: (profile: UserProfile | null) => void) => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as UserProfile);
    } else {
      callback(null);
    }
  });
};

// Initialize user on first login
export const initializeUserData = async (user: User) => {
  try {
    // Create user profile if it doesn't exist
    await createUserProfile(user);
    
    // Update last seen
    await updateUserLastSeen(user.uid);
    
    console.log('User data initialized successfully');
  } catch (error) {
    console.error('Error initializing user data:', error);
    throw error;
  }
};