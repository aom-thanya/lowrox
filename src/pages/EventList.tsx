import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageShell from '../components/common/PageShell';
import EventCard from '../components/events/EventCard';
import Pagination from '../components/common/Pagination';
import { getEvents, type EventPage } from '../services/eventRepository';
import { PARTY_PERSONAS, findPersona, personaForGoal } from '../utils/partyPersonas';
import { Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMyLevel } from '../hooks/useMyLevel';

export default function EventList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState<EventPage>({ events: [], total: 0, page: 1, pageCount: 1 });
  const listTopRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Extract search params
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';
  const area = searchParams.get('area') || '';
  const level = searchParams.get('level') || '';
  const persona = searchParams.get('persona') || '';
  const page = Number(searchParams.get('page')) || 1;
  const { user } = useAuth();
  const { summary } = useMyLevel();
  const suggestedPersona = personaForGoal(user?.onboardingData?.goals?.[0]?.goalType);
  const selectedPersona = findPersona(persona);
  
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
        const data = await getEvents({ query, type, area, level, persona, page });
        if (isMounted) {
          setResult(data);
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
  }, [query, type, area, level, persona, page]);

  // Any filter change starts again from page 1.
  const updateParams = (change: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams);
    change(next);
    next.delete('page');
    setSearchParams(next);
  };

  const goToPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    if (nextPage > 1) next.set('page', String(nextPage)); else next.delete('page');
    setSearchParams(next);
    listTopRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const newParams = new URLSearchParams();
    if (formQuery) newParams.set('q', formQuery);
    if (formType) newParams.set('type', formType);
    if (formArea) newParams.set('area', formArea);
    if (level) newParams.set('level', level);
    if (persona) newParams.set('persona', persona);
    
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
        <div className="page-container event-list-container">
          <div className="event-list-heading event-list-heading-row">
            <div>
              <h1 className="heading-2">ตี้ซ้อม</h1>
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
                onClick={() => updateParams(next => { if (level) next.delete('level'); else next.set('level', summary.level.id); })}
              >
                ตี้เลเวลของฉัน ({summary.level.label})
              </button>
            </div>
          )}
          
          {/* Persona: who is looking for a party */}
          <section className="event-persona-filter" aria-labelledby="event-persona-heading">
            <h2 id="event-persona-heading" className="event-persona-heading">คุณเป็นสายไหน?</h2>
            <div className="event-persona-options">
              {PARTY_PERSONAS.map(option => (
                <button
                  key={option.id}
                  type="button"
                  className={`onboarding-pill-button${persona === option.id ? ' selected' : ''}`}
                  aria-pressed={persona === option.id}
                  onClick={() => updateParams(next => { if (persona === option.id) next.delete('persona'); else next.set('persona', option.id); })}
                >
                  {option.label}
                  {option.id === suggestedPersona && <span className="event-persona-suggested">ตรงกับเป้าของคุณ</span>}
                </button>
              ))}
            </div>
            {selectedPersona && <p className="event-persona-hint">{selectedPersona.hint}</p>}
          </section>

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
                  <option value="Trail">วิ่งเทรล</option>
                  <option value="HYROX">HYROX</option>
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
          <div ref={listTopRef} className="event-results-summary" aria-live="polite">
            {!isLoading && (
              <p className="text-neutral-600">
                พบ {result.total} กิจกรรม{result.pageCount > 1 && ` · หน้า ${result.page} จาก ${result.pageCount}`}
              </p>
            )}
          </div>
          
          {/* Event Grid */}
          {isLoading ? (
            <div className="event-grid">
              {[1, 2, 3].map(i => (
                <div key={i} className="event-list-skeleton"></div>
              ))}
            </div>
          ) : result.events.length > 0 ? (
            <>
              <div className="event-grid">
                {result.events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
              <Pagination page={result.page} pageCount={result.pageCount} onChange={goToPage} label="หน้าของรายการตี้ซ้อม" />
            </>
          ) : (
            <div className="event-list-empty">
              <p className="text-neutral-500 text-lg mb-1">ไม่พบกิจกรรมที่ค้นหา</p>
              <button onClick={handleClear} className="btn btn-primary btn-md">ดูทั้งหมด</button>
            </div>
          )}
        </div>
    </PageShell>
  );
}
