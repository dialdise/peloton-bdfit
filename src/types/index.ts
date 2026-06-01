export type TrainingType = 'Presencial' | 'Virtual' | 'Mixto';
export type Gender = 'M' | 'F' | 'Otro';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'injured';
export type InjuryLevel = 'leve' | 'moderada' | 'grave';

export interface MedicalInfo {
  conditions: string;
  currentInjury: string;
  injuryLevel?: InjuryLevel;
  medications: string;
  bloodType?: BloodType;
  emergencyContact: string;
  emergencyPhone: string;
  clearanceDate?: string;
}

export interface Performance {
  pr5k?: string;
  pr10k?: string;
  pr21k?: string;
  pr42k?: string;
  weeklyKmGoal?: number;
  currentTrainingPhase?: 'Base' | 'Build' | 'Peak' | 'Taper' | 'Recovery';
  shoeKm?: number;
  vo2max?: number;
}

export interface Student {
  id: number;
  name: string;
  coach: string;
  peloton: number;
  mainDistance: string;
  lastRaceTime?: string;
  trainingType: TrainingType;
  // Personal
  age?: number;
  phone?: string;
  email?: string;
  gender?: Gender;
  joinDate?: string;
  // Medical
  medical: MedicalInfo;
  // Performance
  performance: Performance;
  // Status
  active: boolean;
  notes: string;
  hasAlert: boolean;
  alertMessage: string;
}

export interface SessionEntry {
  studentId: number;
  status: AttendanceStatus;
  distance?: number;
  timeMinutes?: number;
  pace?: string;
  rpe?: number;
  heartRateAvg?: number;
  notes?: string;
}

export interface TrainingDay {
  date: string;
  sessions: SessionEntry[];
  generalNotes?: string;
}

export interface AppSettings {
  pin: string;
  githubToken: string;
  githubRepo: string;
  githubOwner: string;
  lastSync?: string;
}

export interface AppData {
  students: Student[];
  trainingDays: Record<string, TrainingDay>;
  settings: AppSettings;
  version: number;
}
