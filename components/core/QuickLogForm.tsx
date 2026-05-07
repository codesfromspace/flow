'use client';

import { useState, useEffect } from 'react';
import { CognitiveLog, MedicationProfile } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface QuickLogFormProps {
  onLog: (log: CognitiveLog) => Promise<void>;
  medications: MedicationProfile[];
}

type LogTab = 'dose' | 'mood' | 'focus';
type Rating = 1 | 2 | 3 | 4 | 5;

export default function QuickLogForm({ onLog, medications }: QuickLogFormProps) {
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

  // Mood form state
  const [mood, setMood] = useState<Rating>(3);
  const [moodFocus, setMoodFocus] = useState<Rating>(3);
  const [anxiety, setAnxiety] = useState<Rating>(3);

  // Focus form state
  const [focusLevel, setFocusLevel] = useState<Rating>(3);
  const [clarity, setClarity] = useState<Rating>(3);
  const selectedMedicationId = selectedMed || medications[0]?.id || '';

  const handleLogDose = async (e: React.FormEvent) => {
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
      setDose(String(med.defaultDose ?? parsedDose));
      setDoseTimeMode('now');
      setCustomTakenAt('');
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

    const [hours, minutes] = customTakenAt.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.getTime();
  };

  const handleLogMood = async (e: React.FormEvent) => {
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
        clarity: 3,
        energy: 3,
      },
    };

    try {
      await onLog(log);
      setMood(3);
      setMoodFocus(3);
      setAnxiety(3);
    } catch (error) {
      console.error('Error logging mood:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogFocus = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const log: CognitiveLog = {
      id: uuidv4(),
      timestamp: new Date(),
      logType: 'focus',
      data: {
        focus: focusLevel,
        clarity,
        taskCategory: 'general',
      },
    };

    try {
      await onLog(log);
      setFocusLevel(3);
      setClarity(3);
    } catch (error) {
      console.error('Error logging focus:', error);
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
    <div className="card-base p-4 border border-card-border/90">
      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {(['dose', 'mood', 'focus'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-accent-cyan/20 text-accent-cyan'
                : 'bg-card-border/20 text-muted hover:bg-card-border/30'
            }`}
          >
            {tab === 'dose' ? 'Dose' : tab === 'mood' ? 'Mood' : 'Focus'}
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
                  onClick={() => setDoseTimeMode(value as typeof doseTimeMode)}
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
                type="time"
                value={customTakenAt}
                onChange={(e) => setCustomTakenAt(e.target.value)}
                className="input-base mt-3"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !selectedMedicationId || Number(dose) <= 0 || (doseTimeMode === 'custom' && !customTakenAt)}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Logging...' : 'Log Dose'}
          </button>
        </form>
      )}

      {/* Mood Tab */}
      {activeTab === 'mood' && (
        <form onSubmit={handleLogMood} className="space-y-4">
          <SliderInput label="Mood" value={mood} onChange={setMood} />
          <SliderInput label="Focus" value={moodFocus} onChange={setMoodFocus} />
          <SliderInput label="Anxiety" value={anxiety} onChange={setAnxiety} />

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Logging...' : 'Log Mood'}
          </button>
        </form>
      )}

      {/* Focus Tab */}
      {activeTab === 'focus' && (
        <form onSubmit={handleLogFocus} className="space-y-4">
          <SliderInput label="Focus Level" value={focusLevel} onChange={setFocusLevel} />
          <SliderInput label="Clarity" value={clarity} onChange={setClarity} />

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Logging...' : 'Log Focus'}
          </button>
        </form>
      )}
    </div>
  );
}
