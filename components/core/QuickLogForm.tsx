'use client';

import { useState, useEffect } from 'react';
import { CognitiveLog, MedicationProfile } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface QuickLogFormProps {
  onLog: (log: CognitiveLog) => Promise<void>;
  medications: MedicationProfile[];
}

type LogTab = 'dose' | 'state' | 'sleep';
type Rating = 1 | 2 | 3 | 4 | 5;

import { useCognitiveState } from '@/lib/context/CognitiveStateContext';
import ActivationCurve from '@/components/charts/ActivationCurve';

export default function QuickLogForm({ onLog, medications }: QuickLogFormProps) {
  const { timelineData, currentTime, effectiveRange } = useCognitiveState();
  const [activeTab, setActiveTab] = useState<LogTab>('dose');
  const [loading, setLoading] = useState(false);

  // Dose form state
  const [selectedMed, setSelectedMed] = useState('');
  const [dose, setDose] = useState('10');
  const [doseTimeMode, setDoseTimeMode] = useState<'now' | '15' | '30' | 'custom'>('now');
  const [customTakenAt, setCustomTakenAt] = useState('');

  // Update selectedMed when medications prop changes
  useEffect(() => {
    if (medications.length > 0 && !selectedMed) {
      setSelectedMed(medications[0].id);
      setDose(String(medications[0].defaultDose ?? 10));
    }
  }, [medications, selectedMed]);

  useEffect(() => {
    const med = medications.find((m) => m.id === selectedMed);
    if (med?.defaultDose) setDose(String(med.defaultDose));
  }, [medications, selectedMed]);

  // State form state
  const [mood, setMood] = useState<Rating>(3);
  const [moodFocus, setMoodFocus] = useState<Rating>(3);
  const [anxiety, setAnxiety] = useState<Rating>(3);
  const [clarity, setClarity] = useState<Rating>(3);
  const [energy, setEnergy] = useState<Rating>(3);

  // Sleep form state
  const [sleepTimeMode, setSleepTimeMode] = useState<'now' | 'custom'>('now');
  const [customWakeAt, setCustomWakeAt] = useState('');
  const [sleepQuality, setSleepQuality] = useState<Rating>(3);
  const [sleepDuration, setSleepDuration] = useState('8');
  const selectedMedicationId = selectedMed || medications[0]?.id || '';

  const handleLogDose = async (e: React.FormEvent | React.MouseEvent, keepState = false) => {
    e.preventDefault();
    setLoading(true);

    const med = medications.find((m) => m.id === selectedMedicationId);
    const parsedDose = Number(dose);
    const takenAt = getTakenAt();

    if (!med || !Number.isFinite(parsedDose) || parsedDose <= 0 || !takenAt) {
      setLoading(false);
      return;
    }

    const log: CognitiveLog = {
      id: uuidv4(),
      timestamp: new Date(takenAt),
      logType: 'medication',
      data: {
        medicationId: selectedMedicationId,
        medicationName: med.name,
        dose: parsedDose,
        doseUnit: 'mg',
        releaseType: med.releaseType ?? 'instant',
        takenAt,
      },
    };

    try {
      await onLog(log);
      if (!keepState) {
        setDose(String(med.defaultDose ?? parsedDose));
        setDoseTimeMode('now');
        setCustomTakenAt('');
      }
    } catch (error) {
      console.error('Error logging dose:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTakenAt = () => {
    if (doseTimeMode === 'now') return Date.now();
    if (doseTimeMode === '15') return Date.now() - 15 * 60 * 1000;
    if (doseTimeMode === '30') return Date.now() - 30 * 60 * 1000;
    if (!customTakenAt) return null;

    return new Date(customTakenAt).getTime();
  };

  const handleTimeModeChange = (mode: typeof doseTimeMode) => {
    setDoseTimeMode(mode);
    if (mode === 'custom' && !customTakenAt) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setCustomTakenAt(now.toISOString().slice(0, 16));
    }
  };

  const handleLogState = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const log: CognitiveLog = {
      id: uuidv4(),
      timestamp: new Date(),
      logType: 'mood',
      data: {
        mood,
        focus: moodFocus,
        anxiety,
        clarity,
        energy,
      },
    };

    try {
      await onLog(log);
      setMood(3);
      setMoodFocus(3);
      setAnxiety(3);
      setClarity(3);
      setEnergy(3);
    } catch (error) {
      console.error('Error logging state:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWakeAt = () => {
    if (sleepTimeMode === 'now') return Date.now();
    if (!customWakeAt) return null;
    return new Date(customWakeAt).getTime();
  };

  const handleSleepTimeModeChange = (mode: typeof sleepTimeMode) => {
    setSleepTimeMode(mode);
    if (mode === 'custom' && !customWakeAt) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setCustomWakeAt(now.toISOString().slice(0, 16));
    }
  };

  const handleLogSleep = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const wakeAt = getWakeAt();
    if (!wakeAt) {
      setLoading(false);
      return;
    }

    const log: CognitiveLog = {
      id: uuidv4(),
      timestamp: new Date(wakeAt),
      logType: 'sleep',
      data: {
        date: new Date(wakeAt).setHours(0, 0, 0, 0),
        wokeUpAt: wakeAt,
        duration: Number(sleepDuration),
        quality: sleepQuality,
      },
    };

    try {
      await onLog(log);
      setSleepTimeMode('now');
      setCustomWakeAt('');
      setSleepQuality(3);
      setSleepDuration('8');
    } catch (error) {
      console.error('Error logging sleep:', error);
    } finally {
      setLoading(false);
    }
  };

  const SliderInput = ({
    label,
    value,
    onChange,
    showValue = true,
  }: {
    label: string;
    value: number;
    onChange: (v: Rating) => void;
    showValue?: boolean;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm text-muted">{label}</label>
        {showValue && <span className="text-sm font-medium text-accent-cyan">{value}</span>}
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as Rating)}
        className="w-full h-1.5 bg-card-border/30 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
      />
      <div className="flex justify-between text-xs text-muted">
        <span>Poor</span>
        <span>Good</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {timelineData?.length > 0 && (
        <div className="card-base p-2 border border-card-border/50">
          <ActivationCurve 
            data={timelineData} 
            medications={medications.map(m => ({ name: m.name, color: '#0e9fa8', doseTime: 0 }))} 
            currentTime={currentTime} 
            effectiveRange={effectiveRange} 
            height={160} 
            mini={true} 
          />
        </div>
      )}
      <div className="card-base p-4 border border-card-border/90">
        {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {(['dose', 'state', 'sleep'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-accent-cyan/20 text-accent-cyan'
                : 'bg-card-border/20 text-muted hover:bg-card-border/30'
            }`}
          >
            {tab === 'dose' ? 'Dose' : tab === 'state' ? 'State Check' : 'Sleep'}
          </button>
        ))}
      </div>

      {/* Dose Tab */}
      {activeTab === 'dose' && (
        <form onSubmit={handleLogDose} className="space-y-4">
          <div>
            <label className="text-label mb-2 block">Medication</label>
            <select
              value={selectedMedicationId}
              onChange={(e) => setSelectedMed(e.target.value)}
              className="input-base"
            >
              {medications.map((med) => (
                <option key={med.id} value={med.id}>
                  {med.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-label mb-2 block">Dose (mg)</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              className="input-base"
            />
            {selectedMedicationId === 'methylphenidate-ir' && (
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setDose('5')} className="px-3 py-1.5 rounded bg-card-border/20 text-xs font-medium text-muted hover:bg-card-border/30 transition-colors">1/2 tbl (5mg)</button>
                <button type="button" onClick={() => setDose('10')} className="px-3 py-1.5 rounded bg-card-border/20 text-xs font-medium text-muted hover:bg-card-border/30 transition-colors">1 tbl (10mg)</button>
                <button type="button" onClick={() => setDose('20')} className="px-3 py-1.5 rounded bg-card-border/20 text-xs font-medium text-muted hover:bg-card-border/30 transition-colors">2 tbl (20mg)</button>
              </div>
            )}
            {selectedMedicationId === 'caffeine' && (
              <div className="flex flex-wrap gap-2 mt-2">
                <button type="button" onClick={() => setDose('80')} className="px-3 py-1.5 rounded bg-card-border/20 text-xs font-medium text-muted hover:bg-card-border/30 transition-colors">Red Bull bez cukru (80mg)</button>
                <button type="button" onClick={() => setDose('60')} className="px-3 py-1.5 rounded bg-card-border/20 text-xs font-medium text-muted hover:bg-card-border/30 transition-colors">Espresso (60mg)</button>
                <button type="button" onClick={() => setDose('100')} className="px-3 py-1.5 rounded bg-card-border/20 text-xs font-medium text-muted hover:bg-card-border/30 transition-colors">Kofein. pilulka (100mg)</button>
              </div>
            )}
          </div>

          <div>
            <label className="text-label mb-2 block">Taken at</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                ['now', 'Now'],
                ['15', '-15m'],
                ['30', '-30m'],
                ['custom', 'Time'],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => handleTimeModeChange(value as typeof doseTimeMode)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    doseTimeMode === value
                      ? 'bg-accent-cyan/20 text-accent-cyan'
                      : 'bg-card-border/20 text-muted hover:bg-card-border/30'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {doseTimeMode === 'custom' && (
              <input
                type="datetime-local"
                value={customTakenAt}
                onChange={(e) => setCustomTakenAt(e.target.value)}
                className="input-base mt-3"
              />
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !selectedMedicationId || Number(dose) <= 0 || (doseTimeMode === 'custom' && !customTakenAt)}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? '...' : 'Log Dose'}
            </button>
            <button
              type="button"
              disabled={loading || !selectedMedicationId || Number(dose) <= 0 || (doseTimeMode === 'custom' && !customTakenAt)}
              onClick={(e) => handleLogDose(e, true)}
              className="w-full rounded-lg border border-accent-cyan/30 bg-accent-cyan/10 font-semibold text-accent-cyan transition hover:bg-accent-cyan/20 disabled:opacity-50"
            >
              {loading ? '...' : '+ Batch (Keep open)'}
            </button>
          </div>
        </form>
      )}

      {/* State Tab (Combined Mood & Focus) */}
      {activeTab === 'state' && (
        <form onSubmit={handleLogState} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <SliderInput label="Nálada (Mood)" value={mood} onChange={setMood} />
            <SliderInput label="Soustředění (Focus)" value={moodFocus} onChange={setMoodFocus} />
            <SliderInput label="Energie (Energy)" value={energy} onChange={setEnergy} />
            <SliderInput label="Jasnost (Clarity)" value={clarity} onChange={setClarity} />
            <SliderInput label="Úzkost (Anxiety)" value={anxiety} onChange={setAnxiety} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 mt-4"
          >
            {loading ? 'Logging...' : 'Uložit stav'}
          </button>
        </form>
      )}

      {/* Sleep Tab */}
      {activeTab === 'sleep' && (
        <form onSubmit={handleLogSleep} className="space-y-4">
          <div>
            <label className="text-label mb-2 block">Woke up at</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['now', 'Now'],
                ['custom', 'Custom Date/Time'],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => handleSleepTimeModeChange(value as typeof sleepTimeMode)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    sleepTimeMode === value
                      ? 'bg-accent-cyan/20 text-accent-cyan'
                      : 'bg-card-border/20 text-muted hover:bg-card-border/30'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {sleepTimeMode === 'custom' && (
              <input
                type="datetime-local"
                value={customWakeAt}
                onChange={(e) => setCustomWakeAt(e.target.value)}
                className="input-base mt-3"
              />
            )}
          </div>

          <div>
            <label className="text-label mb-2 block">Duration (hours)</label>
            <input
              type="number"
              min="1"
              max="24"
              step="0.5"
              value={sleepDuration}
              onChange={(e) => setSleepDuration(e.target.value)}
              className="input-base"
            />
          </div>

          <SliderInput label="Sleep Quality" value={sleepQuality} onChange={setSleepQuality} />

          <button
            type="submit"
            disabled={loading || (sleepTimeMode === 'custom' && !customWakeAt)}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Logging...' : 'Log Sleep'}
          </button>
        </form>
      )}
      </div>
    </div>
  );
}
