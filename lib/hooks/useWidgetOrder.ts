import { useState, useEffect } from 'react';

export const DEFAULT_WIDGET_ORDER = [
  'cognitive-state',
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
        const dbRequest = indexedDB.open('SynapseFlow', 1);
        dbRequest.onsuccess = () => {
          const db = dbRequest.result;
          const tx = db.transaction(['settings'], 'readonly');
          const store = tx.objectStore('settings');
          const request = store.get('widgetOrder');
          request.onsuccess = () => {
            if (request.result) {
              setWidgetOrder(request.result.value);
            }
          };
        };
      } catch (err) {
        console.error('Failed to load widget order:', err);
      }
    };
    loadOrder();
  }, []);

  const saveOrder = async (newOrder: string[]) => {
    setWidgetOrder(newOrder);
    try {
      const dbRequest = indexedDB.open('SynapseFlow', 1);
      dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const tx = db.transaction(['settings'], 'readwrite');
        tx.objectStore('settings').put({
          key: 'widgetOrder',
          value: newOrder,
        });
      };
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
