import type { EventRecord, PartyStyle } from '../types/models';
import { formatDateTimeShort } from './formatDate';
import { partyLevelLabel } from './leveling';

// Opening hook per kind of session, so the invite reads like a friend asking, not a listing.
const HOOKS: Record<PartyStyle, string> = {
  easy: 'วิ่งชิลๆ คุยกันไป ไม่ทิ้งกันแน่นอน 🐢💚',
  long: 'ลองรันยาวๆ ไปด้วยกัน ระยะทางจะไม่เหงาอีกต่อไป 🛣️',
  interval: 'มาลากเพซกันให้สุด ใครหมดแรงเดี๋ยวลากไปด้วย ⚡',
  tempo: 'ปั้นเพซให้คมขึ้น ซ้อมด้วยกันเร็วกว่าซ้อมคนเดียว 🔥',
  hyrox: 'หาคู่ลุย HYROX! วิ่งสลับสถานี เหงื่อท่วมไปด้วยกัน 🏋️',
  trail: 'ขึ้นเขาลุยเทรลกัน วิวสวย ขาสั่น ได้เพื่อนเพิ่ม ⛰️',
};
const DEFAULT_HOOK = 'ซ้อมคนเดียวมันเหงา มาซ้อมเป็นตี้กันดีกว่า! 🙌';

export function buildPartyShareText(event: EventRecord, url: string) {
  const joined = event.participants?.length ?? 0;
  const left = event.capacity ? event.capacity - joined : 0;
  const seats = left > 0 ? `เหลืออีกแค่ ${left} ที่ รีบจองก่อนเต็ม!` : 'ตี้เต็มแล้ว แต่มาดูไว้ก่อน รอบหน้าไม่พลาด!';
  return [
    event.style ? HOOKS[event.style] : DEFAULT_HOOK,
    '',
    `🏃 ${event.title}`,
    `📅 ${formatDateTimeShort(event.date)}`,
    `📍 ${event.location}`,
    `🎯 ${partyLevelLabel(event.levelId)} · ${seats}`,
    '',
    `👉 กดจอยตี้เลย: ${url}`,
  ].join('\n');
}

// Opens the phone's share sheet when there is one, otherwise copies the text. Throws if neither works.
export async function shareText(text: string): Promise<'shared' | 'copied' | 'cancelled'> {
  if (navigator.share) {
    try { await navigator.share({ text }); return 'shared'; } catch (err) {
      if ((err as Error).name === 'AbortError') return 'cancelled';
    }
  }
  await navigator.clipboard.writeText(text);
  return 'copied';
}
