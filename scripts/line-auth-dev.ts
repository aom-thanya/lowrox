// Dev-only stand-in for the line-auth Edge Function, so LINE Login can be tried with
// `npm run dev` before the function is deployed. Same steps as
// supabase/functions/line-auth/index.ts, reading LINE_CHANNEL_SECRET and
// SUPABASE_SECRET_KEY from .env. Never part of the production build.
import type { Plugin } from 'vite';
import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

export const LINE_AUTH_DEV_PATH = '/__dev/line-auth';

export function lineAuthDev(): Plugin {
  return {
    name: 'line-auth-dev',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');
      const channelId = env.VITE_LINE_CHANNEL_ID || '2012661380';
      const channelSecret = env.LINE_CHANNEL_SECRET;
      const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
      const secretKey = env.SUPABASE_SECRET_KEY;

      server.middlewares.use(LINE_AUTH_DEV_PATH, async (req, res) => {
        const reply = (status: number, body: unknown) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        };
        try {
          if (req.method !== 'POST') return reply(405, { error: 'Method not allowed' });
          if (!channelSecret || !secretKey || !supabaseUrl) {
            return reply(500, { error: 'Set LINE_CHANNEL_SECRET, SUPABASE_SECRET_KEY and VITE_SUPABASE_URL in .env' });
          }
          let raw = '';
          for await (const chunk of req) raw += chunk;
          const { code, redirectUri, nonce } = JSON.parse(raw || '{}');

          const postForm = async (url: string, fields: Record<string, string>) => {
            const r = await fetch(url, { method: 'POST', body: new URLSearchParams(fields) });
            const body = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(`LINE ${new URL(url).pathname}: ${body.error_description ?? body.error ?? r.status}`);
            return body;
          };
          const token = await postForm('https://api.line.me/oauth2/v2.1/token', {
            grant_type: 'authorization_code', code, redirect_uri: redirectUri, client_id: channelId, client_secret: channelSecret,
          });
          const line = await postForm('https://api.line.me/oauth2/v2.1/verify', { id_token: token.id_token, client_id: channelId, nonce });
          console.log(`[line-auth-dev] LINE verified: ${line.name} (${line.sub}) email=${line.email ?? '—'}`);

          const admin = createClient(supabaseUrl, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });
          // ms_users.line_user_id exists only after 06_line_login.sql; without it, match by email.
          let email: string | undefined;
          const { data: linked } = await admin.from('ms_users').select('auth_user_id')
            .eq('line_user_id', line.sub).not('auth_user_id', 'is', null).maybeSingle();
          if (linked) email = (await admin.auth.admin.getUserById(linked.auth_user_id)).data.user?.email;
          let isNew = false;
          if (!email) {
            email = String(line.email ?? `${String(line.sub).toLowerCase()}@line.lowrox.app`).toLowerCase();
            const { error } = await admin.auth.admin.createUser({
              email, email_confirm: true,
              user_metadata: { display_name: line.name, avatar_url: line.picture, line_user_id: line.sub },
              app_metadata: { provider: 'line', providers: ['line'] },
            });
            if (error && !/already.*(registered|exists)/i.test(error.message)) throw error;
            isNew = !error;
          }
          const { data: link, error: linkError } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
          if (linkError) throw linkError;
          await admin.from('ms_users').update({ line_user_id: line.sub }).eq('auth_user_id', link.user.id).is('line_user_id', null);

          reply(200, { tokenHash: link.properties.hashed_token, isNew });
        } catch (err) {
          console.error('[line-auth-dev]', err);
          reply(500, { error: err instanceof Error ? err.message : String(err) });
        }
      });
    },
  };
}
