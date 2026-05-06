'use client';

import { useState, useEffect } from 'react';
import { CognitiveLog } from '@/types';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: CognitiveLog[];
}

interface UserProfile {
  age?: number;
  weight?: number;
  height?: number;
  wakeUpTime?: string;
}

export default function InfoModal({ isOpen, onClose, logs }: InfoModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'export' | 'settings'>('info');
  const [exportStatus, setExportStatus] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
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
        console.error('Failed to load profile:', err);
      }
    };
    if (isOpen) loadProfile();
  }, [isOpen]);

  const generateMarkdown = () => {
    const date = new Date().toLocaleString('cs-CZ');
    const medicationLogs = logs.filter(l => l.logType === 'medication');
    const moodLogs = logs.filter(l => l.logType === 'mood');
    const sleepLogs = logs.filter(l => l.logType === 'sleep');

    const markdown = `# Synapse Flow Data Export
**Datum exportu:** ${date}

## Přehled dat
- **Celkový počet záznamů:** ${logs.length}
- **Medicína:** ${medicationLogs.length}
- **Nálada:** ${moodLogs.length}
- **Spánek:** ${sleepLogs.length}

## Medicína
${medicationLogs.map(log => `- **${log.data.medicationName}** ${log.data.dose}mg - ${new Date(log.timestamp).toLocaleString('cs-CZ')}`).join('\n')}

## Nálada
${moodLogs.map(log => `- Nálada: ${log.data.mood}/5, Fokus: ${log.data.focus}/5, Úzkost: ${log.data.anxiety}/5 - ${new Date(log.timestamp).toLocaleString('cs-CZ')}`).join('\n')}

## Spánek
${sleepLogs.map(log => `- Kvalita: ${log.data.quality}/5, Trvání: ${log.data.duration.toFixed(1)}h - ${new Date(log.data.date).toLocaleString('cs-CZ')}`).join('\n')}

---
*Vygenerováno aplikací Synapse Flow - Local-first cognitive tracking*`;

    return markdown;
  };

  const handleExport = async () => {
    const markdown = generateMarkdown();

    try {
      // Zkopíruj do clipboardu
      await navigator.clipboard.writeText(markdown);
      setExportStatus('✓ Zkopírováno do clipboardu!');

      // Vytvoř download soubor
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/markdown;charset=utf-8,' + encodeURIComponent(markdown));
      element.setAttribute('download', `synapse-flow-${new Date().toISOString().split('T')[0]}.md`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setTimeout(() => setExportStatus(''), 3000);
    } catch (err) {
      setExportStatus('✗ Chyba při exportu');
    }
  };

  const handleSaveProfile = async () => {
    try {
      const dbRequest = indexedDB.open('SynapseFlow', 1);
      dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const tx = db.transaction(['settings'], 'readwrite');
        tx.objectStore('settings').put({
          key: 'userProfile',
          value: userProfile,
        });
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 2000);
      };
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  };

  const handleDeleteAllData = () => {
    if (confirm('Opravdu chceš smazat VŠECHNA data? Tuto akci nelze vrátit.')) {
      (async () => {
        const dbRequest = indexedDB.open('SynapseFlow', 1);
        dbRequest.onsuccess = () => {
          const db = dbRequest.result;
          const tx = db.transaction(['cognitive_logs', 'medication_profiles', 'settings'], 'readwrite');
          tx.objectStore('cognitive_logs').clear();
          tx.objectStore('medication_profiles').clear();
          tx.objectStore('settings').clear();
          tx.oncomplete = () => {
            alert('Všechna data byla smazána');
            window.location.reload();
          };
        };
      })();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card-base max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-card-border/30">
          <h2 className="text-title font-medium">Synapse Flow</h2>
          <button
            onClick={onClose}
            className="text-2xl text-muted hover:text-foreground transition"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2 p-6 border-b border-card-border/30">
          {(['info', 'export', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-accent-cyan/20 text-accent-cyan'
                  : 'bg-card-border/20 text-muted hover:bg-card-border/30'
              }`}
            >
              {tab === 'info' ? 'ℹ️ Info' : tab === 'export' ? '📤 Export' : '⚙️ Nastavení'}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">O Synapse Flow</h3>
                <p className="text-sm text-muted mb-4">
                  Osobní systém pro sledování kognitivního stavu a dynamiky psychostimulantů.
                  Veškerá data se ukládají lokálně - žádná synchronizace s externími servery.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">📋 Psychostimulanty a jejich účinky</h4>
                <ul className="text-sm text-muted space-y-2">
                  <li>• <strong>Methylphenidat (Ritalín):</strong> Onset 15-20 min, peak 1-2h, HV 3-4h</li>
                  <li>• <strong>Amphetamin:</strong> Onset 20-30 min, peak 2-3h, HV 10-12h</li>
                  <li>• <strong>Kofein:</strong> Onset 15-30 min, peak 45-60 min, HV 5-6h</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">💧 Hydratace a psychostimulanty</h4>
                <ul className="text-sm text-muted space-y-2">
                  <li>• Psychostimulanty potlačují pocit žízně</li>
                  <li>• Zvyšují ztrátu tekutin (zvýšený metabolismus)</li>
                  <li>• Dehydratace zvyšuje kardiovaskulární riziko</li>
                  <li>• Doporučení: 200-300ml vody každých 15-30 minut během efektu</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">😴 Spánek a medicína</h4>
                <ul className="text-sm text-muted space-y-2">
                  <li>• Psychostimulanty mohou interferovat se spánkem</li>
                  <li>• Ideálně posledí dávka 6-8 hodin před spánkem</li>
                  <li>• Sleep pressure: jak dlouho jsi vzhůru od posledního spánku</li>
                  <li>• Kvalita spánku ovlivňuje tolerance a efektivitu medicíny</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">⚠️ Rebound Effect</h4>
                <ul className="text-sm text-muted space-y-2">
                  <li>• Pokles soustředění po odeznění efektu medicíny</li>
                  <li>• Obvykle se projevuje 4-8 hodin po dávce</li>
                  <li>• Může být problematický bez správné hydratace a spánku</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Export dat</h3>
              <p className="text-sm text-muted">
                Exportuj svá data do Markdown formátu pro Obsidian nebo jiný editor.
              </p>

              <div className="bg-card-border/10 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">📊 Souhrn dat:</p>
                <ul className="text-xs text-muted space-y-1">
                  <li>• Celkový počet záznamů: {logs.length}</li>
                  <li>• Medicína: {logs.filter(l => l.logType === 'medication').length}</li>
                  <li>• Nálada: {logs.filter(l => l.logType === 'mood').length}</li>
                  <li>• Spánek: {logs.filter(l => l.logType === 'sleep').length}</li>
                </ul>
              </div>

              <button
                onClick={handleExport}
                className="w-full btn-primary"
              >
                📤 Exportovat do Markdown
              </button>

              {exportStatus && (
                <p className="text-sm text-center text-accent-cyan">{exportStatus}</p>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Nastavení</h3>

              <div className="space-y-4 border-b border-card-border/30 pb-4">
                <h4 className="font-medium text-sm">👤 Osobní profil</h4>
                <p className="text-xs text-muted mb-3">Tyto údaje se používají pro přesnější výpočty farmakokinetikou</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted block mb-2">Věk (roky)</label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={userProfile.age || ''}
                      onChange={(e) => setUserProfile({ ...userProfile, age: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 bg-card-bg border border-card-border/30 rounded text-sm text-foreground"
                      placeholder="např. 28"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted block mb-2">Váha (kg)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={userProfile.weight || ''}
                      onChange={(e) => setUserProfile({ ...userProfile, weight: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="w-full px-3 py-2 bg-card-bg border border-card-border/30 rounded text-sm text-foreground"
                      placeholder="např. 75.5"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted block mb-2">Výška (cm)</label>
                    <input
                      type="number"
                      min="0"
                      value={userProfile.height || ''}
                      onChange={(e) => setUserProfile({ ...userProfile, height: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 bg-card-bg border border-card-border/30 rounded text-sm text-foreground"
                      placeholder="např. 180"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted block mb-2">Čas probuzení</label>
                    <input
                      type="time"
                      value={userProfile.wakeUpTime || ''}
                      onChange={(e) => setUserProfile({ ...userProfile, wakeUpTime: e.target.value })}
                      className="w-full px-3 py-2 bg-card-bg border border-card-border/30 rounded text-sm text-foreground"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="w-full px-4 py-2 rounded-lg bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30 transition text-sm font-medium"
                >
                  💾 Uložit profil
                </button>
                {profileSaved && <p className="text-xs text-accent-cyan">✓ Profil uložen</p>}
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Správa dat</h4>
                <button
                  onClick={handleDeleteAllData}
                  className="w-full px-4 py-2 rounded-lg bg-status-danger/20 text-status-danger hover:bg-status-danger/30 transition text-sm font-medium"
                >
                  🗑️ Smazat všechna data
                </button>
                <p className="text-xs text-muted">
                  Pozor: Tuto akci nelze vrátit. Budou smazána všechna data ze aplikace.
                </p>
              </div>

              <div className="border-t border-card-border/30 pt-4">
                <h4 className="font-medium text-sm mb-2">Info</h4>
                <p className="text-xs text-muted">
                  <strong>Synapse Flow v0.1.0</strong><br/>
                  Local-first cognitive tracking<br/>
                  Všechna data se ukládají lokálně v IndexedDB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
