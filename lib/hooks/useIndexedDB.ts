'use client';
import { useState, useEffect, useCallback } from 'react';
import { initDB, addLog, getAllLogs, addMedicationProfile, getAllMedicationProfiles } from '@/lib/store/db';
export function useIndexedDB() {
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    initDB().then(() => setIsInitialized(true));
  }, []);
  const getMedicationProfiles = useCallback(async () => {
    if (!isInitialized) return [];
    return getAllMedicationProfiles();
  }, [isInitialized]);
  return { isInitialized, addLog, getAllLogs, addMedicationProfile, getMedicationProfiles };
}
