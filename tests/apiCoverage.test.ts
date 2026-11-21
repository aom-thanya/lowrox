// Every Supabase call in src/ must have a check in apiChecks.ts, so `npm run test:api`
// and the /status page can't quietly fall behind the app. Add a call, add its check.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { API_CHECKS, type Method } from '../src/services/supabase/apiChecks';

const SRC = path.resolve(__dirname, '../src');
const SELF = path.join(SRC, 'services/supabase/apiChecks.ts');
const VERB: Record<string, Method> = { select: 'GET', insert: 'POST', update: 'PATCH', upsert: 'UPSERT', delete: 'DELETE' };

function sources(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sources(full);
    return /\.tsx?$/.test(entry.name) && full !== SELF ? [full] : [];
  });
}

// "<METHOD> <target>" for every call the app makes, with where it was found.
function appCalls() {
  const calls = new Map<string, string>();
  const add = (key: string, file: string, text: string, index: number) => {
    if (!calls.has(key)) calls.set(key, `${path.relative(SRC, file)}:${text.slice(0, index).split('\n').length}`);
  };
  for (const file of sources(SRC)) {
    const text = fs.readFileSync(file, 'utf8');
    for (const m of text.matchAll(/\.from\(\s*['"]([\w]+)['"]\s*\)\s*\.(select|insert|update|upsert|delete)\b/g))
      add(`${VERB[m[2]]} ${m[1]}`, file, text, m.index);
    for (const m of text.matchAll(/\.rpc\(\s*['"](\w+)['"]/g)) add(`RPC ${m[1]}`, file, text, m.index);
    for (const m of text.matchAll(/uploadDataUrl\(\s*['"]([\w-]+)['"]/g)) add(`UPLOAD ${m[1]}`, file, text, m.index);
  }
  return calls;
}

describe('API check coverage', () => {
  const calls = appCalls();
  const checked = new Set(API_CHECKS.filter(c => !c.expect).map(c => `${c.method} ${c.target}`));

  it('finds the app\'s Supabase calls', () => {
    expect(calls.size).toBeGreaterThan(15);
  });

  it('has a check for every call the app makes', () => {
    const missing = [...calls].filter(([key]) => !checked.has(key)).map(([key, where]) => `${key}  (${where})`);
    expect(missing).toEqual([]);
  });

  it('gives every check a unique id', () => {
    const ids = API_CHECKS.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
