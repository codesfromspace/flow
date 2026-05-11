'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useIndexedDB } from '@/lib/hooks/useIndexedDB';
import { CognitiveLog, EffectiveRange, LocalProfile, MedicationProfile, UserProfile } from '@/types';
import { MEDICATION_PRESETS, DEFAULT_EFFECTIVE_RANGE, normalizeEffectiveRange, calculateCumulativeConcentration, estimateFocusFromConcentration, estimateReboundRisk, calculateSleepPressure } from '@/lib/utils/cognitive-math';
import { generateTimelineData } from '@/lib/utils/mock-data';

interface ActivationDataPoint {
  time: string;
  concentration: number;
  focus: number;
  timestamp: number;
}

interface TimelineEvent {
  time: number;
  type: 'medication' | 'mood_check' | 'deep_work' | 'rebound' | 'crash';
  label: string;
}

interface CognitiveStateContextType {
  isReady: boolean;
  localProfile: LocalProfile | null;
  userProfile: UserProfile;
  effectiveRange: EffectiveRange;
  medications: MedicationProfile[];
  logs: CognitiveLog[];
  currentTime: number;
  focusLevel: number;
  sleepPressure: number;
  reboundRisk: 'none' | 'low' | 'medium' | 'high';
  activeMeds: string[];
  timelineData: ActivationDataPoint[];
  todayEvents: TimelineEvent[];
  recentLogs: { id: string; label: string; type: string; time: string }[];
  todayLogCount: number;
  dayStart: number;
  dayEnd: number;
  hydrationLevel: number;
  hoursAwake: number;
  reloadProfile: () => Promise<void>;
  addCognitiveLog: (log: CognitiveLog) => Promise<void>;
  removeCognitiveLog: (id: string) => Promise<void>;
  updateWakeTime: (timeStr: string) => Promise<void>;
  setLocalProfile: React.Dispatch<React.SetStateAction<LocalProfile | null>>;
  setMedications: React.Dispatch<React.SetStateAction<MedicationProfile[]>>;
  setEffectiveRange: React.Dispatch<React.SetStateAction<EffectiveRange>>;
}

const CognitiveStateContext = createContext<CognitiveStateContextType | undefined>(undefined);

