import type { EventRecord } from '../types/models';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageShell from '../components/common/PageShell';
import EventCard from '../components/events/EventCard';
import { getEvents } from '../services/eventRepository';
import { Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMyLevel } from '../hooks/useMyLevel';

export default function EventList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Extract search params
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';
  const area = searchParams.get('area') || '';
  const level = searchParams.get('level') || '';
  const { user } = useAuth();
  const { summary } = useMyLevel();
  
  // Local state for the filter form so it doesn't update URL on every keystroke
  const [formQuery, setFormQuery] = useState(query);
  const [formType, setFormType] = useState(type);
  const [formArea, setFormArea] = useState(area);

  useEffect(() => {
    // Sync form with URL on load/popstate
    setFormQuery(query);
    setFormType(type);
    setFormArea(area);
    
    let isMounted = true;
    
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const data = await getEvents({ query, type, area, level });
        if (isMounted) {
          setEvents(data);
        }
      } catch (err) {
        console.error('Failed to fetch events', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    fetchEvents();
    
    return () => {
      isMounted = false;
    };
  }, [query, type, area, level]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const newParams = new URLSearchParams();
    if (formQuery) newParams.set('q', formQuery);
    if (formType) newParams.set('type', formType);
    if (formArea) newParams.set('area', formArea);
    if (level) newParams.set('level', level);
    
    setSearchParams(newParams);
  };

  const handleClear = () => {
    setFormQuery('');
    setFormType('');
    setFormArea('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <PageShell className="event-list-page">
        <div className="container event-list-container">
          <div className="event-list-heading event-list-heading-row">
            <div>
              <h1 className="heading-2">กิจกรรม</h1>
              <p className="body-lg text-neutral-600">หาตี้ซ้อมที่สนใจ หรือเปิดตี้เองแล้วรอคนเลเวลใกล้กันมาจอย</p>
            </div>
            <Link to="/parties/new" className="btn btn-primary btn-md btn-cta event-create-btn"><Plus size={18} /> ตั้งหัวตี้</Link>
          </div>

          {user && summary && (
            <div className="event-level-filter">
              <button
                type="button"
                className={`onboarding-pill-button${level ? ' selected' : ''}`}
                aria-pressed={Boolean(level)}
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  if (level) next.delete('level'); else next.set('level', summary.level.id);
                  setSearchParams(next);
                }}
              >
                ตี้เลเวลของฉัน ({summary.level.label})
              </button>
            </div>
          )}
          
          {/* Filters */}
          <div className="event-filter-panel">
            <form onSubmit={handleSearch} className="event-filter-form">
              <div className="event-filter-field">
                <label htmlFor="event-query">ค้นหากิจกรรม</label>
                <div className="event-search-input">
                  <div className="event-search-icon">
                    <Search size={20} aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    id="event-query" className="form-control"
                    placeholder="ชื่อกิจกรรม, สถานที่..."
                    value={formQuery}
                    onChange={e => setFormQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="event-filter-field">
                <label htmlFor="event-type">ประเภทกีฬา</label>
                <select 
                  id="event-type" className="form-control"
                  value={formType}
                  onChange={e => setFormType(e.target.value)}
                >
                  <option value="">ทั้งหมด</option>
                  <option value="Running">วิ่ง</option>
                  <option value="Cycling">ปั่นจักรยาน</option>
                  <option value="Badminton">แบดมินตัน</option>
                </select>
              </div>
              
              <div className="event-filter-field">
                <label htmlFor="event-area">พื้นที่</label>
                <input
                  type="text"
                  id="event-area" className="form-control"
                  placeholder="เช่น กรุงเทพ..."
                  value={formArea}
                  onChange={e => setFormArea(e.target.value)}
                />
              </div>
              
              <div className="event-filter-actions">
                <button type="submit" className="btn btn-primary btn-md">
                  ค้นหา
                </button>
                <button type="button" onClick={handleClear} className="btn btn-secondary btn-md">
                  ล้างตัวกรอง
                </button>
              </div>
            </form>
          </div>
          
          {/* Results Summary */}
          <div className="event-results-summary" aria-live="polite">
            {!isLoading && (
              <p className="text-neutral-600">พบ {events.length} กิจกรรม</p>
            )}
          </div>
          
          {/* Event Grid */}
          {isLoading ? (
            <div className="event-grid">
              {[1, 2, 3].map(i => (
                <div key={i} className="event-list-skeleton"></div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="event-grid">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="event-list-empty">
              <p className="text-neutral-500 text-lg mb-4">ไม่พบกิจกรรมที่ค้นหา</p>
              <button onClick={handleClear} className="btn btn-primary btn-md">ดูทั้งหมด</button>
            </div>
          )}
        </div>
    </PageShell>
  );
}
