import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { addProfile, getProfile, removeProfile, listProfiles, loadProfiles } from './profile';

const CONFIG_DIR = path.join(os.homedir(), '.stackdiff');
const PROFILES_FILE = path.join(CONFIG_DIR, 'profiles.json');

function cleanProfiles() {
  if (fs.existsSync(PROFILES_FILE)) {
    fs.unlinkSync(PROFILES_FILE);
  }
}

describe('profile', () => {
  beforeEach(() => cleanProfiles());
  afterEach(() => cleanProfiles());

  test('loadProfiles returns empty store when no file exists', () => {
    const store = loadProfiles();
    expect(store.profiles).toEqual({});
  });

  test('addProfile stores a profile', () => {
    const p = addProfile('myapp', '.env.staging', '.env.production');
    expect(p.name).toBe('myapp');
    expect(p.stagingFile).toContain('.env.staging');
    expect(p.productionFile).toContain('.env.production');
    expect(p.createdAt).toBeTruthy();
  });

  test('getProfile retrieves stored profile', () => {
    addProfile('myapp', '.env.staging', '.env.production');
    const p = getProfile('myapp');
    expect(p).toBeDefined();
    expect(p!.name).toBe('myapp');
  });

  test('getProfile returns undefined for unknown profile', () => {
    expect(getProfile('ghost')).toBeUndefined();
  });

  test('listProfiles returns all profiles', () => {
    addProfile('app1', 'a.staging', 'a.prod');
    addProfile('app2', 'b.staging', 'b.prod');
    const list = listProfiles();
    expect(list).toHaveLength(2);
    expect(list.map(p => p.name)).toContain('app1');
    expect(list.map(p => p.name)).toContain('app2');
  });

  test('removeProfile deletes a profile and returns true', () => {
    addProfile('myapp', '.env.staging', '.env.production');
    const result = removeProfile('myapp');
    expect(result).toBe(true);
    expect(getProfile('myapp')).toBeUndefined();
  });

  test('removeProfile returns false for unknown profile', () => {
    expect(removeProfile('ghost')).toBe(false);
  });
});
