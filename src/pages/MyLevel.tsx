import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowRight, Flame, X } from 'lucide-react';
import PageShell from '../components/common/PageShell';
import Sparkles from '../components/common/Sparkles';
import Toast from '../components/common/Toast';
import LevelHeroCard from '../components/level/LevelHeroCard';
import LogWorkoutDialog from '../components/level/LogWorkoutDialog';
import WeeklyPlan from '../components/level/WeeklyPlan';
import WorkoutHistory from '../components/level/WorkoutHistory';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMyLevel } from '../hooks/useMyLevel';
import { readPlanDone, togglePlanDone } from '../services/workoutRepository';
import { formatDuration, type Level } from '../utils/leveling';
import { buildWeeklyPlan } from '../utils/trainingPlan';
import '../styles/level.css';

const CELEBRATE_SPARKLES = [
  { top: '10%', left: '6%', size: 18, delay: 0 },
  { top: '60%', left: '12%', size: 12, delay: 0.5 },
  { top: '20%', left: '90%', size: 20, delay: 0.3 },
  { top: '70%', left: '82%', size: 14, delay: 0.9 },
];

export default function MyLevel() {
  useDocumentTitle('เลเวลของฉัน | Lowrox');
  const { user } = useAuth();
  const location = useLocation();
  const { workouts, summary, hasHealthConcerns, logWorkout, removeWorkout } = useMyLevel();
  const [searchParams, setSearchParams] = useSearchParams();
  const [logOpen, setLogOpen] = useState(searchParams.get('log') === '1');
  const [levelUp, setLevelUp] = useState<{ from: Level | null; to: Level } | null>(null);
  const [toast, setToast] = useState('');
  const [doneIds, setDoneIds] = useState(() => (user ? readPlanDone(user.id) : []));
  const dismissToast = useCallback(() => setToast(''), []);

  // The header's "บันทึกการวิ่ง" links here with ?log=1; open the sheet and drop the flag from the URL.
  useEffect(() => {
    if (searchParams.get('log') !== '1') return;
    setLogOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete('log');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const sessions = useMemo(() => buildWeeklyPlan(summary, hasHealthConcerns), [summary, hasHealthConcerns]);
  const name = user?.displayName || user?.username || 'นักวิ่ง';
  const lastDistance = workouts[0] ? String(workouts[0].distanceKm) : '5';

  const handleSave = (input: Parameters<typeof logWorkout>[0]) => {
    const { before, after } = logWorkout(input);
    setLogOpen(false);
    if (after && (!before || after.index > before.index)) {
      setLevelUp({ from: before?.level ?? null, to: after.level });
    } else if (before && after && after.fiveKMinutes < before.fiveKMinutes) {
      setToast(`บันทึกแล้ว · สถิติใหม่! เร็วขึ้น ${formatDuration(before.fiveKMinutes - after.fiveKMinutes)} นาที`);
    } else {
      setToast('บันทึกแล้ว · ซ้อมต่อเนื่องแบบนี้ เดี๋ยวเลเวลขยับแน่นอน');
    }
  };

  return (
    <PageShell className="level-page">
      <div className="page-container level-container">
        {levelUp && (
          <div className="level-up" role="status">
            <Sparkles points={CELEBRATE_SPARKLES} />
            <p className="level-up-title">🎉 {levelUp.from ? 'เลเวลอัป!' : 'ได้เลเวลแรกแล้ว!'}</p>
            <p>{levelUp.from ? `จาก ${levelUp.from.label} สู่ ` : 'คุณอยู่เลเวล '}<b>{levelUp.to.label}</b></p>
            <button type="button" className="level-up-close" aria-label="ปิด" onClick={() => setLevelUp(null)}><X size={18} /></button>
          </div>
        )}

        <LevelHeroCard summary={summary} name={name} isFirstLevel={Boolean(location.state?.fromOnboarding)} onLog={() => setLogOpen(true)} />

        <div className="level-grid">
          <WeeklyPlan
            sessions={sessions}
            doneIds={doneIds}
            isMember={user?.tier === 'premium'}
            hasHealthConcerns={hasHealthConcerns}
            onToggle={(sessionId) => user && setDoneIds(togglePlanDone(user.id, sessionId))}
          />
          <WorkoutHistory workouts={workouts} onDelete={removeWorkout} />
        </div>

        <section className="level-next-steps" aria-label="ไปต่อ">
          <Link to="/events" className="level-next-card">
            <Flame size={22} aria-hidden="true" />
            <span><b>หาตี้ซ้อมเลเวล{summary ? ` ${summary.level.label}` : 'เดียวกัน'}</b><small>ซ้อมกับคนจังหวะใกล้กัน ไม่กดดัน</small></span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>
      </div>

      <LogWorkoutDialog key={lastDistance} open={logOpen} onClose={() => setLogOpen(false)} onSave={handleSave} defaultDistance={lastDistance} />
      <Toast message={toast} onDismiss={dismissToast} />
    </PageShell>
  );
}
