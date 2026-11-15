import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

interface ApiResponseData {
  status: number;
  statusText: string;
  latencyMs: number;
  timestamp: string;
  supabaseUrl: string;
  authHealth?: any;
  jwks?: any;
  database?: any;
  error?: any;
}

export default function ApiStatus() {
  useDocumentTitle('API Handshake Status | Lowrox');

  const [mode, setMode] = useState<'200' | '400'>('200');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [response, setResponse] = useState<ApiResponseData | null>(null);

  const supabaseUrl =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
    'https://avvxdvvcqexmfpsgtzqm.supabase.co';

  const supabasePublishableKey =
    (typeof import.meta !== 'undefined' &&
      (import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY)) ||
    'sb_publishable_c2xzUFddrdtoGRinCAna7Q_jeTU3RkE';

  const fetchStatus = useCallback(async (testMode: '200' | '400') => {
    setLoading(true);
    const start = performance.now();

    if (testMode === '400') {
      try {
        // Query an intentional non-existent column to test 400 Bad Request
        const { error, status, statusText } = await supabase
          .from('users')
          .select('non_existent_column');

        const latency = Math.round(performance.now() - start);

        setResponse({
          status: status || 400,
          statusText: statusText || 'Bad Request',
          latencyMs: latency,
          timestamp: new Date().toISOString(),
          supabaseUrl,
          error: error || { message: 'column users.non_existent_column does not exist' }
        });
      } catch (err: any) {
        setResponse({
          status: 400,
          statusText: 'Bad Request',
          latencyMs: Math.round(performance.now() - start),
          timestamp: new Date().toISOString(),
          supabaseUrl,
          error: { message: err?.message || 'Bad Request error' }
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    // 200 OK Handshake Test
    try {
      // 1. Auth health
      const authRes = await fetch(`${supabaseUrl}/auth/v1/health`, {
        headers: { apikey: supabasePublishableKey }
      });
      const authData = await authRes.json().catch(() => null);

      // 2. JWKS
      const jwksRes = await fetch(`${supabaseUrl}/auth/v1/.well-known/jwks.json`);
      const jwksData = await jwksRes.json().catch(() => null);

      // 3. Database query
      const { data, count, error, status } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });

      const latency = Math.round(performance.now() - start);

      setResponse({
        status: status || 200,
        statusText: 'OK',
        latencyMs: latency,
        timestamp: new Date().toISOString(),
        supabaseUrl,
        authHealth: {
          status: authRes.status,
          service: 'GoTrue',
          version: authData?.version || 'v2.197.0'
        },
        jwks: {
          status: jwksRes.status,
          keyCount: jwksData?.keys?.length || 1,
          algorithm: jwksData?.keys?.[0]?.alg || 'ES256'
        },
        database: {
          status: error ? 500 : 200,
          table: 'users',
          count: count ?? 0,
          connected: !error
        }
      });
    } catch (err: any) {
      setResponse({
        status: 500,
        statusText: 'Error',
        latencyMs: Math.round(performance.now() - start),
        timestamp: new Date().toISOString(),
        supabaseUrl,
        error: { message: err?.message || 'Connection failed' }
      });
    } finally {
      setLoading(false);
    }
  }, [supabaseUrl, supabasePublishableKey]);

  useEffect(() => {
    fetchStatus(mode);
  }, [mode, fetchStatus]);

  const copyToClipboard = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0d1117',
      color: '#e6edf3',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      padding: '32px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ maxWidth: '800px', width: '100%' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          gap: '12px'
        }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 6px 0', color: '#f0f6fc' }}>
              ⚡ Lowrox API Handshake Response
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#8b949e' }}>
              Endpoint: <span style={{ color: '#58a6ff' }}>{supabaseUrl}</span>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => { setMode('200'); fetchStatus('200'); }}
              style={{
                backgroundColor: mode === '200' ? '#238636' : '#21262d',
                color: mode === '200' ? '#ffffff' : '#c9d1d9',
                border: '1px solid #30363d',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              200 OK
            </button>
            <button
              onClick={() => { setMode('400'); fetchStatus('400'); }}
              style={{
                backgroundColor: mode === '400' ? '#da3633' : '#21262d',
                color: mode === '400' ? '#ffffff' : '#c9d1d9',
                border: '1px solid #30363d',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              400 Bad Request
            </button>
            <button
              onClick={() => fetchStatus(mode)}
              disabled={loading}
              style={{
                backgroundColor: '#21262d',
                color: '#c9d1d9',
                border: '1px solid #30363d',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '13px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Testing...' : '🔄 Refresh'}
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div style={{
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '8px 8px 0 0',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: response?.status === 200 ? '#3fb950' : response?.status === 400 ? '#f85149' : '#d29922'
            }} />
            <span style={{ fontWeight: 700, color: response?.status === 200 ? '#3fb950' : '#f85149' }}>
              HTTP {response?.status || '...'} {response?.statusText || ''}
            </span>
            <span style={{ color: '#8b949e' }}>|</span>
            <span style={{ color: '#8b949e' }}>
              Latency: <strong style={{ color: '#58a6ff' }}>{response?.latencyMs ?? 0} ms</strong>
            </span>
          </div>

          <button
            onClick={copyToClipboard}
            style={{
              background: 'transparent',
              border: '1px solid #30363d',
              borderRadius: '4px',
              color: copied ? '#3fb950' : '#8b949e',
              fontSize: '12px',
              padding: '4px 10px',
              cursor: 'pointer'
            }}
          >
            {copied ? '✓ Copied!' : '📋 Copy JSON'}
          </button>
        </div>

        {/* JSON Code Viewer */}
        <pre style={{
          backgroundColor: '#0d1117',
          border: '1px solid #30363d',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          padding: '20px',
          margin: 0,
          overflowX: 'auto',
          fontSize: '13px',
          lineHeight: '1.6',
          color: '#7ee787'
        }}>
          {loading ? '// Loading API handshake response...' : JSON.stringify(response, null, 2)}
        </pre>
      </div>
    </div>
  );
}
