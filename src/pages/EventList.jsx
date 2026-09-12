import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EventCard from '../components/events/EventCard';
import { getEvents } from '../services/eventRepository';
import { Search } from 'lucide-react';

export default function EventList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Extract search params
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';
  const area = searchParams.get('area') || '';
  
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
        const data = await getEvents({ query, type, area });
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
  }, [query, type, area]);

  const handleSearch = (e) => {
    e.preventDefault();
    
    const newParams = new URLSearchParams();
    if (formQuery) newParams.set('q', formQuery);
    if (formType) newParams.set('type', formType);
    if (formArea) newParams.set('area', formArea);
    
    setSearchParams(newParams);
  };

  const handleClear = () => {
    setFormQuery('');
    setFormType('');
    setFormArea('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="main-content flex-grow pt-24 pb-16 bg-neutral-50">
        <div className="container">
          <div className="mb-8">
            <h1 className="heading-2 mb-2">กิจกรรม</h1>
            <p className="body-lg text-neutral-600">หากิจกรรมที่สนใจ แล้วไปออกกำลังกายด้วยกัน</p>
          </div>
          
          {/* Filters */}
          <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-neutral-700 mb-1">ค้นหากิจกรรม</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    className="w-full bg-neutral-100 border-none rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-brand-500"
                    placeholder="ชื่อกิจกรรม, สถานที่..."
                    value={formQuery}
                    onChange={e => setFormQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="w-full md:w-1/4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">ประเภทกีฬา</label>
                <select 
                  className="w-full bg-neutral-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500"
                  value={formType}
                  onChange={e => setFormType(e.target.value)}
                >
                  <option value="">ทั้งหมด</option>
                  <option value="Running">วิ่ง</option>
                  <option value="Cycling">ปั่นจักรยาน</option>
                  <option value="Badminton">แบดมินตัน</option>
                </select>
              </div>
              
              <div className="w-full md:w-1/4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">พื้นที่</label>
                <input
                  type="text"
                  className="w-full bg-neutral-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500"
                  placeholder="เช่น กรุงเทพ..."
                  value={formArea}
                  onChange={e => setFormArea(e.target.value)}
                />
              </div>
              
              <div className="w-full md:w-auto flex gap-2">
                <button type="submit" className="btn btn-primary btn-md flex-grow md:flex-grow-0">
                  ค้นหา
                </button>
                <button type="button" onClick={handleClear} className="btn btn-secondary btn-md flex-grow md:flex-grow-0">
                  ล้างตัวกรอง
                </button>
              </div>
            </form>
          </div>
          
          {/* Results Summary */}
          <div className="mb-6">
            {!isLoading && (
              <p className="text-neutral-600">พบ {events.length} กิจกรรม</p>
            )}
          </div>
          
          {/* Event Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[400px] bg-white rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <p className="text-neutral-500 text-lg mb-4">ไม่พบกิจกรรมที่ค้นหา</p>
              <button onClick={handleClear} className="btn btn-primary btn-md">ดูทั้งหมด</button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
