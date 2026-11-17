// LINE Login → Supabase session.
//
// The browser sends the `code` LINE returned to /auth/line/callback. This function
// exchanges it for an ID token with the Channel secret, has LINE verify that token,
// finds or creates the member's Supabase account, and returns a one-time token_hash
// the browser turns into a session with supabase.auth.verifyOtp().
//
// Secrets (Dashboard → Edge Functions → Secrets, or `supabase secrets set`):
//   LINE_CHANNEL_SECRET  required
//   LINE_CHANNEL_ID      optional, defaults to the Lowrox channel
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.
//
// Deploy with JWT verification off: the browser calls it before it has a session,
// and the publishable key is not a JWT.
//   npx supabase functions deploy line-auth --no-verify-jwt --project-ref avvxdvvcqexmfpsgtzqm
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';

const CHANNEL_ID = Deno.env.get('LINE_CHANNEL_ID') ?? '2012661380';
const CHANNEL_SECRET = Deno.env.get('LINE_CHANNEL_SECRET');
// Members who don't share an email get a stable address derived from their LINE user ID.
// No mail is ever sent to it.
const PLACEHOLDER_DOMAIN = Deno.env.get('LINE_PLACEHOLDER_EMAIL_DOMAIN') ?? 'line.lowrox.app';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function postForm(url: string, fields: Record<string, string>) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new HttpError(401, `LINE ${new URL(url).pathname}: ${body.error_description ?? body.error ?? res.status}`);
  return body;
}

interface LineIdentity { sub: string; name?: string; picture?: string; email?: string }

async function lineIdentity(code: string, redirectUri: string, nonce: string): Promise<LineIdentity> {
  const token = await postForm('https://api.line.me/oauth2/v2.1/token', {
    grant_type: 'authorization_code', code, redirect_uri: redirectUri, client_id: CHANNEL_ID, client_secret: CHANNEL_SECRET!,
  });
  if (!token.id_token) throw new HttpError(401, 'LINE returned no ID token (is the openid scope requested?)');
  // LINE checks the signature, audience, expiry and nonce for us.
  return await postForm('https://api.line.me/oauth2/v2.1/verify', { id_token: token.id_token, client_id: CHANNEL_ID, nonce });
}

// The email of the Supabase account for this LINE user, creating the account on first sign-in.
async function accountEmail(line: LineIdentity) {
  const { data: linked, error } = await admin.from('ms_users')
    .select('auth_user_id').eq('line_user_id', line.sub).not('auth_user_id', 'is', null).maybeSingle();
  if (error) throw error;
  if (linked) {
    const { data, error: userError } = await admin.auth.admin.getUserById(linked.auth_user_id);
    if (userError) throw userError;
    if (data.user.email) return { email: data.user.email, isNew: false };
  }

  const email = (line.email ?? `${line.sub.toLowerCase()}@${PLACEHOLDER_DOMAIN}`).toLowerCase();
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { display_name: line.name, avatar_url: line.picture, line_user_id: line.sub },
    app_metadata: { provider: 'line', providers: ['line'] },
  });
  // An account with this email already exists (e.g. signed up by email before): sign into it.
  if (createError && !/already.*(registered|exists)/i.test(createError.message)) throw createError;
  return { email, isNew: !createError };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    if (!CHANNEL_SECRET) throw new HttpError(500, 'LINE_CHANNEL_SECRET is not set');
    const { code, redirectUri, nonce } = await req.json().catch(() => ({}));
    if (typeof code !== 'string' || typeof redirectUri !== 'string' || typeof nonce !== 'string') {
      throw new HttpError(400, 'code, redirectUri and nonce are required');
    }

    const line = await lineIdentity(code, redirectUri, nonce);
    const { email, isNew } = await accountEmail(line);

    const { data: link, error: linkError } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
    if (linkError) throw linkError;

    // Remember which LINE account owns this profile so a changed LINE email still finds it.
    const { error: linkLineError } = await admin.from('ms_users')
      .update({ line_user_id: line.sub, updated_at: new Date().toISOString() })
      .eq('auth_user_id', link.user.id).is('line_user_id', null);
    if (linkLineError) console.error('Could not store line_user_id', linkLineError.message);

    return json({ tokenHash: link.properties.hashed_token, isNew });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    console.error('line-auth failed', err);
    return json({ error: err instanceof Error ? err.message : String(err) }, status);
  }
});
