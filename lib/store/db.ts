import { IDBPDatabase, openDB } from 'idb';
import { CognitiveLog, EffectiveRange, LocalProfile, MedicationProfile, UserProfile } from '@/types';

let db: IDBPDatabase;

const DB_NAME = 'SynapseFlow';
const DB_VERSION = 1;
const STORES = {
  LOGS: 'cognitive_logs',
  MEDICATIONS: 'medication_profiles',
  SETTINGS: 'settings',
} as const;

type SettingValue = string[] | UserProfile | EffectiveRange | LocalProfile;

export async function initDB() {
  if (db) return db;

  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORES.LOGS)) {
        const logStore = database.createObjectStore(STORES.LOGS, { keyPath: 'id' });
        logStore.createIndex('timestamp', 'timestamp');
      }
      if (!database.objectStoreNames.contains(STORES.MEDICATIONS)) {
        database.createObjectStore(STORES.MEDICATIONS, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
        database.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
    },
  });

  return db;
}

const reviveLogDates = (log: CognitiveLog): CognitiveLog => ({
  ...log,
  timestamp: log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp),
});

export async function addLog(log: CognitiveLog) {
  const database = await initDB();
  return database.put(STORES.LOGS, log);
}

export async function deleteLog(id: string) {
  const database = await initDB();
  return database.delete(STORES.LOGS, id);
}

export async function getAllLogs(limit?: number): Promise<CognitiveLog[]> {
  const database = await initDB();
  const allLogs = (await database.getAll(STORES.LOGS)) as CognitiveLog[];
  const sortedLogs = allLogs
    .map(reviveLogDates)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  return limit ? sortedLogs.slice(-limit) : sortedLogs;
}

export async function addMedicationProfile(profile: MedicationProfile) {
  const database = await initDB();
  return database.put(STORES.MEDICATIONS, profile);
}

export async function getAllMedicationProfiles(): Promise<MedicationProfile[]> {
  const database = await initDB();
  return database.getAll(STORES.MEDICATIONS) as Promise<MedicationProfile[]>;
}

export async function getSetting<T extends SettingValue>(key: string): Promise<T | undefined> {
  const database = await initDB();
  const record = await database.get(STORES.SETTINGS, key);
  return record?.value as T | undefined;
}

export async function setSetting<T extends SettingValue>(key: string, value: T) {
  const database = await initDB();
  return database.put(STORES.SETTINGS, { key, value });
}

export async function clearAllData() {
  const database = await initDB();
  const tx = database.transaction([STORES.LOGS, STORES.MEDICATIONS, STORES.SETTINGS], 'readwrite');
  await Promise.all([
    tx.objectStore(STORES.LOGS).clear(),
    tx.objectStore(STORES.MEDICATIONS).clear(),
    tx.objectStore(STORES.SETTINGS).clear(),
    tx.done,
  ]);
}
