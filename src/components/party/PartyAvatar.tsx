import React from 'react';
import { Dumbbell, Footprints, Mountain, Route, Timer, Users, Zap, type LucideIcon } from 'lucide-react';
import type { PartyStyle } from '../../types/models';

// The party's own picture: an icon for the kind of session on its own color, ringed so it can sit over the cover.
const LOOKS: Record<PartyStyle, { icon: LucideIcon; tone: string }> = {
  easy: { icon: Footprints, tone: 'from-[#4FD49E] to-[#16A36A]' },
  long: { icon: Route, tone: 'from-brand-400 to-brand-700' },
  interval: { icon: Timer, tone: 'from-[#F87171] to-[#D9363E]' },
  tempo: { icon: Zap, tone: 'from-[#FFC53D] to-[#E99A00]' },
  hyrox: { icon: Dumbbell, tone: 'from-neutral-700 to-neutral-950' },
  trail: { icon: Mountain, tone: 'from-[#5EEAD4] to-[#0D9488]' },
};
const DEFAULT_LOOK = { icon: Users, tone: 'from-brand-300 to-brand-600' };

const SIZES = {
  md: { box: 'size-14 ring-4', icon: 26 },
  lg: { box: 'size-18 ring-4', icon: 34 },
};

export default function PartyAvatar({ style, size = 'md', className = '' }: { style?: PartyStyle; size?: keyof typeof SIZES; className?: string }) {
  const { icon: Icon, tone } = (style && LOOKS[style]) || DEFAULT_LOOK;
  return (
    <span className={`relative z-10 inline-grid shrink-0 place-items-center rounded-full bg-linear-to-br text-white shadow-md ring-white ${tone} ${SIZES[size].box} ${className}`} aria-hidden="true">
      <Icon size={SIZES[size].icon} strokeWidth={2.25} />
    </span>
  );
}
