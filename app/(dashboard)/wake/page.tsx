'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCognitiveState } from '@/lib/context/CognitiveStateContext';
import { v4 as uuidv4 } from 'uuid';
import { CognitiveLog } from '@/types';

export default function WakePage() {
  const router = useRouter();
  const { logs, sleepPressure, effectiveRange, currentTime, userProfile, addCognitiveLog, updateWakeTime } = useCognitiveState();
  const [wakeTimeInput, setWakeTimeInput] = useState('');

  useEffect(() => {
    if (userProfile.wakeUpTime) {
      setWakeTimeInput(userProfile.wakeUpTime);
    }
  }, [userProfile.wakeUpTime]);

  const handleSaveWakeTime = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!wakeTimeInput) return;

    const todayStart = new Date(currentTime || Date.now());
    todayStart.setHours(0, 0, 0, 0);
    const [hours, minutes] = wakeTimeInput.split(':').map(Number);
    const wokeUpAt = new Date(todayStart);
    wokeUpAt.setHours(hours, minutes, 0, 0);

    const sleepLog: CognitiveLog = {
      id: uuidv4(),
      timestamp: wokeUpAt,
      logType: 'sleep',
      data: {
        date: todayStart.getTime(),
        wokeUpAt: wokeUpAt.getTime(),
        duration: 8,
        quality: 3,
      },
    };

    await updateWakeTime(wakeTimeInput);
    await addCognitiveLog(sleepLog);
    router.push('/doses');
  };

  return (
    <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[420px_1fr]">
      <form onSubmit={handleSaveWakeTime} className="card-elevated flex h-full flex-col justify-between p-6">
        <div>
          <p className="text-label mb-2">Krok 2</p>
          <h3 className="text-2xl font-semibold tracking-tight text-foreground">Kdy jsi vstával(a)?</h3>
          <p className="mt-3 text-sm font-medium leading-relaxed text-muted">
            Tento údaj nastavuje výchozí bod pro tlak spánku (sleep pressure). Flow jej používá k odhadu, zda je snížené soustředění způsobeno načasováním léků, nebo akumulovanou únavou.
          </p>
          <label className="text-label mb-2 mt-6 block">Čas probuzení</label>
          <input
            type="time"
            value={wakeTimeInput}
            onChange={(event) => setWakeTimeInput(event.target.value)}
            className="input-base text-lg"
            autoFocus
          />
        </div>
        <button type="submit" disabled={!wakeTimeInput} className="btn-primary w-full disabled:opacity-50">
          Pokračovat na záznamy
        </button>
      </form>

      <div className="card-base grid h-full place-items-center p-8">
        <div className="max-w-xl">
          <p className="text-label mb-2">Proč toto jako první?</p>
          <h3 className="text-3xl font-semibold tracking-tight text-foreground">Křivka medikace je jen polovina obrazu.</h3>
          <p className="mt-4 text-sm font-medium leading-relaxed text-muted">
            Stimulant může být v ideálním pásmu, ale pokud je tlak spánku příliš vysoký, soustředění bude i tak narušené. Záznam času probuzení zabraňuje aplikaci interpretovat každý stav nesoustředěnosti jako problém s dávkováním.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ['Tlak spánku', `${Math.round(sleepPressure)}%`],
              ['Uložené záznamy', String(logs.length)],
              ['Ideální pásmo', `${Math.round(effectiveRange.lower * 100)}-${Math.round(effectiveRange.upper * 100)}%`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-card-border/70 bg-card-border/10 p-4">
                <p className="text-xs font-semibold uppercase text-muted">{label}</p>
                <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
