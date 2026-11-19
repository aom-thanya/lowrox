import type { CommentImage, CommentRecord, EventRecord, User, UserId } from '../../types/models';
import { supabase } from '../../lib/supabase';
import { commentFromRow, eventFromRow, workoutTypeToDb, type CommentRow, type EventRow, type ParticipantRow, type PublicUserRow } from './mappers';
import { uploadDataUrl } from './userApi';

const fail = (error: { message: string } | null) => { if (error) throw new Error(error.message); };
const EVENT_COLUMNS = '*, ms_area(area_label)';
// Plenty for the current community size; filtering and paging then run on one consistent list.
const MAX_EVENTS = 1000;

export async function loadPeople(ids: number[]) {
  const unique = [...new Set(ids)];
  const people = new Map<number, PublicUserRow>();
  if (!unique.length) return people;
  const { data, error } = await supabase.from('v_user_public')
    .select('id, display_name, username, avatar_url, bio, province_id, district_id, interests, profile_visible, fitness_level')
    .in('id', unique);
  fail(error);
  for (const row of (data ?? []) as PublicUserRow[]) people.set(row.id, row);
  return people;
}

async function hydrate(rows: EventRow[]): Promise<EventRecord[]> {
  if (!rows.length) return [];
  const { data, error } = await supabase.from('txn_event_participants')
    .select('event_id, user_id, status')
    .in('event_id', rows.map(row => row.id));
  fail(error);
  const participants = (data ?? []) as ParticipantRow[];
  const people = await loadPeople([...rows.map(row => row.event_owner), ...participants.map(item => item.user_id)]);
  return rows.map(row => eventFromRow(row, people, participants));
}

export async function fetchPublicEvents(): Promise<EventRecord[]> {
  const { data, error } = await supabase.from('txn_events')
    .select(EVENT_COLUMNS)
    .eq('visibility', 'public')
    .neq('status', 'draft')
    .is('deleted_at', null)
    .order('scheduled_at', { ascending: false })
    .limit(MAX_EVENTS);
  fail(error);
  return hydrate((data ?? []) as EventRow[]);
}

export async function fetchEvent(id: string): Promise<EventRecord | null> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return null;
  const { data, error } = await supabase.from('txn_events').select(EVENT_COLUMNS).eq('id', numericId).maybeSingle();
  fail(error);
  if (!data) return null;
  return (await hydrate([data as EventRow]))[0];
}

export async function fetchHostedEvents(userId: UserId): Promise<EventRecord[]> {
  const { data, error } = await supabase.from('txn_events')
    .select(EVENT_COLUMNS)
    .eq('event_owner', Number(userId))
    .is('deleted_at', null)
    .order('scheduled_at', { ascending: false })
    .limit(MAX_EVENTS);
  fail(error);
  return hydrate((data ?? []) as EventRow[]);
}

export interface PartyInput { title: string; type: string; date: string; location: string; description: string; levelId: string; style?: string; capacity: number }

export async function createPartyRow(input: PartyInput) {
  const { data, error } = await supabase.rpc('create_party', {
    p_title: input.title,
    p_workout_type: workoutTypeToDb(input.type),
    p_scheduled_at: input.date,
    p_location: input.location,
    p_description: input.description,
    p_target_level: input.levelId,
    p_party_style: input.style ?? null,
    p_max_participants: input.capacity,
  });
  fail(error);
  const event = await fetchEvent(String(data));
  if (!event) throw new Error('Party not found after create');
  return event;
}

async function reload(id: string) {
  const event = await fetchEvent(id);
  if (!event) throw new Error('Event not found');
  return event;
}

export async function joinEventRow(eventId: string) {
  const { error } = await supabase.rpc('join_event', { p_event_id: Number(eventId) });
  fail(error);
  return reload(eventId);
}

export async function leaveEventRow(eventId: string) {
  const { error } = await supabase.rpc('leave_event', { p_event_id: Number(eventId) });
  fail(error);
  return reload(eventId);
}

export async function cancelEventRow(eventId: string, userId: UserId) {
  const { error } = await supabase.from('txn_events')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', Number(eventId))
    .eq('event_owner', Number(userId));
  fail(error);
  return reload(eventId);
}

export async function fetchComments(eventId: string, { limit = 20, offset = 0 } = {}): Promise<CommentRecord[]> {
  const { data, error } = await supabase.from('txn_group_comments')
    .select('id, event_id, user_id, comment_text, images, created_at')
    .eq('event_id', Number(eventId))
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);
  fail(error);
  const rows = (data ?? []) as CommentRow[];
  const people = await loadPeople(rows.map(row => row.user_id));
  return rows.map(row => commentFromRow(row, people));
}

export async function insertComment(eventId: string, user: User, message: string, images: CommentImage[]): Promise<CommentRecord> {
  const stored = await Promise.all(images.map(async image => ({
    ...image,
    url: image.url.startsWith('data:') ? await uploadDataUrl('comment-images', image.url) : image.url,
  })));
  const { data, error } = await supabase.from('txn_group_comments')
    .insert({ event_id: Number(eventId), user_id: Number(user.id), comment_text: message, images: stored })
    .select('id, event_id, user_id, comment_text, images, created_at')
    .single();
  fail(error);
  const people = await loadPeople([Number(user.id)]);
  return commentFromRow(data as CommentRow, people);
}
