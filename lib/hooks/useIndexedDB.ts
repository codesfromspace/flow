'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  initDB,
  addLog,
  getAllLogs,
  addMedicationProfile,
  getAllMedicationProfiles,
  getSetting,
  setSetting,
} from '@/lib/store/db';

export function useIndexedDB() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initDB()
      .then(() => setIsInitialized(true))
      .catch((error) => {
        console.error('Failed to initialize IndexedDB:', error);
        setIsInitialized(true);
      });
  }, []);

  const getMedicationProfiles = useCallback(async () => {
    if (!isInitialized) return [];
    return getAllMedicationProfiles();
  }, [isInitialized]);

  return {
    isInitialized,
    addLog,
    getAllLogs,
    addMedicationProfile,
    getMedicationProfiles,
    getSetting,
    setSetting,
  };
}
