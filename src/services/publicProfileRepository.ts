import type { User, UserId } from '../types/models';
import areas from '../data/thaiAreas.json';
import { readUser } from './userRepository';
import { getKnownEventMember } from './eventRepository';
import { findMockMember } from '../data/mockMembers';
import { LEVELS } from '../utils/leveling';

const text = (value: unknown) => typeof value === 'string' ? value : '';
// Explicit public projection: never return a raw account or onboarding object.
export function toPublicProfile(record: User) {
  if (!record || record.publicProfileVisible === false || record.deletedAt || record.deleted_at || record.isDeleted) throw new Error('Profile unavailable');
  const province = areas.find(area => area.value === String(record.provinceId));
  const district = province?.districts.find(area => area.value === String(record.districtId));
  const publicOnboarding = record.publicOnboarding || {};
  return {
    id: String(record.id),
    displayName: text(record.displayName) || text(record.username),
    avatarUrl: text(record.avatarUrl),
    bio: text(record.bio),
    area: record.publicAreaVisible === false ? '' : [district?.label, province?.label].filter(Boolean).join(', '),
    interests: Array.isArray(record.interests) ? record.interests.filter(item => typeof item === 'string') : [],
    level: text(publicOnboarding.level),
    goals: Array.isArray(publicOnboarding.goals) ? publicOnboarding.goals.filter(item => typeof item === 'string') : [],
  };
}
export async function getPublicProfile(userId: UserId, storage = localStorage) {
  await new Promise(resolve => setTimeout(resolve, 150));
  const raw = storage.getItem(`lowrox:user:${userId}`);
  if (raw) {
    const saved = JSON.parse(raw);
    if (String(saved.id) !== String(userId)) throw new Error('Profile unavailable');
    return toPublicProfile(readUser(saved.id, storage));
  }
  const mock = findMockMember(String(userId));
  if (mock) {
    const level = LEVELS.find(item => item.id === mock.levelId)?.label;
    return toPublicProfile({ id: mock.id, displayName: mock.displayName, avatarUrl: '', bio: mock.bio, publicOnboarding: { level, goals: [mock.goalLabel] } });
  }
  const member = getKnownEventMember(userId);
  if (!member) throw new Error('Profile unavailable');
  return toPublicProfile({ ...member, avatarUrl: member.avatarUrl ?? '' });
}
