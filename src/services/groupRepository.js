// Mock Group Repository
// Manages groups, memberships, and their relationship to Events.

// --- Mock Data ---

const groups = [
  {
    id: 'g1',
    name: 'ตีแบด วันศุกร์',
    imageUrl: null,
    eventId: 'e3',
    memberCount: 4,
    createdAt: '2026-09-10T12:00:00+07:00'
  },
  {
    id: 'g2',
    name: 'ซ้อมวิ่ง 30K — พุทธมณฑล',
    imageUrl: null,
    eventId: 'e4',
    memberCount: 3,
    createdAt: '2026-08-20T08:00:00+07:00'
  }
];

const memberships = [
  // User "test" (id: 1) is in both groups
  { userId: 1, groupId: 'g1', joinedAt: '2026-09-11T10:00:00+07:00' },
  { userId: 1, groupId: 'g2', joinedAt: '2026-08-21T06:00:00+07:00' },

  // Other mock members
  { userId: 'u4', groupId: 'g1', joinedAt: '2026-09-10T12:00:00+07:00' },
  { userId: 'u5', groupId: 'g1', joinedAt: '2026-09-10T13:00:00+07:00' },
  { userId: 'u6', groupId: 'g1', joinedAt: '2026-09-12T09:00:00+07:00' },
  { userId: 'u5', groupId: 'g2', joinedAt: '2026-08-20T08:00:00+07:00' },
  { userId: 'u7', groupId: 'g2', joinedAt: '2026-08-22T07:00:00+07:00' }
];

const memberProfiles = {
  'u4': { id: 'u4', displayName: 'SmashBro', avatarUrl: 'https://i.pravatar.cc/150?u=4' },
  'u5': { id: 'u5', displayName: 'Marathoner', avatarUrl: 'https://i.pravatar.cc/150?u=5' },
  'u6': { id: 'u6', displayName: 'BadmintonFan', avatarUrl: null },
  'u7': { id: 'u7', displayName: 'PaceSetter', avatarUrl: 'https://i.pravatar.cc/150?u=7' }
};

// --- Helpers ---

const LAST_READ_KEY = 'lowrox:lastRead';

function getLastReadMap() {
  try {
    return JSON.parse(localStorage.getItem(LAST_READ_KEY) || '{}');
  } catch {
    return {};
  }
}

function setLastRead(userId, groupId, messageId) {
  const map = getLastReadMap();
  const key = `${userId}:${groupId}`;
  map[key] = messageId;
  localStorage.setItem(LAST_READ_KEY, JSON.stringify(map));
}

function getLastReadMessageId(userId, groupId) {
  const map = getLastReadMap();
  return map[`${userId}:${groupId}`] || null;
}

function isMember(userId, groupId) {
  return memberships.some(m => m.userId === userId && m.groupId === groupId);
}

// We need access to messages to compute unread counts and last message.
// messageRepository will register itself here after init.
let _getMessagesForGroup = null;

export function _registerMessageProvider(fn) {
  _getMessagesForGroup = fn;
}

// --- Public API ---

/**
 * Get all groups the user is a member of, enriched with lastMessage and unreadCount.
 */
export async function getMyGroups(user) {
  await new Promise(r => setTimeout(r, 200));

  if (!user) throw new Error('Unauthorized');

  const userGroups = memberships
    .filter(m => m.userId === user.id)
    .map(m => {
      const group = groups.find(g => g.id === m.groupId);
      if (!group) return null;

      let lastMessage = null;
      let unreadCount = 0;

      if (_getMessagesForGroup) {
        const msgs = _getMessagesForGroup(m.groupId);
        if (msgs.length > 0) {
          const last = msgs[msgs.length - 1];
          lastMessage = {
            text: last.text,
            senderName: last.senderId === user.id
              ? 'คุณ'
              : (last.senderName || 'สมาชิก'),
            createdAt: last.createdAt
          };

          const lastReadId = getLastReadMessageId(user.id, m.groupId);
          if (lastReadId) {
            const lastReadIdx = msgs.findIndex(msg => msg.id === lastReadId);
            const unread = msgs.slice(lastReadIdx + 1).filter(msg => msg.senderId !== user.id);
            unreadCount = unread.length;
          } else {
            // Never read: all messages from others are unread
            unreadCount = msgs.filter(msg => msg.senderId !== user.id).length;
          }
        }
      }

      return {
        ...group,
        joinedAt: m.joinedAt,
        lastMessage,
        unreadCount
      };
    })
    .filter(Boolean);

  // Sort: groups with latest message first, then by joinedAt
  userGroups.sort((a, b) => {
    const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(a.joinedAt);
    const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(b.joinedAt);
    return bTime - aTime;
  });

  return userGroups;
}

/**
 * Get a single group by ID. Checks membership.
 */
export async function getGroupById(groupId, user) {
  await new Promise(r => setTimeout(r, 100));

  if (!user) throw new Error('Unauthorized');
  if (!isMember(user.id, groupId)) throw new Error('Access denied');

  const group = groups.find(g => g.id === groupId);
  if (!group) throw new Error('Group not found');

  return { ...group };
}

/**
 * Get members of a group. Checks membership.
 */
export async function getGroupMembers(groupId, user) {
  await new Promise(r => setTimeout(r, 100));

  if (!user) throw new Error('Unauthorized');
  if (!isMember(user.id, groupId)) throw new Error('Access denied');

  const members = memberships
    .filter(m => m.groupId === groupId)
    .map(m => {
      if (m.userId === user.id) {
        return {
          id: user.id,
          displayName: user.displayName || user.username,
          avatarUrl: user.avatarUrl || null,
          joinedAt: m.joinedAt,
          isMe: true
        };
      }
      const profile = memberProfiles[m.userId];
      return {
        id: m.userId,
        displayName: profile?.displayName || 'สมาชิก',
        avatarUrl: profile?.avatarUrl || null,
        joinedAt: m.joinedAt,
        isMe: false
      };
    });

  return members;
}

/**
 * Find the internal group linked to an event. Returns null if none.
 */
export async function getGroupByEventId(eventId, user) {
  await new Promise(r => setTimeout(r, 100));

  if (!user) return null;

  const group = groups.find(g => g.eventId === eventId);
  if (!group) return null;
  if (!isMember(user.id, group.id)) return null;

  return { ...group };
}

/**
 * Mark messages as read up to a given messageId.
 */
export async function markAsRead(groupId, user, messageId) {
  if (!user) return;
  if (!isMember(user.id, groupId)) return;

  setLastRead(user.id, groupId, messageId);
}

/**
 * Get the total unread message count across all groups.
 */
export async function getTotalUnreadCount(user) {
  if (!user) return 0;
  if (!_getMessagesForGroup) return 0;

  let total = 0;
  const userMemberships = memberships.filter(m => m.userId === user.id);

  for (const m of userMemberships) {
    const msgs = _getMessagesForGroup(m.groupId);
    const lastReadId = getLastReadMessageId(user.id, m.groupId);

    if (lastReadId) {
      const lastReadIdx = msgs.findIndex(msg => msg.id === lastReadId);
      total += msgs.slice(lastReadIdx + 1).filter(msg => msg.senderId !== user.id).length;
    } else {
      total += msgs.filter(msg => msg.senderId !== user.id).length;
    }
  }

  return total;
}

/**
 * Clear all read markers for a user (called on logout).
 */
export function clearReadMarkers() {
  localStorage.removeItem(LAST_READ_KEY);
}
