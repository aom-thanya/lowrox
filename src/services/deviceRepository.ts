import type { UserId } from '../types/models';

// Mock persistence for watch/app connections, one map per user in localStorage.
// Replace with the real OAuth flow per provider (Garmin Health API, COROS, Strava, ...).

export type ProviderId = 'garmin' | 'coros' | 'strava' | 'suunto' | 'polar' | 'apple_health';

export interface Provider {
  id: ProviderId;
  name: string;
  description: string;
  mark: string; // short letter mark on the provider's color
  color: string;
  // Apple Health has no web API; it needs the iPhone app.
  appOnly?: boolean;
}

export const PROVIDERS: Provider[] = [
  { id: 'garmin', name: 'Garmin Connect', description: 'นาฬิกา Garmin ทุกรุ่น เช่น Forerunner, Fenix, Venu', mark: 'G', color: '#007CC3' },
  { id: 'coros', name: 'COROS', description: 'PACE, APEX, VERTIX', mark: 'C', color: '#19191C' },
  { id: 'strava', name: 'Strava', description: 'ดึงกิจกรรมที่บันทึกไว้ใน Strava', mark: 'S', color: '#FC4C02' },
  { id: 'suunto', name: 'Suunto', description: 'Suunto Race, Vertical, 9 Peak', mark: 'S', color: '#3F3F46' },
  { id: 'polar', name: 'Polar', description: 'Polar Pacer, Vantage, Grit X', mark: 'P', color: '#D10027' },
  { id: 'apple_health', name: 'Apple Health', description: 'Apple Watch และ iPhone', mark: '♥', color: '#FF2D55', appOnly: true },
];

export interface Connection {
  provider: ProviderId;
  connectedAt: string;
  lastSyncAt: string;
  importRuns: boolean;   // add synced runs to My Level
  postToParty: boolean;  // share synced runs to the feed of parties you joined
}

type DeviceStorage = Pick<Storage, 'getItem' | 'setItem'>;
const devicesKey = (userId: UserId) => `lowrox:devices:${userId}`;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function listConnections(userId: UserId, storage: DeviceStorage = localStorage): Partial<Record<ProviderId, Connection>> {
  return JSON.parse(storage.getItem(devicesKey(userId)) || '{}');
}

function save(userId: UserId, connections: Partial<Record<ProviderId, Connection>>, storage: DeviceStorage) {
  storage.setItem(devicesKey(userId), JSON.stringify(connections));
  return connections;
}

export async function connectProvider(userId: UserId, provider: ProviderId, storage: DeviceStorage = localStorage) {
  await delay(1200); // stands in for the provider's consent screen
  const now = new Date().toISOString();
  const connection: Connection = { provider, connectedAt: now, lastSyncAt: now, importRuns: true, postToParty: false };
  return save(userId, { ...listConnections(userId, storage), [provider]: connection }, storage);
}

export async function syncProvider(userId: UserId, provider: ProviderId, storage: DeviceStorage = localStorage) {
  await delay(800);
  const current = listConnections(userId, storage);
  if (!current[provider]) throw new Error('Not connected');
  return save(userId, { ...current, [provider]: { ...current[provider]!, lastSyncAt: new Date().toISOString() } }, storage);
}

export async function updateConnection(userId: UserId, provider: ProviderId, changes: Partial<Pick<Connection, 'importRuns' | 'postToParty'>>, storage: DeviceStorage = localStorage) {
  await delay(200);
  const current = listConnections(userId, storage);
  if (!current[provider]) throw new Error('Not connected');
  return save(userId, { ...current, [provider]: { ...current[provider]!, ...changes } }, storage);
}

export async function disconnectProvider(userId: UserId, provider: ProviderId, storage: DeviceStorage = localStorage) {
  await delay(300);
  const { [provider]: _removed, ...rest } = listConnections(userId, storage);
  return save(userId, rest, storage);
}
