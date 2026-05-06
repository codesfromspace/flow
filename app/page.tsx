'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import InfoModal from '@/components/layout/InfoModal';
import CurrentCognitiveState from '@/components/widgets/CurrentCognitiveState';
import EstimatedFocus from '@/components/widgets/EstimatedFocus';
import ReboundRisk from '@/components/widgets/ReboundRisk';
import SleepPressure from '@/components/widgets/SleepPressure';
import MentalLoad from '@/components/widgets/MentalLoad';
import HydrationReminder from '@/components/widgets/HydrationReminder';
import PharmacologyInfo from '@/components/widgets/PharmacologyInfo';
import ActivationCurve from '@/components/charts/ActivationCurve';
import DailyTimeline from '@/components/charts/DailyTimeline';
import QuickLogForm from '@/components/core/QuickLogForm';
import { useIndexedDB } from '@/lib/hooks/useIndexedDB';
import { generateMockData, generateTimelineData } from '@/lib/utils/mock-data';
import {
  calculateCumulativeConcentration,
  calculateSleepPressure,
  estimateFocusFromConcentration,
  estimateReboundRisk,
  estimateMentalLoad,
  MEDICATION_PRESETS,
} from '@/lib/utils/cognitive-math';
import {
  addLog,
  addMedicationProfile,
  getAllLogs,
} from '@/lib/store/db';
import { CognitiveLog, MedicationProfile } from '@/types';

