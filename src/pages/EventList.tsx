import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageShell from '../components/common/PageShell';
import EventCard from '../components/events/EventCard';
import Pagination from '../components/common/Pagination';
import { getEvents, type EventPage } from '../services/eventRepository';
import { findPersona, personaForGoal } from '../utils/partyPersonas';
import EventFilters, { ActiveFilters, SPORT_TYPES } from '../components/events/EventFilters';
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react';
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
  
  const filters = { type, area, level, persona };
  const [formQuery, setFormQuery] = useState(query);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    // Sync the search box with the URL on load/popstate
    setFormQuery(query);
    
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

  // The mobile filter sheet covers the page: lock scrolling behind it and close on Escape.
  useEffect(() => {
    if (!filtersOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setFiltersOpen(false); };
    document.addEventListener('keydown', close);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', close); document.body.style.overflow = ''; };
  }, [filtersOpen]);

  // Any filter change starts again from page 1.
  const updateParams = (change: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams);
    change(next);
    next.delete('page');
    setSearchParams(next);
  };
  // Tapping the selected option again turns that filter off.
  const toggleFilter = (key: string, value: string) => updateParams(next => {
    if (next.get(key) === value) next.delete(key); else next.set(key, value);
  });

  const goToPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    if (nextPage > 1) next.set('page', String(nextPage)); else next.delete('page');
    setSearchParams(next);
    listTopRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateParams(next => { if (formQuery.trim()) next.set('q', formQuery.trim()); else next.delete('q'); });
  };

  const handleClear = () => {
    setFormQuery('');
    setSearchParams(new URLSearchParams());
  };

  const active = [
    query && { key: 'q', label: `“${query}”` },
    level && summary && { key: 'level', label: `เลเวล ${summary.level.label}` },
    selectedPersona && { key: 'persona', label: selectedPersona.label },
    type && { key: 'type', label: SPORT_TYPES.find(sport => sport.value === type)?.label ?? type },
    area && { key: 'area', label: area },
  ].filter(Boolean) as { key: string; label: string }[];
  const filterCount = [level, persona, type, area].filter(Boolean).length;

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

          <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
            {/* Filters: a sidebar on desktop, a bottom sheet on mobile */}
            <aside aria-label="ตัวกรอง" onClick={event => { if (event.target === event.currentTarget) setFiltersOpen(false); }}
              className={filtersOpen
                ? 'max-lg:fixed max-lg:inset-0 max-lg:z-50 max-lg:flex max-lg:flex-col max-lg:justify-end max-lg:bg-black/50 lg:sticky lg:top-24'
                : 'max-lg:hidden lg:sticky lg:top-24'}>
              <div className="flex flex-col bg-white max-lg:max-h-[85dvh] max-lg:rounded-t-2xl lg:rounded-lg lg:border lg:border-neutral-200">
                <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3 lg:hidden">
                  <h2 className="text-lg font-bold">ตัวกรอง</h2>
                  <button type="button" onClick={() => setFiltersOpen(false)} aria-label="ปิดตัวกรอง"
                    className="grid size-11 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-neutral-700 hover:bg-neutral-100">
                    <X size={22} aria-hidden="true" />
                  </button>
                </div>
                <div className="overflow-y-auto p-5">
                  <EventFilters values={filters} onToggle={toggleFilter} myLevel={user && summary ? summary.level : null} suggestedPersona={suggestedPersona} />
                </div>
                <div className="flex gap-3 border-t border-neutral-200 px-5 py-3 lg:hidden">
                  <button type="button" onClick={handleClear} className="btn btn-secondary btn-md flex-1">ล้างทั้งหมด</button>
                  <button type="button" onClick={() => setFiltersOpen(false)} className="btn btn-primary btn-md flex-[2]">
                    {isLoading ? 'ดูผลลัพธ์' : `ดู ${result.total} กิจกรรม`}
                  </button>
                </div>
              </div>
            </aside>

            <div className="grid min-w-0 gap-5">
              {/* Search, and the filter button on mobile */}
              <div className="flex gap-3">
                <form onSubmit={handleSearch} role="search" className="relative min-w-0 flex-1">
                  <label htmlFor="event-query" className="sr-only">ค้นหากิจกรรม</label>
                  <Search size={20} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    id="event-query" className="form-control pl-12"
                    placeholder="ค้นหาชื่อตี้, สถานที่..."
                    value={formQuery}
                    onChange={e => setFormQuery(e.target.value)}
                    enterKeyHint="search"
                  />
                </form>
                <button type="button" onClick={() => setFiltersOpen(true)} aria-label={`ตัวกรอง${filterCount ? ` (${filterCount})` : ''}`}
                  className="btn btn-secondary btn-md relative min-h-12 shrink-0 gap-2 lg:hidden">
                  <SlidersHorizontal size={18} aria-hidden="true" /> ตัวกรอง
                  {filterCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-brand-500 text-xs text-white">{filterCount}</span>}
                </button>
              </div>

              <ActiveFilters items={active} onClear={handleClear}
                onRemove={key => { if (key === 'q') setFormQuery(''); updateParams(next => next.delete(key)); }} />

              {/* Results Summary */}
              <div ref={listTopRef} className="event-results-summary scroll-mt-24" aria-live="polite">
                {!isLoading && (
                  <p className="text-neutral-600">
                    พบ {result.total} กิจกรรม{result.pageCount > 1 && ` · หน้า ${result.page} จาก ${result.pageCount}`}
                  </p>
                )}
              </div>

              {/* Event Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="event-list-skeleton"></div>
                  ))}
                </div>
              ) : result.events.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
          </div>
        </div>
    </PageShell>
  );
}
