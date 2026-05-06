'use client';

import { useState, useEffect } from 'react';
import { CognitiveLog } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface QuickLogFormProps {
  onLog: (log: CognitiveLog) => Promise<void>;
  medications: Array<{ id: string; name: string }>;
}

type LogTab = 'dose' | 'mood' | 'focus';

export default function QuickLogForm({ onLog, medications }: QuickLogFormProps) {
  const [activeTab, setActiveTab] = useState<LogTab>('dose');
  const [loading, setLoading] = useState(false);

  // Dose form state
  const [selectedMed, setSelectedMed] = useState('');
  const [dose, setDose] = useState('10');

  // Update selectedMed when medications prop changes
  useEffect(() => {
    if (medications.length > 0 && !selectedMed) {
      setSelectedMed(medications[0].id);
    }
  }, [medications, selectedMed]);

  // Mood form state
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [moodFocus, setMoodFocus] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [anxiety, setAnxiety] = useState<1 | 2 | 3 | 4 | 5>(3);

  // Focus form state
  const [focusLevel, setFocusLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [clarity, setClarity] = useState<1 | 2 | 3 | 4 | 5>(3);

  const handleLogDose = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const med = medications.find((m) => m.id === selectedMed);
    const log: CognitiveLog = {
      id: uuidv4(),
      timestamp: new Date(),
      logType: 'medication',
      data: {
        medicationId: selectedMed,
        medicationName: med?.name || 'Unknown',
        dose: parseFloat(dose),
        doseUnit: 'mg',
        releaseType: 'instant',
        takenAt: Date.now(),
      },
    };

    try {
      await onLog(log);
      setDose('10');
    } catch (error) {
      console.error('Error logging dose:', error);
    } finally {
      setLoading(false);
    }
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
    onChange: (v: number) => void;
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
        onChange={(e) => onChange(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
        className="w-full h-1.5 bg-card-border/30 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
      />
      <div className="flex justify-between text-xs text-muted">
        <span>Poor</span>
        <span>Good</span>
      </div>
    </div>
  );

  return (
    <div className="card-base p-4 border border-accent-cyan/20">
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
            {tab === 'dose'
              ? '💊 Dose'
              : tab === 'mood'
                ? '😊 Mood'
                : '🎯 Focus'}
          </button>
        ))}
      </div>

      {/* Dose Tab */}
      {activeTab === 'dose' && (
        <form onSubmit={handleLogDose} className="space-y-4">
          <div>
            <label className="text-label mb-2 block">Medication</label>
            <select
              value={selectedMed}
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
              step="0.1"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              className="input-base"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
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
