import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import ApiHealth from '../src/pages/ApiHealth';
import { checkSupabaseHandshake } from '../src/lib/supabase';
import { API_CHECKS } from '../src/services/supabase/apiChecks';

// A query builder that resolves to `result` however it is chained.
function builder(result: object) {
  const b: any = new Proxy({}, {
    get: (_t, prop) => prop === 'then'
      ? (ok: (v: object) => unknown) => Promise.resolve(result).then(ok)
      : () => b,
  });
  return b;
}

vi.mock('@supabase/supabase-js', async importOriginal => {
  const real = await importOriginal<typeof import('@supabase/supabase-js')>();
  return {
    ...real,
    // The page's private anon client: reads succeed, writes are refused, ms_users is hidden.
    createClient: () => ({
      from: (table: string) => ({
        select: () => builder(table === 'ms_users' ? { data: [], error: null } : { data: [{ id: 1 }], error: null }),
        insert: () => builder({ error: { message: 'new row violates row-level security policy', code: '42501' } }),
      }),
      rpc: () => builder({ error: { message: 'not authenticated', code: '28000' } }),
    }),
  };
});

vi.mock('../src/lib/supabase', () => ({
  supabaseUrl: 'https://example.supabase.co',
  supabasePublishableKey: 'sb_publishable_test',
  supabase: { auth: { getSession: async () => ({ data: { session: null }, error: null }) } },
  checkSupabaseHandshake: vi.fn(),
}));

describe('ApiHealth page', () => {
  beforeEach(() => {
    vi.mocked(checkSupabaseHandshake).mockResolvedValue({ ok: true, latencyMs: 42, authHealth: true, jwks: true, database: true });
  });

  it('lists every route and runs the public ones when signed out', async () => {
    render(<ApiHealth />);
    expect(screen.getByRole('heading', { name: 'Lowrox API Health' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(API_CHECKS.length);

    const publicCount = API_CHECKS.filter(c => c.needs === 'anon').length;
    await waitFor(() => expect(screen.getByText(`${publicCount} / ${publicCount}`)).toBeInTheDocument());
    expect(screen.getByText('Healthy')).toBeInTheDocument();

    const refusal = screen.getByText('Anon cannot write a workout').closest('li')!;
    expect(within(refusal).getByText('ผ่าน')).toBeInTheDocument();
    const memberOnly = screen.getByText('My workouts').closest('li')!;
    expect(within(memberOnly).getByText('sign in to run')).toBeInTheDocument();
  });

  it('reports the database as unhealthy when a route fails', async () => {
    vi.mocked(checkSupabaseHandshake).mockResolvedValue({ ok: false, latencyMs: 9, authHealth: true, jwks: true, database: false, error: 'boom' });
    render(<ApiHealth />);
    await waitFor(() => expect(screen.getByText('มีปัญหา')).toBeInTheDocument());
  });
});
