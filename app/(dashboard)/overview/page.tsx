'use client';

import { useRouter } from 'next/navigation';
import { useCognitiveState } from '@/lib/context/CognitiveStateContext';
import CurrentCognitiveState from '@/components/widgets/CurrentCognitiveState';
import EstimatedFocus from '@/components/widgets/EstimatedFocus';
import ReboundRisk from '@/components/widgets/ReboundRisk';
import SleepPressure from '@/components/widgets/SleepPressure';
import MentalLoad from '@/components/widgets/MentalLoad';
import HydrationReminder from '@/components/widgets/HydrationReminder';
import DailySummary from '@/components/widgets/DailySummary';
import ActivationCurve from '@/components/charts/ActivationCurve';
import DailyTimeline from '@/components/charts/DailyTimeline';
import { estimateMentalLoad } from '@/lib/utils/cognitive-math';
import { EffectiveRange } from '@/types';

interface OverviewBriefProps {
  profileName: string;
  todayLogCount: number;
  totalLogCount: number;
  lastLogLabel: string;
  activeMedicationNames: string[];
  effectiveRange: EffectiveRange;
  onOpenLog: () => void;
  onOpenActivation: () => void;
}

function OverviewBrief({
  profileName,
  todayLogCount,
  totalLogCount,
  lastLogLabel,
  activeMedicationNames,
  effectiveRange,
  onOpenLog,
  onOpenActivation,
}: OverviewBriefProps) {
  const hasActiveMedication = activeMedicationNames.length > 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
      <div className="card-elevated overflow-hidden p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-label mb-1">Dnes pro {profileName}</p>
            <h3 className="text-2xl font-semibold tracking-tight text-foreground">
              {todayLogCount > 0 ? `${todayLogCount} záznamů uloženo` : 'Připraveno na první záznam'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-muted">
              {todayLogCount > 0
                ? `Nejnovější: ${lastLogLabel}.`
                : 'Přidej záznam, náladu nebo focus pro kalibraci.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onOpenLog} className="btn-primary">
              Přidat záznam
            </button>
            <button type="button" onClick={onOpenActivation} className="btn-secondary">
              Upravit pásmo
            </button>
          </div>
        </div>
      </div>

      <div className="card-base grid grid-cols-3 gap-3 p-4">
        <div className="rounded-xl border border-card-border/70 bg-card-border/10 p-3">
          <p className="text-xs font-semibold uppercase text-muted">Uloženo</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{totalLogCount}</p>
          <p className="text-xs font-medium text-muted">logů</p>
        </div>
        <div className="rounded-xl border border-card-border/70 bg-card-border/10 p-3">
          <p className="text-xs font-semibold uppercase text-muted">Aktivní</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{hasActiveMedication ? activeMedicationNames.length : 0}</p>
          <p className="truncate text-xs font-medium text-muted">{hasActiveMedication ? activeMedicationNames.join(', ') : 'nic'}</p>
        </div>
        <div className="rounded-xl border border-card-border/70 bg-card-border/10 p-3">
          <p className="text-xs font-semibold uppercase text-muted">Pásmo</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{Math.round(effectiveRange.lower * 100)}-{Math.round(effectiveRange.upper * 100)}%</p>
          <p className="text-xs font-medium text-muted">ideální</p>
        </div>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const router = useRouter();
  const { 
    localProfile, logs, todayLogCount, recentLogs, activeMeds, effectiveRange,
    focusLevel, reboundRisk, sleepPressure, currentTime, dayStart, dayEnd,
    hydrationLevel, timelineData, medications, todayEvents, hoursAwake
  } = useCognitiveState();

  const activeMedicationNames = activeMeds
    .map((medicationId) => medications.find((medication) => medication.id === medicationId)?.name ?? medicationId)
    .filter(Boolean);

  const lastLogLabel = recentLogs[0]?.label ?? 'Žádné logy';

  return (
    <div className="flex flex-col gap-5 pb-12 overflow-y-auto h-full pr-1">
      <OverviewBrief
        profileName={localProfile?.displayName ?? ''}
        todayLogCount={todayLogCount}
        totalLogCount={logs.length}
        lastLogLabel={lastLogLabel}
        activeMedicationNames={activeMedicationNames}
        effectiveRange={effectiveRange}
        onOpenLog={() => router.push('/doses')}
        onOpenActivation={() => router.push('/graph')}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CurrentCognitiveState 
            focusLevel={focusLevel} 
            overstimulated={focusLevel > 85} 
            activeMedications={activeMedicationNames} 
            timelineData={timelineData}
            currentTime={currentTime}
          />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-5">
          <DailySummary />
          <HydrationReminder level={hydrationLevel as any} concentration={focusLevel / 100} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <EstimatedFocus percentage={focusLevel} trend={focusLevel > 70 ? 'stable' : 'down'} />
        <ReboundRisk level={reboundRisk} />
        <SleepPressure pressure={sleepPressure} hoursAwake={hoursAwake} />
        <MentalLoad load={estimateMentalLoad(3, focusLevel / 100)} capacity={75} />
      </div>

      <div className="mt-2 flex flex-col gap-5">
        {timelineData.length > 0 && (
          <div className="w-full">
            <ActivationCurve 
              data={timelineData} 
              medications={medications.map((m) => ({ name: m.name, color: '#22d3ee', doseTime: 0 }))} 
              doses={[]}
              currentTime={currentTime} 
              effectiveRange={effectiveRange} 
            />
          </div>
        )}

        {todayEvents.length > 0 && (
          <div className="w-full card-base overflow-hidden">
            <DailyTimeline 
              events={todayEvents} 
              currentTime={currentTime} 
              dayStart={dayStart} 
              dayEnd={dayEnd} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
