// Mock Message Repository
// Manages chat messages within groups.

import { _registerMessageProvider } from './groupRepository';

// --- Mock Data ---

let messages = [
  // Group g1: ตีแบด วันศุกร์
  {
    id: 'm1',
    groupId: 'g1',
    senderId: 'u4',
    senderName: 'SmashBro',
    senderAvatarUrl: 'https://i.pravatar.cc/150?u=4',
    text: 'ศุกร์นี้เจอกัน 2 ทุ่มนะครับ ใครมาได้บ้าง?',
    createdAt: '2026-09-12T10:00:00+07:00',
    requestId: 'req-m1'
  },
  {
    id: 'm2',
    groupId: 'g1',
    senderId: 'u5',
    senderName: 'Marathoner',
    senderAvatarUrl: 'https://i.pravatar.cc/150?u=5',
    text: 'ผมมาได้ครับ เตรียมไม้มาแล้ว 🏸',
    createdAt: '2026-09-12T10:15:00+07:00',
    requestId: 'req-m2'
  },
  {
    id: 'm3',
    groupId: 'g1',
    senderId: 1,
    senderName: 'test',
    senderAvatarUrl: null,
    text: 'มาแน่นอนครับ นัดกันหน้าสนามเลยนะ',
    createdAt: '2026-09-12T10:30:00+07:00',
    requestId: 'req-m3'
  },
  {
    id: 'm4',
    groupId: 'g1',
    senderId: 'u6',
    senderName: 'BadmintonFan',
    senderAvatarUrl: null,
    text: 'จะเอาลูกไปด้วย 2 หลอดครับ',
    createdAt: '2026-09-12T11:00:00+07:00',
    requestId: 'req-m4'
  },
  {
    id: 'm5',
    groupId: 'g1',
    senderId: 'u4',
    senderName: 'SmashBro',
    senderAvatarUrl: 'https://i.pravatar.cc/150?u=4',
    text: 'เยี่ยมเลยครับ ถ้าใครมาก่อนช่วยจองคอร์ทให้หน่อยนะ เอาคอร์ท 3 เหมือนเดิม',
    createdAt: '2026-09-12T11:30:00+07:00',
    requestId: 'req-m5'
  },

  // Group g2: ซ้อมวิ่ง 30K
  {
    id: 'm6',
    groupId: 'g2',
    senderId: 'u5',
    senderName: 'Marathoner',
    senderAvatarUrl: 'https://i.pravatar.cc/150?u=5',
    text: 'ซ้อมเสร็จแล้วครับ วิ่งได้ 28K วันนี้ ขาหนักมาก',
    createdAt: '2026-08-25T09:00:00+07:00',
    requestId: 'req-m6'
  },
  {
    id: 'm7',
    groupId: 'g2',
    senderId: 1,
    senderName: 'test',
    senderAvatarUrl: null,
    text: 'เก่งมากเลยครับ ผมได้แค่ 20K แล้วต้องหยุด',
    createdAt: '2026-08-25T09:30:00+07:00',
    requestId: 'req-m7'
  },
  {
    id: 'm8',
    groupId: 'g2',
    senderId: 'u7',
    senderName: 'PaceSetter',
    senderAvatarUrl: 'https://i.pravatar.cc/150?u=7',
    text: 'ครั้งหน้าลองปรับเพซให้ช้าลงนิดนึงในช่วง 15K แรก จะช่วยให้วิ่งได้ยาวขึ้นครับ',
    createdAt: '2026-08-25T10:00:00+07:00',
    requestId: 'req-m8'
  },
  {
    id: 'm9',
    groupId: 'g2',
    senderId: 'u5',
    senderName: 'Marathoner',
    senderAvatarUrl: 'https://i.pravatar.cc/150?u=5',
    text: 'งั้นนัดซ้อมอีกรอบวันอาทิตย์หน้าไหมครับ? เอาเพซ 6:30 แล้ววิ่ง 25K พอ',
    createdAt: '2026-08-26T18:00:00+07:00',
    requestId: 'req-m9'
  }
];

let nextId = 10;
const processedRequestIds = new Set(messages.map(m => m.requestId));

// Register this module as the message provider for groupRepository
_registerMessageProvider((groupId) => {
  return messages.filter(m => m.groupId === groupId);
});

// --- Helpers ---

function isMemberSync(userId, groupId) {
  // Re-import would cause circular dep; use a simple inline check.
  // The groupRepository checks membership via its own data.
  // Here we trust the caller already passed through groupRepository checks.
  return true;
}

// --- Public API ---

/**
 * Get messages for a group. Returns up to `limit` messages.
 * If `before` is provided, returns messages before that ID (for scrolling up).
 * Otherwise returns the latest messages.
 */
export async function getMessages(groupId, user, { before = null, limit = 50 } = {}) {
  await new Promise(r => setTimeout(r, 200));

  if (!user) throw new Error('Unauthorized');

  const groupMessages = messages
    .filter(m => m.groupId === groupId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  if (before) {
    const beforeIdx = groupMessages.findIndex(m => m.id === before);
    if (beforeIdx <= 0) return { messages: [], hasMore: false };

    const start = Math.max(0, beforeIdx - limit);
    return {
      messages: groupMessages.slice(start, beforeIdx),
      hasMore: start > 0
    };
  }

  const start = Math.max(0, groupMessages.length - limit);
  return {
    messages: groupMessages.slice(start),
    hasMore: start > 0
  };
}

/**
 * Get messages newer than `after` messageId (for polling).
 */
export async function getNewMessages(groupId, user, { after }) {
  await new Promise(r => setTimeout(r, 100));

  if (!user) throw new Error('Unauthorized');
  if (!after) return [];

  const groupMessages = messages
    .filter(m => m.groupId === groupId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const afterIdx = groupMessages.findIndex(m => m.id === after);
  if (afterIdx === -1) return groupMessages;

  return groupMessages.slice(afterIdx + 1);
}

/**
 * Send a message to a group.
 * Uses requestId for idempotency (prevents duplicate sends on retry).
 */
export async function sendMessage(groupId, user, text, requestId) {
  await new Promise(r => setTimeout(r, 300));

  if (!user) throw new Error('Unauthorized');

  // Check idempotency
  if (processedRequestIds.has(requestId)) {
    // Return the existing message for this requestId
    const existing = messages.find(m => m.requestId === requestId);
    if (existing) return existing;
  }

  const trimmed = text.trim();
  if (!trimmed) throw new Error('ข้อความต้องไม่ว่างเปล่า');
  if (trimmed.length > 2000) throw new Error('ข้อความต้องไม่เกิน 2,000 ตัวอักษร');

  const newMessage = {
    id: `m${nextId++}`,
    groupId,
    senderId: user.id,
    senderName: user.displayName || user.username,
    senderAvatarUrl: user.avatarUrl || null,
    text: trimmed,
    createdAt: new Date().toISOString(),
    requestId
  };

  messages.push(newMessage);
  processedRequestIds.add(requestId);

  return newMessage;
}
