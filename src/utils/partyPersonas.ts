import type { EventRecord } from '../types/models';

// "คุณเป็นสายไหน?" — who is looking for a party, mapped to the parties that suit them.
export interface PartyPersona {
  id: string;
  label: string;
  hint: string;
  matches: (party: EventRecord) => boolean;
}

const at = (party: EventRecord) => new Date(party.date);
const isWeekend = (party: EventRecord) => [0, 6].includes(at(party).getDay());

export const PARTY_PERSONAS: PartyPersona[] = [
  {
    id: 'newbie',
    label: 'มือใหม่ เพิ่งเริ่มวิ่ง',
    hint: 'ตี้ Beginner หรือทุกเลเวล วิ่งช้า ไม่ทิ้งกัน',
    matches: party => (party.levelId === 'beginner' || party.levelId === 'all') && party.style !== 'trail',
  },
  {
    id: 'faster',
    label: 'อยากวิ่งเร็วขึ้น',
    hint: 'Interval และ Tempo ช่วยกันลากเพซ',
    matches: party => party.style === 'interval' || party.style === 'tempo',
  },
  {
    id: 'farther',
    label: 'อยากวิ่งไกลขึ้น',
    hint: 'Long run และเทรล สะสมระยะ',
    matches: party => party.style === 'long' || party.style === 'trail',
  },
  {
    id: 'hyrox',
    label: 'เตรียมลง HYROX',
    hint: 'ซ้อมวิ่งสลับสถานี หาคู่ลง Doubles',
    matches: party => party.style === 'hyrox',
  },
  {
    id: 'early',
    label: 'สายเช้าก่อนเข้างาน',
    hint: 'วันธรรมดา เริ่มก่อน 7 โมง',
    matches: party => !isWeekend(party) && at(party).getHours() < 7,
  },
  {
    id: 'after_work',
    label: 'สายหลังเลิกงาน',
    hint: 'วันธรรมดา 6 โมงเย็นเป็นต้นไป',
    matches: party => !isWeekend(party) && at(party).getHours() >= 18,
  },
  {
    id: 'weekend',
    label: 'ว่างแค่เสาร์-อาทิตย์',
    hint: 'ตี้วันหยุดทั้งหมด',
    matches: isWeekend,
  },
];

export const findPersona = (id: string) => PARTY_PERSONAS.find(persona => persona.id === id) ?? null;

// The persona that fits the goal picked during onboarding, if any.
const PERSONA_BY_GOAL: Record<string, string> = {
  improve_time: 'faster',
  increase_distance: 'farther',
  buddy_event: 'hyrox',
  prepare_event: 'hyrox',
  improve_endurance: 'farther',
};
export const personaForGoal = (goalType?: string) => (goalType && PERSONA_BY_GOAL[goalType]) || null;