export default function Dashboard() {
  const { isInitialized, getMedicationProfiles } = useIndexedDB();
  const [medications, setMedications] = useState<MedicationProfile[]>([]);
  const [logs, setLogs] = useState<CognitiveLog[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [sleepPressure, setSleepPressure] = useState(45);
  const [focusLevel, setFocusLevel] = useState(65);
  const [reboundRisk, setReboundRisk] = useState<'none' | 'low' | 'medium' | 'high'>('low');
  const [activeMeds, setActiveMeds] = useState<string[]>([]);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [hydrationLevel, setHydrationLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ wakeUpTime?: string }>({});

  useEffect(() => {
    if (!isInitialized) return;

    const initData = async () => {
      const existingLogs = await getAllLogs();

      if (existingLogs.length === 0) {
        const { logs: mockLogs, medications: mockMeds } = generateMockData(7);
        for (const med of mockMeds) {
          await addMedicationProfile(med);
        }
        for (const log of mockLogs) {
          await addLog(log);
        }
        setLogs(mockLogs);
        setMedications(mockMeds);
      } else {
        setLogs(existingLogs);
        const meds = await getMedicationProfiles();
        setMedications(meds);
      }
    };

    initData();
  }, [isInitialized, getMedicationProfiles]);

  useEffect(() => {
    const loadUserProfile = () => {
      try {
        const dbRequest = indexedDB.open('SynapseFlow', 1);
        dbRequest.onsuccess = () => {
          const db = dbRequest.result;
          const tx = db.transaction(['settings'], 'readonly');
          const store = tx.objectStore('settings');
          const request = store.get('userProfile');
          request.onsuccess = () => {
            if (request.result) {
              setUserProfile(request.result.value);
            }
          };
        };
      } catch (err) {
        console.error('Failed to load user profile:', err);
      }
    };
    loadUserProfile();
  }, []);

  useEffect(() => {
    const updateState = () => {
      const now = Date.now();
      setCurrentTime(now);

      const recentDoses = logs
        .filter((log) => log.logType === 'medication')
        .filter((log) => now - log.timestamp.getTime() < 24 * 60 * 60 * 1000)
        .map((log) => ({
          timestamp: log.timestamp.getTime(),
          dose: log.data.dose,
          profile: MEDICATION_PRESETS[log.data.medicationId] || Object.values(MEDICATION_PRESETS)[0],
        }));

      const { total: concentration, byMedication } = calculateCumulativeConcentration(
        recentDoses.map((d) => ({
          timestamp: d.timestamp,
          dose: d.dose,
          profile: d.profile,
        })),
        now
      );

      const focus = Math.round(estimateFocusFromConcentration(concentration, 50));
      const rebound = estimateReboundRisk(concentration, now);

      let lastSleepTime = logs
        .filter((log) => log.logType === 'sleep')
        .map((log) => log.data.wokeUpAt || log.data.date)
        .sort()
        .pop() || now - 8 * 60 * 60 * 1000;

      if (userProfile.wakeUpTime) {
        const [hours, minutes] = userProfile.wakeUpTime.split(':').map(Number);
        const today = new Date();
        today.setHours(hours, minutes, 0, 0);
        const wakeTime = today.getTime();
        if (wakeTime <= now) {
          lastSleepTime = wakeTime;
        }
      }

      const lastSleepQuality = logs
        .filter((log) => log.logType === 'sleep')
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .map((log) => log.data.quality)
        .shift() || 3;

      const sleepP = calculateSleepPressure(lastSleepTime, now, lastSleepQuality);

      setFocusLevel(focus);
      setReboundRisk(rebound);
      setSleepPressure(sleepP);
      setActiveMeds(Object.keys(byMedication).filter((k) => byMedication[k] > 0.1));

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dayStart = today.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;

      const todayDoses = recentDoses.filter((d) => d.timestamp >= dayStart);
      const timelineData = generateTimelineData(dayStart, dayEnd, todayDoses);
      setTimelineData(timelineData);
    };

    updateState();
    const interval = setInterval(updateState, 60000);
    return () => clearInterval(interval);
  }, [logs]);

  const handleLog = async (log: CognitiveLog) => {
    await addLog(log);
    setLogs([...logs, log]);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayStart = today.getTime();
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;

  const todayEvents = logs
    .filter((log) => log.timestamp.getTime() >= dayStart && log.timestamp.getTime() <= dayEnd)
    .map((log) => {
      const logType = log.logType as any;
      let label = '';
      if (log.logType === 'medication') {
        label = log.data.dose + 'mg ' + log.data.medicationName;
      } else if (log.logType === 'mood') {
        label = 'Mood: ' + log.data.mood + '/5';
      } else if (log.logType === 'deep_work') {
        label = 'Deep Work Session';
      } else {
        label = 'Sleep';
      }
      return {
        time: log.timestamp.getTime(),
        type: logType,
        label: label,
      };
    });

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenInfo={() => setIsInfoOpen(true)} />
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} logs={logs} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <QuickLogForm
            onLog={handleLog}
            medications={medications.map((m) => ({ id: m.id, name: m.name }))}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 auto-rows-max">
          <CurrentCognitiveState
            focusLevel={focusLevel}
            overstimulated={focusLevel > 85}
            activeMedications={activeMeds}
          />

          <EstimatedFocus percentage={focusLevel} trend={focusLevel > 70 ? 'stable' : 'down'} />
          <ReboundRisk level={reboundRisk} />
          <SleepPressure pressure={sleepPressure} hoursAwake={(Date.now() - dayStart) / (60 * 60 * 1000)} />
          <MentalLoad load={estimateMentalLoad(3, focusLevel / 100)} capacity={75} />
          <HydrationReminder level={hydrationLevel} concentration={focusLevel / 100} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {timelineData.length > 0 && (
              <ActivationCurve
                data={timelineData}
                medications={medications.map((m) => ({
                  name: m.name,
                  color: '#22d3ee',
                  doseTime: 0,
                }))}
                currentTime={currentTime}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <PharmacologyInfo />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {todayEvents.length > 0 && (
            <DailyTimeline
              events={todayEvents}
              currentTime={currentTime}
              dayStart={dayStart}
              dayEnd={dayEnd}
            />
          )}
        </div>

        <div className="text-center text-muted text-xs pt-8 border-t border-card-border/30">
          <p>Synapse Flow • Local-first cognitive tracking • v0.1.0</p>
          <p className="mt-2">Data stored locally. No external synchronization.</p>
        </div>
      </main>
    </div>
  );
}
