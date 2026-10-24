import React, { useMemo } from 'react';
import type { EventRecord } from '../../types/models';
import { buildPartyActivities } from '../../data/mockPartyActivities';
import InitialAvatar from '../common/InitialAvatar';

const WINDOW_DAYS = 28;

// What the party ran together over the last four weeks, and who ran the most.
export default function PartyStats({ party }: { party: EventRecord }) {
  const { totals, board } = useMemo(() => {
    const since = Date.now() - WINDOW_DAYS * 86400000;
    const recent = buildPartyActivities(party).filter(activity => new Date(activity.date).getTime() >= since);
    const byMember = new Map<string, { id: string; name: string; km: number; runs: number }>();
    for (const activity of recent) {
      const key = String(activity.member.id);
      const row = byMember.get(key) ?? { id: key, name: activity.member.name, km: 0, runs: 0 };
      row.km += activity.distanceKm;
      row.runs += 1;
      byMember.set(key, row);
    }
    return {
      totals: {
        km: recent.reduce((sum, activity) => sum + activity.distanceKm, 0),
        runs: recent.length,
        hours: recent.reduce((sum, activity) => sum + activity.durationMin, 0) / 60,
        members: byMember.size,
      },
      board: [...byMember.values()].sort((a, b) => b.km - a.km),
    };
  }, [party.id]);

  const tiles = [
    { label: 'ระยะรวม', value: `${totals.km.toFixed(1)}`, unit: 'กม.' },
    { label: 'วิ่งไปแล้ว', value: `${totals.runs}`, unit: 'ครั้ง' },
    { label: 'เวลารวม', value: totals.hours.toFixed(1), unit: 'ชม.' },
    { label: 'คนที่ออกวิ่ง', value: `${totals.members}`, unit: 'คน' },
  ];

  return (
    <div className="grid gap-6">
      <div>
        <p className="mb-3 text-sm text-neutral-600">4 สัปดาห์ที่ผ่านมา</p>
        <dl className="m-0 grid grid-cols-2 gap-3 md:grid-cols-4">
          {tiles.map(tile => (
            <div key={tile.label} className="rounded-lg bg-neutral-50 p-4">
              <dt className="text-sm text-neutral-600">{tile.label}</dt>
              <dd className="mt-1 text-2xl font-bold text-neutral-900">{tile.value} <span className="text-base font-medium text-neutral-600">{tile.unit}</span></dd>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <h4 className="mb-3 font-bold text-neutral-900">อันดับระยะทาง</h4>
        {board.length ? (
          <ol className="m-0 list-none divide-y divide-neutral-200 p-0">
            {board.map((row, index) => (
              <li key={row.id} className="flex items-center gap-3 py-3">
                <span className={`w-6 text-center font-bold ${index === 0 ? 'text-brand-600' : 'text-neutral-500'}`}>{index + 1}</span>
                <InitialAvatar id={row.id} name={row.name} size="sm" />
                <span className="min-w-0 flex-1 truncate font-medium text-neutral-900">{row.name}</span>
                <span className="text-sm text-neutral-600">{row.runs} ครั้ง</span>
                <span className="w-20 text-right font-semibold whitespace-nowrap text-neutral-900">{row.km.toFixed(1)} กม.</span>
              </li>
            ))}
          </ol>
        ) : <p className="text-neutral-500">ยังไม่มีใครวิ่งใน 4 สัปดาห์นี้</p>}
      </div>
    </div>
  );
}
