import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface Profile {
  name: string;
  stagingFile: string;
  productionFile: string;
  createdAt: string;
}

export interface ProfileStore {
  profiles: Record<string, Profile>;
}

const CONFIG_DIR = path.join(os.homedir(), '.stackdiff');
const PROFILES_FILE = path.join(CONFIG_DIR, 'profiles.json');

export function loadProfiles(): ProfileStore {
  if (!fs.existsSync(PROFILES_FILE)) {
    return { profiles: {} };
  }
  const raw = fs.readFileSync(PROFILES_FILE, 'utf-8');
  return JSON.parse(raw) as ProfileStore;
}

export function saveProfiles(store: ProfileStore): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(PROFILES_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

export function addProfile(name: string, stagingFile: string, productionFile: string): Profile {
  const store = loadProfiles();
  const profile: Profile = {
    name,
    stagingFile: path.resolve(stagingFile),
    productionFile: path.resolve(productionFile),
    createdAt: new Date().toISOString(),
  };
  store.profiles[name] = profile;
  saveProfiles(store);
  return profile;
}

export function getProfile(name: string): Profile | undefined {
  const store = loadProfiles();
  return store.profiles[name];
}

export function removeProfile(name: string): boolean {
  const store = loadProfiles();
  if (!store.profiles[name]) return false;
  delete store.profiles[name];
  saveProfiles(store);
  return true;
}

export function listProfiles(): Profile[] {
  const store = loadProfiles();
  return Object.values(store.profiles);
}
