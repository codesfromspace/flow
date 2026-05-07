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
  DEFAULT_EFFECTIVE_RANGE,
  normalizeEffectiveRange,
} from '@/lib/utils/cognitive-math';
import { addLog, addMedicationProfile, getAllLogs, getSetting } from '@/lib/store/db';
import { CognitiveLog, EffectiveRange, MedicationLog, MedicationProfile, UserProfile } from '@/types';

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
}

type AppPage = 'overview' | 'log' | 'activation' | 'timeline';

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
  const [activePage, setActivePage] = useState<AppPage>('overview');
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [effectiveRange, setEffectiveRange] = useState<EffectiveRange>(DEFAULT_EFFECTIVE_RANGE);
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
        if (meds.length > 0) {
          setMedications(meds);
        } else {
          const presetMeds = Object.values(MEDICATION_PRESETS);
          await Promise.all(presetMeds.map((med) => addMedicationProfile(med)));
          setMedications(presetMeds);
        }
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

    getSetting<EffectiveRange>('effectiveRange')
      .then((range) => {
        if (range) setEffectiveRange(normalizeEffectiveRange(range));
      })
      .catch((err) => console.error('Failed to load effective range:', err));
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
      const focus = Math.round(estimateFocusFromConcentration(concentration, 50, effectiveRange));
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
      setTimelineData(generateTimelineData(dayStart, dayEnd, recentDoses.filter((dose) => dose.timestamp >= dayStart), effectiveRange));
    };

    updateState();
    const interval = setInterval(updateState, 60000);
    return () => clearInterval(interval);
  }, [logs, medications, userProfile.wakeUpTime, effectiveRange]);

  const handleLog = async (log: CognitiveLog) => {
    await addLog(log);
    setLogs((currentLogs) => [...currentLogs, log].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
  };

  const handleMedicationSaved = (profile: MedicationProfile) => {
    setMedications((currentMedications) => [...currentMedications, profile]);
  };

  const handleEffectiveRangeSaved = (range: EffectiveRange) => {
    setEffectiveRange(normalizeEffectiveRange(range));
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

  const recentLogs = [...logs]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 8)
    .map((log) => {
      let label = 'Sleep';
      if (log.logType === 'medication') label = `${log.data.dose}mg ${log.data.medicationName}`;
      if (log.logType === 'mood') label = `Mood ${log.data.mood}/5 · Focus ${log.data.focus}/5`;
      if (log.logType === 'focus') label = `Focus ${log.data.focus}/5`;
      if (log.logType === 'deep_work') label = 'Deep work';
      return {
        id: log.id,
        label,
        type: log.logType,
        time: log.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
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
          <DraggableWidget key={widgetId} id={widgetId} size="wide" {...wrapperProps}>
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
          <DraggableWidget key={widgetId} id={widgetId} size="full" {...wrapperProps}>
            {timelineData.length > 0 ? (
              <ActivationCurve data={timelineData} medications={medications.map((m) => ({ name: m.name, color: '#22d3ee', doseTime: 0 }))} currentTime={currentTime} effectiveRange={effectiveRange} />
            ) : null}
          </DraggableWidget>
        );
      case 'daily-timeline':
        return (
          <DraggableWidget key={widgetId} id={widgetId} size="full" {...wrapperProps}>
            {todayEvents.length > 0 ? <DailyTimeline events={todayEvents} currentTime={currentTime} dayStart={dayStart} dayEnd={dayEnd} /> : null}
          </DraggableWidget>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <Header onOpenInfo={() => setIsInfoOpen(true)} />
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} logs={logs} medications={medications} onMedicationSaved={handleMedicationSaved} effectiveRange={effectiveRange} onEffectiveRangeSaved={handleEffectiveRangeSaved} />

      <main className="mx-auto flex h-[calc(100vh-69px)] max-w-7xl flex-col gap-5 overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {activePage === 'overview' && 'Overview'}
              {activePage === 'log' && 'Log'}
              {activePage === 'activation' && 'Activation'}
              {activePage === 'timeline' && 'Timeline'}
            </h2>
            <p className="text-sm font-medium text-muted">
              {activePage === 'overview' && 'A compact view of current cognitive state and recovery signals.'}
              {activePage === 'log' && 'Record medication, mood, and focus without leaving the first viewport.'}
              {activePage === 'activation' && 'Medication activation curve and calibration context.'}
              {activePage === 'timeline' && 'Today’s logged events across the day.'}
            </p>
          </div>

          <nav className="flex w-full gap-2 overflow-x-auto rounded-2xl border border-card-border/90 bg-white p-1 lg:w-auto">
            {[
              ['overview', 'Overview'],
              ['log', 'Log'],
              ['activation', 'Activation'],
              ['timeline', 'Timeline'],
            ].map(([page, label]) => (
              <button
                key={page}
                type="button"
                onClick={() => setActivePage(page as AppPage)}
                className={`min-w-28 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activePage === page
                    ? 'bg-foreground text-white shadow-sm'
                    : 'text-muted hover:bg-card-border/30 hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        <section className="min-h-0 flex-1 overflow-hidden">
          {activePage === 'overview' ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleWidgetDragEnd}>
              <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
                <div className="grid h-full grid-cols-1 gap-4 auto-rows-fr md:grid-cols-2 lg:grid-cols-4">
                  {widgetOrder.slice(0, 6).map((widgetId, idx) => renderWidget(widgetId, idx))}
                </div>
              </SortableContext>
            </DndContext>
          ) : null}

          {activePage === 'log' ? (
            <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[420px_1fr]">
              <QuickLogForm onLog={handleLog} medications={medications.length > 0 ? medications : Object.values(MEDICATION_PRESETS)} />
              <div className="card-base min-h-0 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Recent logs</h3>
                  <span className="text-sm font-medium text-muted">{recentLogs.length} items</span>
                </div>
                <div className="grid gap-2">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between rounded-xl border border-card-border/70 bg-card-border/10 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{log.label}</p>
                        <p className="text-xs font-medium capitalize text-muted">{log.type.replace('_', ' ')}</p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-muted">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {activePage === 'activation' ? (
            <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
              <div className="min-h-0">
                {timelineData.length > 0 ? (
                  <ActivationCurve data={timelineData} medications={medications.map((m) => ({ name: m.name, color: '#0e9fa8', doseTime: 0 }))} currentTime={currentTime} effectiveRange={effectiveRange} />
                ) : null}
              </div>
              <div className="min-h-0 overflow-hidden">
                <PharmacologyInfo />
              </div>
            </div>
          ) : null}

          {activePage === 'timeline' ? (
            <div className="h-full">
              {todayEvents.length > 0 ? (
                <DailyTimeline events={todayEvents} currentTime={currentTime} dayStart={dayStart} dayEnd={dayEnd} />
              ) : (
                <div className="card-base grid h-full place-items-center p-8 text-center">
                  <div>
                    <h3 className="text-lg font-semibold">No events today</h3>
                    <p className="mt-2 text-sm font-medium text-muted">Log a dose, mood, or focus entry to populate the timeline.</p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
