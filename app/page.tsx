'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
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
import DraggableWidget from '@/components/core/DraggableWidget';
import { useIndexedDB } from '@/lib/hooks/useIndexedDB';
import { useWidgetOrder } from '@/lib/hooks/useWidgetOrder';
import { generateMockData, generateTimelineData } from '@/lib/utils/mock-data';
import {
  calculateCumulativeConcentration,
  calculateSleepPressure,
  estimateFocusFromConcentration,
  estimateReboundRisk,
  estimateMentalLoad,
  MEDICATION_PRESETS,
} from '@/lib/utils/cognitive-math';
import { addLog, addMedicationProfile, getAllLogs, getSetting } from '@/lib/store/db';
import { CognitiveLog, MedicationLog, MedicationProfile, UserProfile } from '@/types';

const INITIAL_TIME = 0;

interface TimelineEvent {
  time: number;
  type: 'medication' | 'mood_check' | 'deep_work' | 'rebound' | 'crash';
  label: string;
}

interface ActivationDataPoint {
  time: string;
  concentration: number;
  focus: number;
  timestamp: number;
  optimalFocus: number;
}

export default function Dashboard() {
  const { isInitialized, getMedicationProfiles } = useIndexedDB();
  const { widgetOrder, moveWidget } = useWidgetOrder();
  const [medications, setMedications] = useState<MedicationProfile[]>([]);
  const [logs, setLogs] = useState<CognitiveLog[]>([]);
  const [currentTime, setCurrentTime] = useState(INITIAL_TIME);
  const [sleepPressure, setSleepPressure] = useState(45);
  const [focusLevel, setFocusLevel] = useState(65);
  const [reboundRisk, setReboundRisk] = useState<'none' | 'low' | 'medium' | 'high'>('low');
  const [activeMeds, setActiveMeds] = useState<string[]>([]);
  const [timelineData, setTimelineData] = useState<ActivationDataPoint[]>([]);
  const [hydrationLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    if (!isInitialized) return;

    const initData = async () => {
      const existingLogs = await getAllLogs();

      if (existingLogs.length === 0) {
        const { logs: mockLogs, medications: mockMeds } = generateMockData();
        await Promise.all([
          ...mockMeds.map((med) => addMedicationProfile(med)),
          ...mockLogs.map((log) => addLog(log)),
        ]);
        setLogs(mockLogs);
        setMedications(mockMeds);
      } else {
        const meds = await getMedicationProfiles();
        setLogs(existingLogs);
        setMedications(meds);
      }
    };

    initData();
  }, [isInitialized, getMedicationProfiles]);

  useEffect(() => {
    if (!isInitialized) return;

    getSetting<UserProfile>('userProfile')
      .then((profile) => {
        if (profile) setUserProfile(profile);
      })
      .catch((err) => console.error('Failed to load user profile:', err));
  }, [isInitialized]);

  useEffect(() => {
    const updateState = () => {
      const now = Date.now();
      setCurrentTime(now);

      const medicationById = new Map(medications.map((medication) => [medication.id, medication]));
      const recentDoses = logs
        .filter((log): log is MedicationLog => log.logType === 'medication')
        .filter((log) => now - log.timestamp.getTime() < 24 * 60 * 60 * 1000)
        .flatMap((log) => {
          const profile = medicationById.get(log.data.medicationId) ?? MEDICATION_PRESETS[log.data.medicationId];
          if (!profile) return [];

          return [{
            timestamp: log.data.takenAt ?? log.timestamp.getTime(),
            dose: log.data.dose,
            profile,
          }];
        });

      const { total: concentration, byMedication } = calculateCumulativeConcentration(recentDoses, now);
      const focus = Math.round(estimateFocusFromConcentration(concentration, 50));
      const rebound = estimateReboundRisk(concentration);

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
        if (wakeTime <= now) lastSleepTime = wakeTime;
      }

      const lastSleepQuality = logs
        .filter((log) => log.logType === 'sleep')
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .map((log) => log.data.quality)
        .shift() || 3;

      setFocusLevel(focus);
      setReboundRisk(rebound);
      setSleepPressure(calculateSleepPressure(lastSleepTime, now, lastSleepQuality));
      setActiveMeds(Object.keys(byMedication).filter((key) => byMedication[key] > 0.1));

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dayStart = today.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      setTimelineData(generateTimelineData(dayStart, dayEnd, recentDoses.filter((dose) => dose.timestamp >= dayStart)));
    };

    updateState();
    const interval = setInterval(updateState, 60000);
    return () => clearInterval(interval);
  }, [logs, medications, userProfile.wakeUpTime]);

  const handleLog = async (log: CognitiveLog) => {
    await addLog(log);
    setLogs((currentLogs) => [...currentLogs, log].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
  };

  const handleMedicationSaved = (profile: MedicationProfile) => {
    setMedications((currentMedications) => [...currentMedications, profile]);
  };

  const handleWidgetDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = widgetOrder.indexOf(String(active.id));
    const newIndex = widgetOrder.indexOf(String(over.id));
    if (oldIndex !== -1 && newIndex !== -1) moveWidget(oldIndex, newIndex);
  };

  const today = new Date(currentTime || Date.now());
  today.setHours(0, 0, 0, 0);
  const dayStart = today.getTime();
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;

  const todayEvents: TimelineEvent[] = logs
    .filter((log) => log.timestamp.getTime() >= dayStart && log.timestamp.getTime() <= dayEnd)
    .map((log) => {
      let label = 'Sleep';
      if (log.logType === 'medication') label = `${log.data.dose}mg ${log.data.medicationName}`;
      let type: TimelineEvent['type'] = 'rebound';
      if (log.logType === 'medication') type = 'medication';
      if (log.logType === 'mood' || log.logType === 'focus') type = 'mood_check';
      if (log.logType === 'deep_work') type = 'deep_work';

      if (log.logType === 'mood') label = `Mood: ${log.data.mood}/5`;
      if (log.logType === 'deep_work') label = 'Deep Work Session';
      if (log.logType === 'focus') label = `Focus: ${log.data.focus}/5`;

      return { time: log.timestamp.getTime(), type, label };
    });

  const renderWidget = (widgetId: string, index: number) => {
    const wrapperProps = {
      canMoveUp: index > 0,
      canMoveDown: index < widgetOrder.length - 1,
      onMoveUp: () => moveWidget(index, index - 1),
      onMoveDown: () => moveWidget(index, index + 1),
    };

    switch (widgetId) {
      case 'cognitive-state':
        return (
          <DraggableWidget key={widgetId} id={widgetId} {...wrapperProps}>
            <CurrentCognitiveState focusLevel={focusLevel} overstimulated={focusLevel > 85} activeMedications={activeMeds} />
          </DraggableWidget>
        );
      case 'focus-quality':
        return (
          <DraggableWidget key={widgetId} id={widgetId} {...wrapperProps}>
            <EstimatedFocus percentage={focusLevel} trend={focusLevel > 70 ? 'stable' : 'down'} />
          </DraggableWidget>
        );
      case 'rebound-risk':
        return (
          <DraggableWidget key={widgetId} id={widgetId} {...wrapperProps}>
            <ReboundRisk level={reboundRisk} />
          </DraggableWidget>
        );
      case 'sleep-pressure':
        return (
          <DraggableWidget key={widgetId} id={widgetId} {...wrapperProps}>
            <SleepPressure pressure={sleepPressure} hoursAwake={Math.max(0, (currentTime - dayStart) / (60 * 60 * 1000))} />
          </DraggableWidget>
        );
      case 'mental-load':
        return (
          <DraggableWidget key={widgetId} id={widgetId} {...wrapperProps}>
            <MentalLoad load={estimateMentalLoad(3, focusLevel / 100)} capacity={75} />
          </DraggableWidget>
        );
      case 'hydration-reminder':
        return (
          <DraggableWidget key={widgetId} id={widgetId} {...wrapperProps}>
            <HydrationReminder level={hydrationLevel} concentration={focusLevel / 100} />
          </DraggableWidget>
        );
      case 'activation-curve':
        return (
          <DraggableWidget key={widgetId} id={widgetId} {...wrapperProps}>
            {timelineData.length > 0 ? (
              <ActivationCurve data={timelineData} medications={medications.map((m) => ({ name: m.name, color: '#22d3ee', doseTime: 0 }))} currentTime={currentTime} />
            ) : null}
          </DraggableWidget>
        );
      case 'daily-timeline':
        return (
          <DraggableWidget key={widgetId} id={widgetId} {...wrapperProps}>
            {todayEvents.length > 0 ? <DailyTimeline events={todayEvents} currentTime={currentTime} dayStart={dayStart} dayEnd={dayEnd} /> : null}
          </DraggableWidget>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenInfo={() => setIsInfoOpen(true)} />
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} logs={logs} medications={medications} onMedicationSaved={handleMedicationSaved} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <QuickLogForm onLog={handleLog} medications={medications} />
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleWidgetDragEnd}>
          <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 auto-rows-max">
              {widgetOrder.slice(0, 6).map((widgetId, idx) => renderWidget(widgetId, idx))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {widgetOrder.includes('activation-curve') ? renderWidget('activation-curve', widgetOrder.indexOf('activation-curve')) : null}
              </div>
              <div className="lg:col-span-1">
                <PharmacologyInfo />
              </div>
            </div>

            {widgetOrder.includes('daily-timeline') ? (
              <div className="grid grid-cols-1 gap-6">
                {renderWidget('daily-timeline', widgetOrder.indexOf('daily-timeline'))}
              </div>
            ) : null}
          </SortableContext>
        </DndContext>

        <div className="text-center text-muted text-xs pt-8 border-t border-card-border/30">
          <p>Synapse Flow • Local-first cognitive tracking • v0.1.0</p>
          <p className="mt-2">Data stored locally. No external synchronization.</p>
        </div>
      </main>
    </div>
  );
}
