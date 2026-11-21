import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { checkSupabaseHandshake, supabase, supabaseUrl, supabasePublishableKey, type HandshakeResult } from '../lib/supabase';
import { API_CHECKS, runChecks, type ApiCheck, type CheckResult, type Crud, type Status } from '../services/supabase/apiChecks';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

// Every Supabase call the app makes, run live against the database.
// Signed out: public reads and RLS refusals. Signed in: also your own rows —
// reads and writes that undo themselves. Checks that leave rows only the secret
// key can remove run from `npm run test:api` on the test account instead.

const CRUD: { key: Crud; label: string }[] = [
  { key: 'C', label: 'Create' }, { key: 'R', label: 'Read' }, { key: 'U', label: 'Update' }, { key: 'D', label: 'Delete' },
];
const STATUS_TEXT: Record<Status | 'pending' | 'running', string> = {
  pass: 'ผ่าน', fail: 'ไม่ผ่าน', skip: 'ข้าม', pending: 'รอ', running: 'กำลังทดสอบ',
};

function worst(statuses: (Status | undefined)[]): Status | 'pending' | null {
  if (!statuses.length) return null;
  if (statuses.includes('fail')) return 'fail';
  if (statuses.includes('pass')) return 'pass';
  if (statuses.includes(undefined)) return 'pending';
  return 'skip';
}

const median = (values: number[]) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

