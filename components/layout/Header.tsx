'use client';

import { useEffect, useState } from 'react';

interface HeaderProps {
  onOpenInfo?: () => void;
}

export default function Header({ onOpenInfo }: HeaderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('synapse-theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('synapse-theme', newTheme);
    const html = document.documentElement;
    if (newTheme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-card-border/30 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-title font-medium tracking-tight text-accent-cyan">Synapse Flow</h1>
            <p className="text-label text-muted">{currentDate}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenInfo}
              className="p-2 rounded-lg bg-card-bg hover:bg-card-border/30 transition-colors"
              aria-label="Open info"
              title="Info, export, settings"
            >
              <span className="text-lg">ℹ️</span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-card-bg hover:bg-card-border/30 transition-colors"
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <span className="text-lg">🌙</span>
              ) : (
                <span className="text-lg">☀️</span>
              )}
            </button>
            <div className="text-right">
              <div className="text-headline font-light">{currentTime}</div>
              <div className="text-label text-muted">cognitive state</div>
            </div>
            <div className="w-2 h-2 rounded-full bg-status-success animate-pulseSoft" />
          </div>
        </div>
      </div>
    </header>
  );
}
