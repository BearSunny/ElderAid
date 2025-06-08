import { ReactNode } from "react";

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency?: string; 
  instructions?: string;
  prescribedBy?: string;
  startDate: number; // timestamp
  endDate?: number; // timestamp
  isActive: boolean;
  schedule: Array<{
    time: string;
    days: string[];
  }>;
  imageUri?: string;
  notes?: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  timestamp: number;
  taken: boolean;
  notes?: string;
  status: 'taken' | 'missed';
  scheduledTime: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface ChatMessage {
  action: any;
  id: string;
  message: string;
  sender: 'user' | 'bot';
  response?: string;
  timestamp: number;
  isEmergency?: boolean;
  hasMedia?: boolean;
  mediaUri?: string;
  mediaType?: 'image' | 'video' | 'audio';
}

export interface Memory {
  timestamp: string | number | Date;
  caption: ReactNode;
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  date: number; // timestamp
  tags?: string[];
}

// User-related types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'elder' | 'caregiver';
  isActive: boolean;
  lastSeen?: number;
  createdAt: number;
  updatedAt: number;
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
  eldersUnderCare: string[];
  relationship?: string;
}

export interface ElderStatus {
  lastChatInteraction: any;
  lastSeen: number;
  lastLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  lastMedicationTaken?: {
    name: string;
    timestamp: number;
  };
}