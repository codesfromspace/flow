'use client';

import { useState, useMemo } from 'react';
import { useCognitiveState } from '@/lib/context/CognitiveStateContext';
import QuickLogForm from '@/components/core/QuickLogForm';
import { MEDICATION_PRESETS } from '@/lib/utils/cognitive-math';

export default function DosesPage() {
  const { medications, logs, addCognitiveLog, removeCognitiveLog } = useCognitiveState();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({'Dnes': true});

  // Edit state
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editDose, setEditDose] = useState('');
  const [editTime, setEditTime] = useState('');

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const groupedLogs = useMemo(() => {
    const groups: { title: string; data: { logs: any[], totals: Record<string, number> } }[] = [];
    const map = new Map<string, { logs: any[], totals: Record<string, number> }>();
    
    const sorted = [...logs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    sorted.forEach(log => {
      const d = new Date(log.timestamp);
      d.setHours(0,0,0,0);
      let title = '';
      if (d.getTime() === today.getTime()) title = 'Dnes';
      else if (d.getTime() === yesterday.getTime()) title = 'Včera';
      else title = d.toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric' });
      
      let label = 'Sleep';
      if (log.logType === 'medication') label = `${log.data.dose}mg ${log.data.medicationName}`;
      else if (log.logType === 'mood') label = `Mood ${log.data.mood}/5 · Focus ${log.data.focus}/5`;
      else if (log.logType === 'focus') label = `Focus ${log.data.focus}/5`;
      else if (log.logType === 'deep_work') label = 'Deep work';

      const formattedLog = {
        id: log.id,
        label,
        type: log.logType,
        time: log.timestamp.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }),
        original: log,
      };

      if (!map.has(title)) {
        map.set(title, { logs: [], totals: {} });
        groups.push({ title, data: map.get(title)! });
      }
      const groupData = map.get(title)!;
      groupData.logs.push(formattedLog);

      if (log.logType === 'medication') {
        const mId = log.data.medicationId || '';
        const shortName = mId.includes('methyl') ? 'MPH' : mId.includes('amphet') ? 'AMP' : mId.includes('caffeine') ? 'Kofein' : log.data.medicationName;
        groupData.totals[shortName] = (groupData.totals[shortName] || 0) + Number(log.data.dose);
      }
    });
    return groups;
  }, [logs]);

  const startEdit = (log: any) => {
    setEditingLogId(log.id);
    if (log.type === 'medication') {
      setEditDose(String(log.original.data.dose));
    }
    const d = new Date(log.original.timestamp);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setEditTime(d.toISOString().slice(0, 16));
  };

  const saveEdit = async (log: any) => {
    const updatedLog = { ...log.original };
    updatedLog.timestamp = new Date(editTime);
    if (log.type === 'medication') {
      updatedLog.data.dose = Number(editDose);
      updatedLog.data.takenAt = updatedLog.timestamp.getTime();
    } else if (log.type === 'sleep') {
      updatedLog.data.wokeUpAt = updatedLog.timestamp.getTime();
      updatedLog.data.date = new Date(updatedLog.timestamp).setHours(0,0,0,0);
    }
    await addCognitiveLog(updatedLog);
    setEditingLogId(null);
  };

  return (
    <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[420px_1fr]">
      <QuickLogForm 
        onLog={addCognitiveLog} 
        medications={medications.length > 0 ? medications : Object.values(MEDICATION_PRESETS)} 
      />
      <div className="card-base min-h-0 flex flex-col p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Historie záznamů</h3>
          <span className="text-sm font-medium text-muted">{logs.length} záznamů</span>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
          {groupedLogs.map(group => {
            const totalsText = Object.entries(group.data.totals)
              .map(([name, sum]) => `${Math.round(sum * 10) / 10}mg ${name}`)
              .join(' + ');

            return (
              <div key={group.title} className="rounded-xl border border-card-border/50 overflow-hidden shrink-0">
                <button 
                  onClick={() => toggleGroup(group.title)}
                  className="w-full bg-card-border/10 px-4 py-3 flex items-center justify-between hover:bg-card-border/20 transition-colors text-left"
                >
                  <span className="font-semibold text-sm">
                    {group.title}
                    {totalsText && <span className="ml-2 text-accent-cyan font-medium">({totalsText})</span>}
                  </span>
                  <span className="text-xs text-muted flex items-center gap-2">
                    {group.data.logs.length}
                    <span className={`transition-transform ${expandedGroups[group.title] ? 'rotate-180' : ''}`}>▼</span>
                  </span>
                </button>
                {expandedGroups[group.title] && (
                  <div className="p-3 pt-2 bg-card-border/5 border-t border-card-border/20">
                    <div className="grid gap-2">
                      {group.data.logs.map((log) => (
                      editingLogId === log.id ? (
                        <div key={log.id} className="flex flex-col gap-3 rounded-xl border border-accent-cyan/50 bg-accent-cyan/5 px-4 py-3">
                          <div className="flex items-center gap-2">
                            {log.type === 'medication' && (
                              <div className="flex-1">
                                <label className="text-xs text-muted mb-1 block">Dávka (mg)</label>
                                <input type="number" step="0.1" className="input-base" value={editDose} onChange={e => setEditDose(e.target.value)} />
                              </div>
                            )}
                            <div className="flex-[2]">
                              <label className="text-xs text-muted mb-1 block">Čas záznamu</label>
                              <input type="datetime-local" className="input-base" value={editTime} onChange={e => setEditTime(e.target.value)} />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end mt-1">
                            <button onClick={() => setEditingLogId(null)} className="px-3 py-1.5 text-xs font-medium text-muted hover:bg-card-border/20 rounded-lg transition">Zrušit</button>
                            <button onClick={() => saveEdit(log)} className="px-3 py-1.5 text-xs font-semibold text-white bg-accent-cyan hover:bg-accent-cyan/90 rounded-lg transition">Uložit změny</button>
                          </div>
                        </div>
                      ) : (
                        <div key={log.id} className="flex items-center justify-between rounded-xl border border-card-border/70 bg-background px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{log.label}</p>
                            <p className="text-xs font-medium capitalize text-muted">{log.type.replace('_', ' ')}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold tabular-nums text-muted mr-1">{log.time}</span>
                            {log.type === 'medication' || log.type === 'sleep' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEdit(log)}
                                  className="rounded-lg border border-card-border/80 px-2 py-1 text-xs font-semibold text-muted transition hover:bg-card-border/30 hover:text-foreground"
                                  title="Upravit záznam"
                                >
                                  Upravit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeCognitiveLog(log.id)}
                                  className="rounded-lg border border-card-border/80 px-2 py-1 text-xs font-semibold text-muted transition hover:border-[var(--accent-red)]/40 hover:bg-[var(--accent-red)]/10 hover:text-[var(--accent-red)]"
                                  title="Smazat záznam"
                                >
                                  Smazat
                                </button>
                              </>
                            ) : null}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
