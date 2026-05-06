import { IDBPDatabase, openDB } from 'idb';
let db: IDBPDatabase<any>;
const DB_NAME = 'SynapseFlow';
const DB_VERSION = 1;
const STORES = { LOGS: 'cognitive_logs', MEDICATIONS: 'medication_profiles', SETTINGS: 'settings' };
export async function initDB() {
  if (db) return db;
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORES.LOGS)) {
        const logStore = db.createObjectStore(STORES.LOGS, { keyPath: 'id' });
        logStore.createIndex('timestamp', 'timestamp');
      }
      if (!db.objectStoreNames.contains(STORES.MEDICATIONS)) {
        db.createObjectStore(STORES.MEDICATIONS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
    },
  });
  return db;
}
export async function addLog(log: any) {
  const database = await initDB();
  return database.put(STORES.LOGS, log);
}
export async function getAllLogs(limit?: number) {
  const database = await initDB();
  const allLogs = await database.getAll(STORES.LOGS);
  return limit ? allLogs.slice(-limit) : allLogs;
}
export async function addMedicationProfile(profile: any) {
  const database = await initDB();
  return database.put(STORES.MEDICATIONS, profile);
}
export async function getAllMedicationProfiles() {
  const database = await initDB();
  return database.getAll(STORES.MEDICATIONS);
}
