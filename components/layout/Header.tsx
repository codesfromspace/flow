'use client';

import { useEffect, useState } from 'react';

interface HeaderProps {
  onOpenInfo?: () => void;
}

export default function Header({ onOpenInfo }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-card-border/30 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-title font-medium tracking-tight text-accent-cyan">
                Synapse Flow
              </h1>
              <p className="text-label text-muted">{currentDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onOpenInfo ? (
              <button
                type="button"
                onClick={onOpenInfo}
                className="btn-secondary text-sm"
              >
                Info
              </button>
            ) : null}
            <div className="text-right">
              <div className="text-headline font-light">{currentTime}</div>
              <div className="text-label text-muted">your cognitive state</div>
            </div>
            <div className="w-2 h-2 rounded-full bg-status-green animate-pulse-soft" />
          </div>
        </div>
      </div>
    </header>
  );
}
