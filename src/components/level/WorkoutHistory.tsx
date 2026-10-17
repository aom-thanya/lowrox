import React from 'react';
import { Trash2 } from 'lucide-react';
import type { Workout } from '../../services/workoutRepository';
import { fiveKEquivalent, formatDistance, formatDuration, formatPace, LEVELS, levelIndexFor } from '../../utils/leveling';

const dayFormatter = new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short' });
const formatDay = (dateKey: string) => dayFormatter.format(new Date(`${dateKey}T00:00:00`));

// 5 km-equivalent time over the last runs, oldest → newest. Faster (lower) is drawn higher.
function ProgressChart({ workouts }: { workouts: Workout[] }) {
  const points = [...workouts].slice(0, 12).reverse().map(item => fiveKEquivalent(item));
  if (points.length < 2) return null;
  const width = 320;
  const height = 96;
  const pad = 8;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const coords = points.map((value, index) => [
    pad + (index / (points.length - 1)) * (width - pad * 2),
    pad + ((value - min) / range) * (height - pad * 2),
  ]);
  const line = coords.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)},${height} L${coords[0][0].toFixed(1)},${height} Z`;
  const change = points[0] - points[points.length - 1];

  return (
    <figure className="level-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`กราฟเวลา 5 กม. เทียบเท่า ${points.length} ครั้งล่าสุด`}>
        <path d={area} className="level-chart-area" />
        <path d={line} className="level-chart-line" />
        {coords.map(([x, y], index) => <circle key={index} cx={x} cy={y} r={index === coords.length - 1 ? 4.5 : 3} className="level-chart-dot" />)}
      </svg>
      <figcaption>
        {change > 0
          ? <>เร็วขึ้น <b>{formatDuration(change)}</b> นาที จากครั้งแรกในกราฟ</>
          : <>ยังไม่เร็วขึ้น ลองทำตามแผนซ้อมดูนะ</>}
      </figcaption>
    </figure>
  );
}

export default function WorkoutHistory({ workouts, onDelete }: { workouts: Workout[]; onDelete: (workoutId: string) => void }) {
  return (
    <section className="level-section" aria-labelledby="history-heading">
      <div className="level-section-head">
        <h2 id="history-heading" className="heading-4">พัฒนาการ</h2>
        <span className="plan-count">{workouts.length} ครั้ง</span>
      </div>
      {workouts.length === 0 ? (
        <p className="level-empty">ยังไม่มีบันทึกการวิ่ง</p>
      ) : (
        <>
          <ProgressChart workouts={workouts} />
          <ul className="history-list">
            {workouts.map(item => {
              const level = LEVELS[levelIndexFor(fiveKEquivalent(item))];
              return (
                <li key={item.id} className="history-item">
                  <span className="history-date">{formatDay(item.date)}</span>
                  <span className="history-main">
                    <b>{formatDistance(item.distanceKm)} · {formatDuration(item.durationMin)}</b>
                    <span>Pace {formatPace(item)} /กม.{item.source === 'onboarding' ? ' · จาก Onboarding' : ''}</span>
                  </span>
                  <span className="level-chip" data-level={level.id}>{level.label}</span>
                  {item.source === 'log' && (
                    <button type="button" className="history-delete" aria-label={`ลบบันทึก ${formatDay(item.date)} ${formatDistance(item.distanceKm)}`} onClick={() => onDelete(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
