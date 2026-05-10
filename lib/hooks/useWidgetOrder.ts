import { useState, useEffect } from 'react';
import { getSetting, setSetting } from '@/lib/store/db';

export const DEFAULT_WIDGET_ORDER = [
  'cognitive-state',
  'daily-summary',
  'focus-quality',
  'rebound-risk',
  'sleep-pressure',
  'mental-load',
  'hydration-reminder',
  'activation-curve',
  'daily-timeline',
];

export function useWidgetOrder() {
  const [widgetOrder, setWidgetOrder] = useState<string[]>(DEFAULT_WIDGET_ORDER);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const savedOrder = await getSetting<string[]>('widgetOrder');
        if (savedOrder) {
          const missingWidgets = DEFAULT_WIDGET_ORDER.filter(id => !savedOrder.includes(id));
          if (missingWidgets.length > 0) {
            setWidgetOrder([...savedOrder, ...missingWidgets]);
          } else {
            setWidgetOrder(savedOrder);
          }
        }
      } catch (err) {
        console.error('Failed to load widget order:', err);
      }
    };
    loadOrder();
  }, []);

  const saveOrder = async (newOrder: string[]) => {
    setWidgetOrder(newOrder);
    try {
      await setSetting('widgetOrder', newOrder);
    } catch (err) {
      console.error('Failed to save widget order:', err);
    }
  };

  const moveWidget = (fromIndex: number, toIndex: number) => {
    const newOrder = [...widgetOrder];
    const [movedWidget] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedWidget);
    saveOrder(newOrder);
  };

  const resetOrder = () => {
    saveOrder(DEFAULT_WIDGET_ORDER);
  };

  return { widgetOrder, moveWidget, resetOrder };
}
