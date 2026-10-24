import type { EventRecord, PartyStyle } from '../types/models';
import easy from '../assets/covers/easy.svg';
import long from '../assets/covers/long.svg';
import interval from '../assets/covers/interval.svg';
import tempo from '../assets/covers/tempo.svg';
import hyrox from '../assets/covers/hyrox.svg';
import trail from '../assets/covers/trail.svg';

// Mock cover art per kind of session, used until hosts can upload their own cover.
const COVERS: Record<PartyStyle, string> = { easy, long, interval, tempo, hyrox, trail };

export const coverFor = (event: EventRecord) => event.coverUrl || (event.isParty && event.style ? COVERS[event.style] : undefined);
