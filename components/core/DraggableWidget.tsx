'use client';

import { ReactNode, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DraggableWidgetProps {
  id: string;
  children: ReactNode;
  size?: 'small' | 'wide' | 'full';
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export default function DraggableWidget({
  id,
  children,
  size = 'small',
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
}: DraggableWidgetProps) {
  const [showControls, setShowControls] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : undefined,
    opacity: isDragging ? 0.75 : 1,
  };
  const sizeClass = {
    small: 'min-h-[220px]',
    wide: 'lg:col-span-2 min-h-[220px]',
    full: 'lg:col-span-full',
  }[size];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group h-full ${sizeClass}`}
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
          <button
            type="button"
            className="px-2 py-1 text-xs text-muted cursor-grab active:cursor-grabbing select-none"
            title="Přetáhnout widget"
            {...attributes}
            {...listeners}
          >
            ⋮⋮
          </button>
        </div>
      )}
    </div>
  );
}
