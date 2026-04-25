import { tagEnvMap, filterByTags, listTags, groupByTag, parseTagDefs } from './tag';

const sampleEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  REDIS_URL: 'redis://localhost',
  JWT_SECRET: 'secret',
  AUTH_TOKEN: 'token',
  APP_NAME: 'myapp',
};

const tagDefs = {
  infra: ['DB_', 'REDIS_'],
  auth: ['JWT_', 'AUTH_'],
};

describe('tagEnvMap', () => {
  it('assigns correct tags to keys', () => {
    const entries = tagEnvMap(sampleEnv, tagDefs);
    const db = entries.find(e => e.key === 'DB_HOST')!;
    expect(db.tags).toContain('infra');
    const jwt = entries.find(e => e.key === 'JWT_SECRET')!;
    expect(jwt.tags).toContain('auth');
  });

  it('leaves unmatched keys with empty tags', () => {
    const entries = tagEnvMap(sampleEnv, tagDefs);
    const app = entries.find(e => e.key === 'APP_NAME')!;
    expect(app.tags).toHaveLength(0);
  });
});

describe('filterByTags', () => {
  it('returns only entries matching all given tags', () => {
    const entries = tagEnvMap(sampleEnv, tagDefs);
    const infra = filterByTags(entries, ['infra']);
    expect(infra.map(e => e.key)).toEqual(expect.arrayContaining(['DB_HOST', 'DB_PORT', 'REDIS_URL']));
    expect(infra.map(e => e.key)).not.toContain('JWT_SECRET');
  });
});

describe('listTags', () => {
  it('returns sorted unique tag names', () => {
    const entries = tagEnvMap(sampleEnv, tagDefs);
    const tags = listTags(entries);
    expect(tags).toEqual(['auth', 'infra']);
  });
});

describe('groupByTag', () => {
  it('groups entries under their tags', () => {
    const entries = tagEnvMap(sampleEnv, tagDefs);
    const grouped = groupByTag(entries);
    expect(grouped['infra'].map(e => e.key)).toContain('REDIS_URL');
    expect(grouped['auth'].map(e => e.key)).toContain('AUTH_TOKEN');
    expect(grouped['__untagged__'].map(e => e.key)).toContain('APP_NAME');
  });
});

describe('parseTagDefs', () => {
  it('parses tag definition string', () => {
    const defs = parseTagDefs('infra=DB_,REDIS_ auth=JWT_,AUTH_');
    expect(defs).toEqual({ infra: ['DB_', 'REDIS_'], auth: ['JWT_', 'AUTH_'] });
  });

  it('handles empty string', () => {
    expect(parseTagDefs('')).toEqual({});
  });
});
