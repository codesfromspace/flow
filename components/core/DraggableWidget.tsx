'use client';

import { ReactNode, useState } from 'react';

interface DraggableWidgetProps {
  id: string;
  children: ReactNode;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export default function DraggableWidget({
  id,
  children,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
}: DraggableWidgetProps) {
  const [showControls, setShowControls] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {children}

      {showControls && (
        <div className="absolute -top-8 right-0 flex gap-1 bg-card-border/80 backdrop-blur-sm p-1 rounded-lg">
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="p-1 rounded text-xs hover:bg-card-border/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Posunout nahoru"
          >
            ⬆️
          </button>
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="p-1 rounded text-xs hover:bg-card-border/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Posunout dolů"
          >
            ⬇️
          </button>
          <div className="w-px bg-card-border/30" />
          <span className="px-2 py-1 text-xs text-muted cursor-grab active:cursor-grabbing select-none">
            ⋮⋮
          </span>
        </div>
      )}
    </div>
  );
}