export function CognitiveStateProvider({ children }: { children: React.ReactNode }) {
  const { isInitialized, getMedicationProfiles, getSetting, setSetting, addLog, getAllLogs, deleteLog: deleteLogDb } = useIndexedDB();
  
  const [isReady, setIsReady] = useState(false);
  const [localProfile, setLocalProfile] = useState<LocalProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [effectiveRange, setEffectiveRange] = useState<EffectiveRange>(DEFAULT_EFFECTIVE_RANGE);
  const [medications, setMedications] = useState<MedicationProfile[]>([]);
  const [logs, setLogs] = useState<CognitiveLog[]>([]);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [focusLevel, setFocusLevel] = useState(65);
  const [sleepPressure, setSleepPressure] = useState(45);
  const [hoursAwake, setHoursAwake] = useState(0);
  const [reboundRisk, setReboundRisk] = useState<'none' | 'low' | 'medium' | 'high'>('low');
  const [activeMeds, setActiveMeds] = useState<string[]>([]);
  const [timelineData, setTimelineData] = useState<ActivationDataPoint[]>([]);
  const hydrationLevel = 3; // Static as in original

  const reloadProfile = async () => {
    try {
      const profile = await getSetting<LocalProfile>('localProfile');
      setLocalProfile(profile ?? null);
    } catch (err) {
      console.error('Failed to load local profile:', err);
    }
  };

  useEffect(() => {
    reloadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!localProfile) {
      setIsReady(true);
      return;
    }

    const initData = async () => {
      const existingLogs = await getAllLogs();
      const meds = await getMedicationProfiles();

      setLogs(existingLogs);
      if (meds.length > 0) {
        setMedications(meds);
      } else {
        const presetMeds = Object.values(MEDICATION_PRESETS);
        for (const med of presetMeds) {
          await getMedicationProfiles(); // trigger logic, simplified from page.tsx
        }
        setMedications(presetMeds);
      }
    };
    initData();
  }, [localProfile, getMedicationProfiles, getAllLogs]);

  useEffect(() => {
    if (!isInitialized) return;
    getSetting<UserProfile>('userProfile').then(p => p && setUserProfile(p)).catch(console.error);
    getSetting<EffectiveRange>('effectiveRange').then(r => r && setEffectiveRange(normalizeEffectiveRange(r))).catch(console.error);
  }, [isInitialized, getSetting]);

  useEffect(() => {
    if (!localProfile) return;

    const updateState = () => {
      const now = Date.now();
      setCurrentTime(now);

      const medicationById = new Map(medications.map(m => [m.id, m]));
      const recentDoses = logs
        .filter(l => l.logType === 'medication')
        .filter(l => now - l.timestamp.getTime() < 24 * 60 * 60 * 1000)
        .flatMap(log => {
          if (log.logType !== 'medication') return [];
          const profile = medicationById.get(log.data.medicationId) ?? MEDICATION_PRESETS[log.data.medicationId];
          if (!profile) return [];
          return [{
            timestamp: log.data.takenAt ?? log.timestamp.getTime(),
            dose: log.data.dose,
            profile,
            releaseType: log.data.releaseType,
            doseForm: log.data.doseForm,
            bioavailability: log.data.bioavailability,
          }];
        });

      const { total: concentration, byMedication } = calculateCumulativeConcentration(recentDoses, now, { userProfile });
      setFocusLevel(Math.round(estimateFocusFromConcentration(concentration, 50, effectiveRange)));
      setReboundRisk(estimateReboundRisk(concentration));

      let lastSleepTime = logs
        .filter(l => l.logType === 'sleep')
        .map(l => (l.logType === 'sleep' ? l.data.wokeUpAt || l.data.date : 0))
        .sort()
        .pop() || now - 8 * 60 * 60 * 1000;

      if (userProfile.wakeUpTime) {
        const [hours, minutes] = userProfile.wakeUpTime.split(':').map(Number);
        const today = new Date();
        today.setHours(hours, minutes, 0, 0);
        const wakeTime = today.getTime();
        if (wakeTime <= now) lastSleepTime = wakeTime;
      }

      const lastSleepQuality = logs
        .filter(l => l.logType === 'sleep')
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .map(l => (l.logType === 'sleep' ? l.data.quality : 3))
        .shift() || 3;

      setSleepPressure(calculateSleepPressure(lastSleepTime, now, lastSleepQuality));
      setHoursAwake(Math.max(0, (now - lastSleepTime) / (60 * 60 * 1000)));
      setActiveMeds(Object.keys(byMedication).filter(key => byMedication[key] > 0.1));

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dayStart = today.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      setTimelineData(generateTimelineData(dayStart, dayEnd, recentDoses.filter(dose => dose.timestamp >= dayStart), effectiveRange));
      setIsReady(true);
    };

    updateState();
    const interval = setInterval(updateState, 60000);
    return () => clearInterval(interval);
  }, [logs, medications, userProfile.wakeUpTime, effectiveRange, localProfile]);

  const addCognitiveLog = async (log: CognitiveLog) => {
    if (!localProfile) return;
    await addLog(log);
    setLogs(prev => {
      const filtered = prev.filter(l => l.id !== log.id);
      return [...filtered, log].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    });
  };

  const removeCognitiveLog = async (id: string) => {
    await deleteLogDb(id);
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const updateWakeTime = async (timeStr: string) => {
    const nextProfile = { ...userProfile, wakeUpTime: timeStr };
    await setSetting('userProfile', nextProfile);
    setUserProfile(nextProfile);
  };

  const today = new Date(currentTime || Date.now());
  today.setHours(0, 0, 0, 0);
  const dayStart = today.getTime();
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;

  const todayEvents = useMemo<TimelineEvent[]>(() => {
    return logs
      .filter((log) => log.timestamp.getTime() >= dayStart && log.timestamp.getTime() <= dayEnd)
      .map((log) => {
        let label = 'Sleep';
        let type: TimelineEvent['type'] = 'rebound';
        
        if (log.logType === 'medication') {
          label = `${log.data.dose}mg ${log.data.medicationName}`;
          type = 'medication';
        } else if (log.logType === 'mood') {
          label = `Mood: ${log.data.mood} | Focus: ${log.data.focus} | Energy: ${log.data.energy} | Clarity: ${log.data.clarity} | Anxiety: ${log.data.anxiety}`;
          type = 'mood_check';
        } else if (log.logType === 'deep_work') {
          label = 'Deep Work Session';
          type = 'deep_work';
        }

        return { time: log.timestamp.getTime(), type, label };
      });
  }, [logs, dayStart, dayEnd]);

  const recentLogs = useMemo(() => {
    return [...logs]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 8)
      .map((log) => {
        let label = 'Sleep';
        if (log.logType === 'medication') label = `${log.data.dose}mg ${log.data.medicationName}`;
        else if (log.logType === 'mood') label = `Mood: ${log.data.mood} | Focus: ${log.data.focus} | Energy: ${log.data.energy}`;
        else if (log.logType === 'deep_work') label = 'Deep work';
        return {
          id: log.id,
          label,
          type: log.logType,
          time: log.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };
      });
  }, [logs]);

  return (
    <CognitiveStateContext.Provider value={{
      isReady,
      localProfile,
      userProfile,
      effectiveRange,
      medications,
      logs,
      currentTime,
      focusLevel,
      sleepPressure,
      reboundRisk,
      activeMeds,
      timelineData,
      todayEvents,
      recentLogs,
      todayLogCount: todayEvents.length,
      dayStart,
      dayEnd,
      hydrationLevel,
      hoursAwake,
      reloadProfile,
      addCognitiveLog,
      removeCognitiveLog,
      updateWakeTime,
      setLocalProfile,
      setMedications,
      setEffectiveRange,
    }}>
      {children}
    </CognitiveStateContext.Provider>
  );
}

export function useCognitiveState() {
  const context = useContext(CognitiveStateContext);
  if (!context) {
    throw new Error('useCognitiveState must be used within CognitiveStateProvider');
  }
  return context;
}
