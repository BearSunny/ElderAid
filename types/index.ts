export interface Medication {
  id: string;
  name: string;
  dosage: string;
  schedule: {
    time: string;
    days: string[];
  }[];
  imageUri?: string;
  notes?: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  status: 'taken' | 'missed';
  timestamp: number;
  scheduledTime: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
  hasMedia?: boolean;
  mediaUri?: string;
  mediaType?: 'image' | 'audio';
}

export interface Memory {
  id: string;
  imageUri: string;
  caption: string;
  timestamp: number;
  tags?: string[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface ElderStatus {
  lastSeen: number;
  lastLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  lastMedicationTaken?: {
    name: string;
    timestamp: number;
  };
  lastChatInteraction?: {
    message: string;
    timestamp: number;
  };
}