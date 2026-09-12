// Mock Comment Repository

let comments = [
  {
    id: 'c1',
    eventId: 'e1',
    userId: 'u3',
    userDisplayName: 'BikeMaster',
    userAvatarUrl: null,
    message: 'น่าสนใจครับ รับคนวิ่งเพซ 8 ไหมครับ เพิ่งเริ่มวิ่งได้ไม่นาน',
    createdAt: '2026-09-01T10:00:00+07:00'
  },
  {
    id: 'c2',
    eventId: 'e1',
    userId: 'u2',
    userDisplayName: 'RunHappy',
    userAvatarUrl: 'https://i.pravatar.cc/150?u=2',
    message: 'ยินดีเลยครับ งานนี้เน้นวิ่งชิลๆ ไม่รีบครับ มาด้วยกันได้เลย',
    createdAt: '2026-09-01T10:30:00+07:00'
  }
];

// Keep track of next ID
let nextId = 3;

/**
 * Get comments for a specific event
 */
export async function getCommentsByEventId(eventId, { limit = 20, offset = 0 } = {}) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const eventComments = comments
    .filter(c => c.eventId === eventId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Oldest first
    
  return eventComments.slice(offset, offset + limit);
}

/**
 * Post a new comment
 */
export async function postComment(eventId, user, message) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  const trimmedMessage = message.trim();
  if (!trimmedMessage || trimmedMessage.length > 1000) {
    throw new Error('Invalid message length');
  }
  
  const newComment = {
    id: `c${nextId++}`,
    eventId,
    userId: user.id,
    userDisplayName: user.displayName || user.username,
    userAvatarUrl: user.avatarUrl,
    message: trimmedMessage,
    createdAt: new Date().toISOString()
  };
  
  comments.push(newComment);
  
  return newComment;
}
