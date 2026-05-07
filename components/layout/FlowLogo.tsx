'use client';

interface FlowLogoProps {
  compact?: boolean;
}

export default function FlowLogo({ compact = false }: FlowLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-foreground text-white shadow-[0_12px_30px_rgb(20_33_35/0.18)]">
        <svg viewBox="0 0 40 40" aria-hidden="true" className="h-7 w-7">
          <path
            d="M8 22.5c4.2-8.2 9.2-8.2 12.8 0 2.5 5.7 6.4 5.8 11.2.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M8 17.5c4.7 5.8 9.5 5.8 14.3 0 3.1-3.8 6.1-3.9 9.7-.3"
            fill="none"
            stroke="#7dd3c7"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeOpacity="0.16" strokeWidth="1.5" />
        </svg>
      </div>
      {!compact ? (
        <div className="flex flex-col">
          <span className="text-xl font-semibold leading-none tracking-tight text-foreground">Flow</span>
          <span className="mt-1 text-xs font-medium leading-none text-muted">cognitive state tracker</span>
        </div>
      ) : null}
    </div>
  );
}
