'use client';

import { useEffect, useState } from 'react';
import FlowLogo from './FlowLogo';

interface HeaderProps {
  onOpenInfo?: () => void;
  profileName?: string;
}

export default function Header({ onOpenInfo, profileName }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('cs-CZ', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
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
    <header className="sticky top-0 z-40 border-b border-card-border/80 bg-[var(--background)]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <p className="hidden text-sm font-medium text-muted sm:block">{currentDate}</p>
          </div>
          <div className="flex items-center gap-4">
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
              <div className="text-lg font-semibold tabular-nums text-foreground">{currentTime}</div>
              <div className="text-xs font-medium text-muted">{profileName || 'local profile'}</div>
            </div>
            <div className="h-2.5 w-2.5 rounded-full bg-[var(--accent-green)] shadow-[0_0_0_4px_rgb(47_155_114/0.12)]" />
          </div>
        </div>
      </div>
    </header>
  );
}
