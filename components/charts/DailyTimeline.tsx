'use client';

interface TimelineEvent {
  time: number;
  type: 'medication' | 'mood_check' | 'deep_work' | 'rebound' | 'crash';
  label: string;
  severity?: 'low' | 'medium' | 'high';
}

interface DailyTimelineProps {
  events: TimelineEvent[];
  currentTime: number;
  dayStart: number;
  dayEnd: number;
}

export default function DailyTimeline({ events, currentTime, dayStart, dayEnd }: DailyTimelineProps) {
  const getEventColor = (type: string, severity?: string) => {
    switch (type) {
      case 'medication': return { bg: 'bg-accent-cyan/30', border: 'border-accent-cyan', text: 'text-accent-cyan' };
      case 'mood_check': return { bg: 'bg-blue-500/30', border: 'border-blue-400', text: 'text-blue-300' };
      case 'deep_work': return { bg: 'bg-green-500/30', border: 'border-green-400', text: 'text-green-300' };
      case 'rebound': return severity === 'high' ? { bg: 'bg-red-500/30', border: 'border-red-400', text: 'text-red-300' } : { bg: 'bg-amber-500/30', border: 'border-amber-400', text: 'text-amber-300' };
      case 'crash': return { bg: 'bg-red-500/30', border: 'border-red-400', text: 'text-red-300' };
      default: return { bg: 'bg-slate-500/20', border: 'border-slate-400', text: 'text-slate-300' };
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'medication': return '💊';
      case 'mood_check': return '📊';
      case 'deep_work': return '🎯';
      case 'rebound': return '⬇️';
      case 'crash': return '💥';
      default: return '○';
    }
  };

  const getTimelinePosition = (eventTime: number): number => {
    const totalMs = dayEnd - dayStart;
    const eventMs = eventTime - dayStart;
    return (eventMs / totalMs) * 100;
  };

  const currentPosition = getTimelinePosition(currentTime);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  if (events.length === 0) {
    return (
      <div className="card-base p-6 col-span-full">
        <p className="text-label mb-2">Daily Timeline</p>
        <p className="text-muted text-sm">No events logged today</p>
      </div>
    );
  }

  return (
    <div className="card-base p-6 space-y-6 col-span-full">
      <div>
        <h3 className="text-title font-medium">Daily Timeline</h3>
        <p className="text-label text-muted">Events throughout your day</p>
      </div>

      {/* Main timeline track */}
      <div className="relative h-40 bg-gradient-to-r from-card-bg via-card-border/10 to-card-bg rounded-lg p-6 border border-card-border/30">
        {/* Grid background */}
        <div className="absolute inset-0 flex rounded-lg overflow-hidden">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 border-r border-card-border/20 last:border-r-0" />
          ))}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-accent-cyan/3 to-transparent pointer-events-none" />

        {/* Current time indicator */}
        <div className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-accent-cyan via-accent-cyan to-accent-cyan/30 transition-all shadow-lg shadow-accent-cyan/30" style={{ left: `${currentPosition}%` }}>
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs font-bold text-accent-cyan bg-card-border/50 px-2 py-1 rounded whitespace-nowrap">
            Now
          </div>
        </div>

        {/* Timeline base line */}
        <div className="absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-card-border/20 via-card-border/40 to-card-border/20 transform -translate-y-1/2" />

        {/* Events */}
        <div className="relative h-full">
          {events.map((event, idx) => {
            const position = getTimelinePosition(event.time);
            const isPast = event.time < currentTime;
            const colors = getEventColor(event.type, event.severity);

            return (
              <div key={idx} className="absolute top-1/2 transform -translate-y-1/2 group" style={{ left: `${position}%` }}>
                {/* Connection line from event to timeline */}
                <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 w-0.5 h-6 -translate-y-full transition-all ${colors.border} ${isPast ? 'opacity-40' : 'opacity-70'}`} />

                {/* Event bubble */}
                <div className={`border-2 rounded-full transition-all ${colors.bg} ${colors.border} ${colors.text} ${isPast ? 'opacity-60 shadow-md' : 'opacity-100 shadow-lg'} w-14 h-14 flex items-center justify-center text-2xl -translate-x-1/2 cursor-pointer hover:shadow-xl hover:scale-110`}>
                  {getEventIcon(event.type)}
                </div>

                {/* Hover tooltip */}
                <div className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 hidden group-hover:block z-20">
                  <div className="card-base p-3 whitespace-nowrap border border-card-border/70 shadow-lg backdrop-blur-sm">
                    <p className="font-medium text-sm">{event.label}</p>
                    <p className="text-xs text-muted mt-1">{formatTime(event.time)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time labels */}
      <div className="flex justify-between text-xs font-medium text-muted/70 px-3">
        <span>{formatTime(dayStart)}</span>
        <span>{formatTime(dayStart + (dayEnd - dayStart) / 4)}</span>
        <span>{formatTime(dayStart + (dayEnd - dayStart) / 2)}</span>
        <span>{formatTime(dayStart + (3 * (dayEnd - dayStart)) / 4)}</span>
        <span>{formatTime(dayEnd)}</span>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-card-border/20">
        {[
          { type: 'medication', label: 'Medication' },
          { type: 'mood_check', label: 'Mood Check' },
          { type: 'deep_work', label: 'Deep Work' },
          { type: 'rebound', label: 'Rebound' },
          { type: 'crash', label: 'Crash' },
        ].map((item) => (
          <div key={item.type} className="flex items-center gap-2">
            <span className="text-lg">{getEventIcon(item.type)}</span>
            <span className="text-xs font-medium text-muted">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
