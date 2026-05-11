'use client';

import React from 'react';
import { useCognitiveState } from '@/lib/context/CognitiveStateContext';
import { CognitiveLog, SleepLog } from '@/types';

const isSleepLog = (log: CognitiveLog): log is SleepLog => log.logType === 'sleep';

export default function DailySummary() {
  const { todayEvents, logs, dayStart } = useCognitiveState();

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
  };

  const getEventText = (event: typeof todayEvents[0]) => {
    switch (event.type) {
      case 'medication': return `💊 Užito: ${event.label}`;
      case 'mood_check': return `📊 Stav: ${event.label}`;
      case 'deep_work': return `🎯 ${event.label}`;
      case 'rebound': return `⬇️ ${event.label}`;
      case 'crash': return `💥 ${event.label}`;
      default: return `○ ${event.label}`;
    }
  };

  const wakeLog = logs.find((log): log is SleepLog => isSleepLog(log) && log.data.date === dayStart);
  
  return (
    <div className="card-base p-6 border-l-4 border-l-accent-cyan">
      <h3 className="text-title font-medium mb-1">Dnešní žurnál</h3>
      <p className="text-sm text-muted mb-4">Textový přehled dnešních událostí pro rychlou orientaci.</p>
      
      <div className="space-y-3">
        {wakeLog ? (
          <div className="flex gap-3 items-start">
            <span className="text-sm font-medium text-muted min-w-[45px] mt-0.5">{formatTime(wakeLog.data.wokeUpAt ?? wakeLog.timestamp.getTime())}</span>
            <span className="text-sm text-foreground bg-card-border/20 px-3 py-1.5 rounded-lg">🌅 Budíček. Zaznamenána kvalita spánku {wakeLog.data.quality}/5.</span>
          </div>
        ) : (
          <div className="text-sm text-muted italic">Zatím nebyl zaznamenán čas probuzení.</div>
        )}
        
        {todayEvents.map((event, idx) => (
          <div key={idx} className="flex gap-3 items-start">
            <span className="text-sm font-medium text-muted min-w-[45px] mt-0.5">{formatTime(event.time)}</span>
            <span className="text-sm text-foreground bg-card-border/20 px-3 py-1.5 rounded-lg">{getEventText(event)}</span>
          </div>
        ))}

        {todayEvents.length === 0 && wakeLog && (
          <div className="text-sm text-muted italic pt-2">Zatím žádné další události.</div>
        )}
      </div>
    </div>
  );
}
