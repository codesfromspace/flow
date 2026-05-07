export type LogType = 'medication' | 'mood' | 'focus' | 'state_check' | 'note' | 'sleep' | 'deep_work';

export type MedicationReleaseType = 'instant' | 'extended';

interface BaseLog<TType extends LogType, TData> {
  id: string;
  timestamp: Date;
  logType: TType;
  data: TData;
}

export type MedicationLog = BaseLog<'medication', {
  medicationId: string;
  medicationName: string;
  dose: number;
  doseUnit: 'mg';
  releaseType: MedicationReleaseType;
  takenAt: number;
}>;

export type MoodLog = BaseLog<'mood', {
  mood: 1 | 2 | 3 | 4 | 5;
  focus: 1 | 2 | 3 | 4 | 5;
  anxiety: 1 | 2 | 3 | 4 | 5;
  clarity: 1 | 2 | 3 | 4 | 5;
  energy: 1 | 2 | 3 | 4 | 5;
}>;

export type FocusLog = BaseLog<'focus', {
  focus: 1 | 2 | 3 | 4 | 5;
  clarity: 1 | 2 | 3 | 4 | 5;
  taskCategory: string;
}>;

export type SleepLog = BaseLog<'sleep', {
  date: number;
  wokeUpAt?: number;
  duration: number;
  quality: 1 | 2 | 3 | 4 | 5;
}>;

export type DeepWorkLog = BaseLog<'deep_work', {
  durationMinutes: number;
  taskCategory: string;
}>;

export type StateCheckLog = BaseLog<'state_check', {
  focus: 1 | 2 | 3 | 4 | 5;
  energy: 1 | 2 | 3 | 4 | 5;
  note?: string;
}>;

export type NoteLog = BaseLog<'note', {
  note: string;
}>;

export type CognitiveLog =
  | MedicationLog
  | MoodLog
  | FocusLog
  | SleepLog
  | DeepWorkLog
  | StateCheckLog
  | NoteLog;

export interface MedicationProfile {
  id: string;
  name: string;
  onset: number;
  peak: number;
  halfLife: number;
  duration: number;
  strength: number;
  defaultDose?: number;
  referenceDose?: number;
  releaseType?: MedicationReleaseType;
}

export interface UserProfile {
  age?: number;
  weight?: number;
  height?: number;
  wakeUpTime?: string;
}
