import type { OnboardingData, User } from '../../types/models';
import { supabase } from '../../lib/supabase';
import { effortFromOnboarding, fiveKEquivalent, summarizeLevel } from '../../utils/leveling';
import { userChangesToRow, userFromRow, type UserRow } from './mappers';

const fail = (error: { message: string } | null) => { if (error) throw new Error(error.message); };

// The ms_users row of the signed-in member, created on first sign-in if needed.
export async function loadMyProfile(): Promise<User | null> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null;
  const { data, error } = await supabase.rpc('ensure_my_profile');
  fail(error);
  const row = (Array.isArray(data) ? data[0] : data) as UserRow | undefined;
  if (!row) throw new Error('Profile not found');
  return userFromRow(row);
}

export async function updateMyProfile(userId: User['id'], changes: Partial<User>): Promise<User> {
  const row = userChangesToRow(changes);
  if (typeof row.avatar_url === 'string' && row.avatar_url.startsWith('data:')) {
    row.avatar_url = await uploadDataUrl('avatars', row.avatar_url);
  }
  const { data, error } = await supabase.from('ms_users')
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq('id', Number(userId))
    .select()
    .single();
  fail(error);
  return userFromRow(data as UserRow);
}

// The member's level from the run they reported, stored alongside the form.
export function levelFromOnboarding(data: OnboardingData) {
  const effort = effortFromOnboarding(data.fitnessLevel);
  return effort ? summarizeLevel(fiveKEquivalent(effort)).level.id : null;
}

export async function saveOnboarding(data: OnboardingData, complete: boolean) {
  const { error } = await supabase.rpc('save_onboarding', {
    p_data: data,
    p_complete: complete,
    p_fitness_level: levelFromOnboarding(data),
  });
  fail(error);
}

export async function sendLoginLink(email: string, next: string) {
  const redirect = new URL('/auth/callback', window.location.origin);
  redirect.searchParams.set('next', next);
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirect.toString(), shouldCreateUser: true },
  });
  fail(error);
}

export async function verifyLoginCode(email: string, token: string) {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  fail(error);
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  fail(error);
}

// Uploads a data: URL into the member's own folder and returns its public URL.
export async function uploadDataUrl(bucket: 'avatars' | 'comment-images', dataUrl: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not authenticated');
  const blob = await (await fetch(dataUrl)).blob();
  const extension = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${auth.user.id}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: blob.type, upsert: false });
  fail(error);
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
