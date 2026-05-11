'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import InfoModal from '@/components/layout/InfoModal';
import { CognitiveStateProvider, useCognitiveState } from '@/lib/context/CognitiveStateContext';
import { v4 as uuidv4 } from 'uuid';
import { setSetting } from '@/lib/store/db';

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { isReady, localProfile, reloadProfile, logs, medications, setMedications, effectiveRange, setEffectiveRange, todayEvents } = useCognitiveState();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const pathname = usePathname();
  const [profileNameInput, setProfileNameInput] = useState('');

  const hasWakeToday = todayEvents.some((event) => event.label === 'Sleep' && event.time >= new Date().setHours(0,0,0,0));

  if (!isReady) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="card-base w-full max-w-md p-6">
          <p className="text-sm font-semibold text-muted">Načítám...</p>
        </div>
      </div>
    );
  }

  const handleCreateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    const displayName = profileNameInput.trim();
    if (!displayName) return;

    const profile = { id: uuidv4(), displayName, createdAt: Date.now() };
    await setSetting('localProfile', profile);
    await reloadProfile();
  };

  if (!localProfile) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <form onSubmit={handleCreateProfile} className="card-base w-full max-w-md space-y-5 p-6">
          <div>
            <p className="text-label mb-2">Krok 1</p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Zvolit uživatele</h1>
            <p className="mt-2 text-sm font-medium leading-relaxed text-muted">
              Žádné heslo. Profil i záznamy zůstávají lokálně v prohlížeči.
            </p>
          </div>
          <div>
            <label className="text-label mb-2 block">Jméno profilu</label>
            <input
              value={profileNameInput}
              onChange={(event) => setProfileNameInput(event.target.value)}
              className="input-base"
              placeholder="např. Jakub"
              autoFocus
            />
          </div>
          <button type="submit" disabled={!profileNameInput.trim()} className="w-full btn-primary disabled:opacity-50">
            Vytvořit profil
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <Header onOpenInfo={() => setIsInfoOpen(true)} profileName={localProfile.displayName} />
      <InfoModal 
        isOpen={isInfoOpen} 
        onClose={() => setIsInfoOpen(false)} 
        logs={logs} 
        medications={medications} 
        onMedicationSaved={(p) => setMedications(m => [...m, p])} 
        effectiveRange={effectiveRange} 
        onEffectiveRangeSaved={setEffectiveRange} 
      />

      <main className="mx-auto flex h-[calc(100vh-69px)] max-w-7xl flex-col gap-5 overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {pathname === '/wake' && 'Wake time'}
              {pathname === '/doses' && 'Doses'}
              {pathname === '/graph' && 'Graph'}
              {pathname === '/overview' && 'Overview'}
            </h2>
            <p className="text-sm font-medium text-muted">
              {pathname === '/wake' && 'Start the day by anchoring sleep pressure to when you actually got up.'}
              {pathname === '/doses' && 'Enter today’s dose timing first; the graph updates from those real entries.'}
              {pathname === '/graph' && 'Read the activation curve, useful range, and calibration guidance together.'}
              {pathname === '/overview' && 'A compact view of current cognitive state and recovery signals.'}
            </p>
          </div>

          <nav className="flex w-full gap-2 overflow-x-auto rounded-2xl border border-card-border/90 bg-card-bg p-1 lg:w-auto">
            {[
              ['/wake', hasWakeToday ? 'Wake ✓' : 'Wake'],
              ['/doses', 'Doses'],
              ['/graph', 'Graph'],
              ['/overview', 'Overview'],
            ].map(([path, label]) => (
              <Link
                key={path}
                href={path}
                className={`min-w-28 text-center rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  pathname === path
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted hover:bg-card-border/30 hover:text-foreground'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <section className="min-h-0 flex-1 overflow-hidden">
          {children}
        </section>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CognitiveStateProvider>
      <DashboardInner>{children}</DashboardInner>
    </CognitiveStateProvider>
  );
}
