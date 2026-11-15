import { describe, it, expect, vi } from 'vitest';
import { supabase, checkSupabaseHandshake } from '../src/lib/supabase';

describe('Supabase Client & Handshake', () => {
  it('initializes the supabase client', () => {
    expect(supabase).toBeDefined();
    expect(supabase.from).toBeTypeOf('function');
    expect(supabase.auth).toBeDefined();
  });

  it('runs handshake function successfully with mocked responses', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      const urlStr = String(url);
      if (urlStr.includes('/auth/v1/health')) {
        return {
          ok: true,
          json: async () => ({ version: 'v2.197.0' })
        } as Response;
      }
      if (urlStr.includes('/auth/v1/.well-known/jwks.json')) {
        return {
          ok: true,
          json: async () => ({ keys: [{ kid: 'mock-kid' }] })
        } as Response;
      }
      return { ok: true, json: async () => ({}) } as Response;
    });

    const mockSelect = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 });
    const fromSpy = vi.spyOn(supabase, 'from').mockReturnValue({
      select: mockSelect
    } as any);

    const result = await checkSupabaseHandshake();

    expect(result.ok).toBe(true);
    expect(result.authHealth).toBe(true);
    expect(result.jwks).toBe(true);
    expect(result.database).toBe(true);

    fetchSpy.mockRestore();
    fromSpy.mockRestore();
  });
});