export default function ApiHealth() {
  useDocumentTitle('API Health | Lowrox');
  const [results, setResults] = useState<Record<string, CheckResult>>({});
  const [running, setRunning] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [handshake, setHandshake] = useState<HandshakeResult | null>(null);
  const [who, setWho] = useState<string | null>(null);
  const [ranAt, setRanAt] = useState<Date | null>(null);
  // A client with no session, so public checks really run as anon even when signed in.
  const anon = useRef(createClient(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, storageKey: 'lowrox-api-health-anon' },
  }));

  const run = useCallback(async () => {
    setBusy(true);
    setResults({});
    setRunning(API_CHECKS[0].id);
    const [{ data: session }, hs] = await Promise.all([supabase.auth.getSession(), checkSupabaseHandshake()]);
    setHandshake(hs);
    const signedIn = !!session.session;
    setWho(session.session?.user.email ?? null);
    await runChecks(API_CHECKS, { anon: anon.current, db: signedIn ? supabase : null, admin: null, state: {} },
      ['anon', 'member'], (check, result) => {
        setResults(prev => ({ ...prev, [check.id]: result }));
        const next = API_CHECKS[API_CHECKS.indexOf(check) + 1];
        setRunning(next?.id ?? null);
      });
    setRunning(null);
    setRanAt(new Date());
    setBusy(false);
  }, []);

  useEffect(() => { void run(); }, [run]);

  const summary = useMemo(() => {
    const done = Object.values(results);
    return {
      pass: done.filter(r => r.status === 'pass').length,
      fail: done.filter(r => r.status === 'fail').length,
      skip: done.filter(r => r.status === 'skip').length,
      median: median(done.filter(r => r.status !== 'skip').map(r => r.ms)),
    };
  }, [results]);

  // target → C/R/U/D → checks
  const matrix = useMemo(() => {
    const rows = new Map<string, Record<Crud, ApiCheck[]>>();
    for (const check of API_CHECKS) {
      if (!rows.has(check.target)) rows.set(check.target, { C: [], R: [], U: [], D: [] });
      rows.get(check.target)![check.crud].push(check);
    }
    return [...rows];
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, ApiCheck[]>();
    for (const check of API_CHECKS) map.set(check.group, [...(map.get(check.group) ?? []), check]);
    return [...map];
  }, []);

  const statusOf = (check: ApiCheck) => results[check.id]?.status ?? (running === check.id ? 'running' : 'pending');
  const dbOk = handshake ? handshake.database && summary.fail === 0 : null;

  return (
    <div className="ah">
      <style>{CSS}</style>
      <div className="ah-wrap">
        <header className="ah-head">
          <div>
            <h1>Lowrox API Health</h1>
            <p className="ah-muted">ทดสอบทุกเส้นที่แอปเรียก Supabase แบบสดๆ · <code>{supabaseUrl}</code></p>
            <p className="ah-muted">
              {who ? <>ทดสอบในชื่อ <strong>{who}</strong> (เขียน/ลบเฉพาะข้อมูลของตัวเอง และลบคืนทันที)</>
                : <>ยังไม่ได้เข้าสู่ระบบ: ทดสอบเฉพาะเส้นสาธารณะ · เข้าสู่ระบบเพื่อทดสอบ CRUD ของสมาชิก</>}
            </p>
          </div>
          <button className="ah-btn" onClick={() => void run()} disabled={busy}>{busy ? 'กำลังทดสอบ…' : 'ทดสอบอีกครั้ง'}</button>
        </header>

        <section className="ah-tiles" aria-label="สรุป">
          <Tile label="Database" value={dbOk == null ? '…' : dbOk ? 'Healthy' : 'มีปัญหา'} tone={dbOk == null ? 'pending' : dbOk ? 'pass' : 'fail'}
            sub={handshake ? `handshake ${handshake.latencyMs} ms` : undefined} />
          <Tile label="Auth (GoTrue)" value={handshake ? (handshake.authHealth ? 'Up' : 'Down') : '…'}
            tone={handshake ? (handshake.authHealth ? 'pass' : 'fail') : 'pending'} sub={handshake ? `JWKS ${handshake.jwks ? 'ok' : 'fail'}` : undefined} />
          <Tile label="เส้นที่ผ่าน" value={`${summary.pass} / ${summary.pass + summary.fail}`}
            tone={summary.fail ? 'fail' : summary.pass ? 'pass' : 'pending'} sub={`${summary.skip} ข้าม · ${API_CHECKS.length} ทั้งหมด`} />
          <Tile label="Latency (median)" value={summary.median == null ? '…' : `${summary.median} ms`} tone="neutral"
            sub={ranAt ? `ล่าสุด ${ranAt.toLocaleTimeString()}` : undefined} />
        </section>

        <section>
          <h2>CRUD ต่อตาราง</h2>
          <div className="ah-scroll">
            <table className="ah-matrix">
              <thead><tr><th>ตาราง / ฟังก์ชัน / bucket</th>{CRUD.map(c => <th key={c.key} title={c.label}>{c.key}</th>)}</tr></thead>
              <tbody>
                {matrix.map(([target, cells]) => (
                  <tr key={target}>
                    <td><code>{target}</code></td>
                    {CRUD.map(({ key, label }) => {
                      const checks = cells[key];
                      const state = worst(checks.map(c => results[c.id]?.status));
                      return (
                        <td key={key} title={checks.length ? `${label}: ${checks.map(c => `${c.label} — ${STATUS_TEXT[statusOf(c)]}`).join('\n')}` : `${label}: แอปไม่ได้ใช้`}>
                          {state ? <span className={`ah-dot ah-${state}`} aria-label={`${label} ${STATUS_TEXT[state]}`} /> : <span className="ah-none">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="ah-legend">
            <span><i className="ah-dot ah-pass" /> ผ่าน</span><span><i className="ah-dot ah-fail" /> ไม่ผ่าน</span>
            <span><i className="ah-dot ah-skip" /> ข้าม</span><span><span className="ah-none">—</span> แอปไม่ได้ใช้</span>
          </p>
        </section>

        <section>
          <h2>ทุกเส้น ({API_CHECKS.length})</h2>
          {groups.map(([group, checks]) => (
            <div key={group} className="ah-group">
              <h3>{group}</h3>
              <ul>
                {checks.map(check => {
                  const r = results[check.id];
                  const status = statusOf(check);
                  return (
                    <li key={check.id} className="ah-route">
                      <span className={`ah-method ah-m-${check.method.toLowerCase()}`}>{check.method}</span>
                      <code className="ah-target">{check.target}</code>
                      <span className="ah-label">{check.label}{check.expect === 'denied' && <em> · ควรถูกปฏิเสธ</em>}</span>
                      <span className={`ah-pill ah-${status}`}>{STATUS_TEXT[status]}</span>
                      <span className="ah-ms">{r && r.status !== 'skip' ? `${r.ms} ms` : ''}</span>
                      {(r?.error || r?.reason) && <span className={r.error ? 'ah-error' : 'ah-reason'}>{r.error ?? r.reason}</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>

        <p className="ah-muted ah-foot">
          เส้นที่สร้างข้อมูลถาวร (create_party, log_workout, comment, save_onboarding) ทดสอบด้วย <code>npm run test:api</code> บนบัญชีทดสอบ
          ซึ่งใช้ secret key ลบข้อมูลทดสอบทิ้งตอนจบ
        </p>
      </div>
    </div>
  );
}

function Tile({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone: string }) {
  return (
    <div className="ah-tile">
      <span className="ah-tile-label">{label}</span>
      <strong className={`ah-tile-value ah-t-${tone}`}>{value}</strong>
      {sub && <span className="ah-muted">{sub}</span>}
    </div>
  );
}

const CSS = `
.ah{--bg:#0d1117;--panel:#161b22;--line:#30363d;--text:#e6edf3;--muted:#8b949e;--pass:#3fb950;--fail:#f85149;--skip:#6e7681;--pend:#d29922;--accent:#58a6ff;
  min-height:100vh;background:var(--bg);color:var(--text);font:14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;padding:24px 16px}
.ah code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px}
.ah-wrap{max-width:960px;margin:0 auto}
.ah h1{font-size:22px;margin:0 0 4px}
.ah h2{font-size:15px;margin:28px 0 10px}
.ah h3{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:16px 0 6px}
.ah-muted{color:var(--muted);margin:0;font-size:13px;overflow-wrap:anywhere}
.ah-head{display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:flex-start}
.ah-btn{background:#238636;color:#fff;border:1px solid #2ea043;border-radius:6px;padding:7px 14px;font-weight:600;cursor:pointer}
.ah-btn:disabled{opacity:.6;cursor:progress}
.ah-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-top:20px}
.ah-tile{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:12px 14px;display:flex;flex-direction:column;gap:2px}
.ah-tile-label{font-size:12px;color:var(--muted)}
.ah-tile-value{font-size:20px}
.ah-t-pass{color:var(--pass)}.ah-t-fail{color:var(--fail)}.ah-t-pending{color:var(--pend)}
.ah-scroll{overflow-x:auto;border:1px solid var(--line);border-radius:8px}
.ah-matrix{width:100%;border-collapse:collapse;background:var(--panel)}
.ah-matrix th,.ah-matrix td{padding:7px 12px;border-bottom:1px solid var(--line);text-align:center}
.ah-matrix th:first-child,.ah-matrix td:first-child{text-align:left}
.ah-matrix tr:last-child td{border-bottom:0}
.ah-matrix th{font-size:12px;color:var(--muted);font-weight:600}
.ah-dot{display:inline-block;width:11px;height:11px;border-radius:50%;vertical-align:middle}
.ah-pass{--c:var(--pass)}.ah-fail{--c:var(--fail)}.ah-skip{--c:var(--skip)}.ah-pending,.ah-running{--c:var(--pend)}
.ah-dot{background:var(--c)}
.ah-none{color:var(--line)}
.ah-legend{display:flex;flex-wrap:wrap;gap:14px;font-size:12px;color:var(--muted);margin:8px 0 0}
.ah-legend span{display:inline-flex;gap:6px;align-items:center}
.ah-group ul{list-style:none;margin:0;padding:0;border:1px solid var(--line);border-radius:8px;background:var(--panel)}
.ah-route{display:grid;grid-template-columns:72px minmax(0,190px) 1fr auto 60px;gap:4px 10px;align-items:center;padding:8px 12px;border-bottom:1px solid var(--line)}
.ah-route:last-child{border-bottom:0}
.ah-method{font:600 11px ui-monospace,Menlo,monospace;text-align:center;border-radius:4px;padding:2px 0;background:#21262d;color:var(--accent)}
.ah-m-post,.ah-m-upsert,.ah-m-upload{color:var(--pass)}.ah-m-patch{color:var(--pend)}.ah-m-delete,.ah-m-remove{color:var(--fail)}.ah-m-rpc{color:#d2a8ff}
.ah-target{overflow-wrap:anywhere}
.ah-label em{color:var(--muted)}
.ah-pill{font-size:12px;border-radius:999px;padding:1px 9px;border:1px solid var(--c);color:var(--c);white-space:nowrap}
.ah-ms{font-size:12px;color:var(--muted);text-align:right}
.ah-error,.ah-reason{grid-column:2/-1;font-size:12px;overflow-wrap:anywhere}
.ah-error{color:var(--fail);font-family:ui-monospace,Menlo,monospace}
.ah-reason{color:var(--muted)}
.ah-foot{margin-top:24px}
@media (max-width:640px){
  .ah-route{grid-template-columns:64px 1fr auto}
  .ah-label{grid-column:1/-1;order:5}
  .ah-ms{display:none}
  .ah-error,.ah-reason{grid-column:1/-1;order:6}
}
`;
