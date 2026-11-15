import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import ApiStatus from '../src/pages/ApiStatus';

describe('ApiStatus Page', () => {
  it('renders API handshake title and status', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      const urlStr = String(url);
      if (urlStr.includes('/auth/v1/health')) {
        return {
          status: 200,
          ok: true,
          json: async () => ({ version: 'v2.197.0' })
        } as Response;
      }
      if (urlStr.includes('/auth/v1/.well-known/jwks.json')) {
        return {
          status: 200,
          ok: true,
          json: async () => ({ keys: [{ alg: 'ES256' }] })
        } as Response;
      }
      return { status: 200, ok: true, json: async () => ({}) } as Response;
    });

    render(<ApiStatus />);

    expect(screen.getByText(/Lowrox API Handshake Response/i)).toBeInTheDocument();
    expect(screen.getByText(/200 OK/i)).toBeInTheDocument();
    expect(screen.getByText(/400 Bad Request/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/HTTP 200/i)).toBeInTheDocument();
    });
  });
});
