export interface CognitiveLog {
  id: string;
  timestamp: Date;
  logType: 'medication' | 'mood' | 'focus' | 'state_check' | 'note' | 'sleep' | 'deep_work';
  data: Record<string, any>;
}
export interface MedicationProfile {
  id: string;
  name: string;
  onset: number;
  peak: number;
  halfLife: number;
  duration: number;
  strength: number;
}
