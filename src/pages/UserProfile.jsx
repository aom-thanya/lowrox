import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigationType, useParams, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Avatar from '../components/common/Avatar';
import ContentCard from '../components/common/ContentCard';
import Button from '../components/common/Button';
import Skeleton from '../components/common/Skeleton';
import Tag from '../components/common/Tag';
import Tabs from '../components/common/Tabs';
import EmptyState from '../components/common/EmptyState';
import EventCard from '../components/events/EventCard';
import { useAuth } from '../context/AuthContext';
import { getPublicProfile } from '../services/publicProfileRepository';
import { getHostedEvents } from '../services/eventRepository';

const labels = { upcoming: 'กำลังจะมาถึง', past: 'ที่ผ่านมา', cancelled: 'ยกเลิก' };
const emptyLabels = { upcoming: 'ยังไม่มีกิจกรรมที่กำลังจะมาถึง', past: 'ยังไม่มีกิจกรรมที่ผ่านมา', cancelled: 'ยังไม่มีกิจกรรมที่ยกเลิก' };
const scrollPositions = new Map();
function CardsSkeleton() {
  return <div className="event-grid public-profile-events" role="status" aria-label="กำลังโหลดกิจกรรม">{Array.from({ length: 6 }, (_, index) => <ContentCard key={index}><Skeleton /><Skeleton /></ContentCard>)}</div>;
}
function ProfileContent({ userId }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigationType = useNavigationType();
  const [params, setParams] = useSearchParams();
  const tab = Object.hasOwn(labels, params.get('tab')) ? params.get('tab') : 'upcoming';
  const limit = Math.max(6, Math.floor((Number(params.get('limit')) || 6) / 6) * 6);
  const [profile, setProfile] = useState(null);
  const [profileStatus, setProfileStatus] = useState('loading');
  const [eventStatus, setEventStatus] = useState('loading');
  const [data, setData] = useState(null);
  const [retry, setRetry] = useState(0);
  const viewKey = location.pathname + location.search;
  const restored = useRef(null);
  useEffect(() => {
    let cancelled = false;
    getPublicProfile(userId).then(value => {
      if (!cancelled) { setProfile(value); setProfileStatus('ready'); }
    }).catch(() => { if (!cancelled) setProfileStatus('error'); });
    return () => { cancelled = true; };
  }, [userId]);
  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    setEventStatus('loading');
    getHostedEvents(userId, { tab, limit }).then(value => {
      if (!cancelled) { setData(value); setEventStatus('ready'); }
    }).catch(() => { if (!cancelled) { setData(null); setEventStatus('error'); } });
    return () => { cancelled = true; };
  }, [profile, userId, tab, limit, retry]);
  useEffect(() => {
    if (eventStatus !== 'ready') return;
    let frame;
    if (restored.current !== viewKey) {
      restored.current = viewKey;
      if (navigationType === 'POP' || location.state?.restoreProfile) {
        frame = requestAnimationFrame(() => window.scrollTo(0, scrollPositions.get(viewKey) || 0));
      }
    }
    const save = () => scrollPositions.set(viewKey, window.scrollY);
    window.addEventListener('scroll', save, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', save); };
  }, [eventStatus, viewKey, navigationType, location.state]);
  const changeView = (nextTab, nextLimit = 6) => {
    setParams({ tab: nextTab, limit: String(nextLimit) }, { replace: true, preventScrollReset: true });
  };
  const savePosition = () => scrollPositions.set(viewKey, window.scrollY);
  const counts = eventStatus === 'ready' ? data?.counts : null;
  const total = counts ? Object.values(counts).reduce((sum, count) => sum + count, 0) : null;
  return <div className="flex flex-col min-h-screen">
    <Header />
    <main className="main-content public-profile-page">
      <div className="container public-profile-container">
        <Link to="/events" className="public-profile-back">กลับหน้ากิจกรรม</Link>
        {profileStatus === 'loading' && <ContentCard><div role="status" aria-label="กำลังโหลดโปรไฟล์"><Skeleton /><Skeleton /><Skeleton /></div></ContentCard>}
        {profileStatus === 'error' && <EmptyState action={<Link to="/events" className="btn btn-secondary btn-md">กลับหน้า Events</Link>}>ไม่พบโปรไฟล์นี้ หรือไม่สามารถเปิดดูได้</EmptyState>}
        {profileStatus === 'ready' && <>
          <ContentCard className="public-profile-overview">
            <Avatar src={profile.avatarUrl} size="large" />
            <div className="public-profile-info">
              <h1 className="heading-2">{profile.displayName}</h1>
              {profile.bio && <p className="public-profile-bio">{profile.bio}</p>}
              {profile.area && <p className="text-neutral-600">พื้นที่ออกกำลังกาย: {profile.area}</p>}
              {!!profile.interests.length && <div className="public-profile-tags" aria-label="กิจกรรมที่สนใจ">{profile.interests.map((item, index) => <Tag key={index}>{item}</Tag>)}</div>}
              {profile.level && <p>ระดับ: {profile.level}</p>}
              {!!profile.goals.length && <div className="public-profile-tags" aria-label="เป้าหมาย">{profile.goals.map((goal, index) => <Tag key={index}>{goal}</Tag>)}</div>}
              {counts && <p className="public-profile-experience">จัดกิจกรรมสำเร็จแล้ว {counts.past} ครั้ง</p>}
              {user && String(user.id) === profile.id && <Link to="/profile" className="btn btn-secondary btn-md public-profile-edit">แก้ไขโปรไฟล์</Link>}
            </div>
          </ContentCard>
          <section className="public-profile-history" aria-labelledby="hosted-events-title">
            <h2 id="hosted-events-title" className="heading-3">กิจกรรมที่เป็นหัวตี้</h2>
            <Tabs label="ประวัติการเป็นหัวตี้" value={tab} onChange={changeView} items={Object.entries(labels).map(([value, label]) => ({ value, label, count: counts?.[value] }))}>
              {eventStatus === 'loading' && <CardsSkeleton />}
              {eventStatus === 'error' && <EmptyState action={<Button variant="secondary" onClick={() => setRetry(value => value + 1)}>ลองอีกครั้ง</Button>}>โหลดกิจกรรมไม่สำเร็จ</EmptyState>}
              {eventStatus === 'ready' && <>
                {!data.events.length ? <EmptyState>{total === 0 ? 'ยังไม่มีกิจกรรมที่เป็นหัวตี้' : emptyLabels[tab]}</EmptyState> : <div className="event-grid public-profile-events">{data.events.map(event => <EventCard key={event.id} event={event} onNavigate={savePosition} navigationState={{ fromProfile: viewKey }} />)}</div>}
                {data.hasMore && <Button variant="secondary" className="public-profile-more" onClick={() => changeView(tab, limit + 6)}>โหลดเพิ่มเติม</Button>}
              </>}
            </Tabs>
          </section>
        </>}
      </div>
    </main>
    <Footer />
  </div>;
}
export default function UserProfile() {
  const { userId } = useParams();
  return <ProfileContent key={userId} userId={userId} />;
}
