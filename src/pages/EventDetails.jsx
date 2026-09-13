import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Activity, ArrowLeft, ExternalLink } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import LoginModal from '../components/LoginModal';
import CommentList from '../components/events/CommentList';
import CommentComposer from '../components/events/CommentComposer';
import { useAuth } from '../context/AuthContext';
import { getEventById, getJoinGroupUrl, isEventEnded } from '../services/eventRepository';
import { getCommentsByEventId, postComment } from '../services/commentRepository';

function formatEventDateFull(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(date);
}

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setIsLoading(true);
      setIsLoadingComments(true);
      setError('');
      
      try {
        const eventData = await getEventById(eventId);
        if (isMounted) setEvent(eventData);
        
        try {
          const commentsData = await getCommentsByEventId(eventId);
          if (isMounted) setComments(commentsData);
        } catch (commentErr) {
          console.error('Failed to fetch comments', commentErr);
        }
      } catch (err) {
        if (isMounted) setError('ไม่พบกิจกรรมที่คุณต้องการ หรือกิจกรรมนี้ถูกซ่อนไว้');
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsLoadingComments(false);
        }
      }
    };
    
    fetchData();
    
    return () => { isMounted = false; };
  }, [eventId]);

  const handleBack = () => {
    // Navigate back to preserve search params if we came from list
    navigate(-1);
  };

  const handleJoinGroup = async () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    
    setIsJoining(true);
    setJoinError('');
    
    try {
      const url = await getJoinGroupUrl(event.id, user);
      if (url) {
        // Open external group link
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      setJoinError('ไม่สามารถเข้าร่วมกลุ่มได้ กรุณาลองอีกครั้ง');
    } finally {
      setIsJoining(false);
    }
  };

  const handlePostComment = async (message, images = []) => {
    setIsSubmittingComment(true);
    try {
      const newComment = await postComment(event.id, user, message, images);
      setComments(current => [...current, newComment]);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="main-content event-detail-page flex items-center justify-center">
          <div className="border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin event-spinner"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="main-content event-detail-page">
          <div className="container max-w-3xl text-center py-20">
            <h2 className="heading-3 mb-4">{error}</h2>
            <button onClick={() => navigate('/events')} className="btn btn-primary btn-md mx-auto">
              ดูกิจกรรมทั้งหมด
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isEnded = isEventEnded(event);
  const isCancelled = event.status === 'cancelled';
  const isActive = !isEnded && !isCancelled;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="main-content event-detail-page">
        <div className="container event-detail-container">
          {/* Back Button */}
          <button 
            onClick={handleBack} 
            className="event-back-btn event-detail-back"
          >
            <ArrowLeft size={20} /> กลับหน้ากิจกรรม
          </button>
          
          <div className="event-detail-card">
            {/* Event Header Image */}
            <div className="event-detail-cover">
              <Activity size={64} aria-hidden="true" />
              {isCancelled && (
                <div className="event-detail-overlay event-overlay-bg">
                  <div className="event-overlay-badge-error">กิจกรรมนี้ถูกยกเลิกแล้ว</div>
                </div>
              )}
              {isEnded && !isCancelled && (
                <div className="event-detail-overlay event-overlay-bg">
                  <div className="event-overlay-badge-neutral">กิจกรรมจบลงแล้ว</div>
                </div>
              )}
            </div>
            
            {/* Event Info */}
            <div className="event-detail-body">
              <div className="event-detail-badges">
                <Badge variant="neutral">{event.type}</Badge>
                {isCancelled && <Badge variant="error">ยกเลิก</Badge>}
                {isEnded && !isCancelled && <Badge variant="neutral">จบแล้ว</Badge>}
              </div>
              
              <h1 className="heading-2 event-detail-title">{event.title}</h1>
              
              <div className="event-details-grid">
                <div className="event-detail-facts">
                  <div className="event-detail-fact">
                    <div className="event-detail-icon">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 className="event-detail-label">วันและเวลา</h3>
                      <p className="text-neutral-600">{formatEventDateFull(event.date)}</p>
                      {event.endDate && (
                        <p className="text-neutral-600 mt-1">ถึง {formatEventDateFull(event.endDate)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="event-detail-fact">
                    <div className="event-detail-icon">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="event-detail-label">สถานที่</h3>
                      <p className="text-neutral-600">{event.location}</p>
                    </div>
                  </div>
                </div>
                
                <div className="event-detail-organizer">
                  <h3 className="event-detail-label">ผู้จัดกิจกรรม</h3>
                  <div className="event-detail-organizer-person">
                    <Avatar src={event.organizer?.avatarUrl} size="medium" />
                    <span className="font-medium text-lg">{event.organizer?.name || 'ไม่ระบุชื่อ'}</span>
                  </div>
                </div>
              </div>
              
              <div className="event-detail-description">
                <h3 className="heading-4">รายละเอียด</h3>
                <p className="body-lg event-detail-copy">
                  {event.description}
                </p>
              </div>
              
              {/* Join Group Section */}
              <div className="event-detail-join">
                {!isActive ? (
                  <p className="text-neutral-500 font-medium">ไม่สามารถเข้าร่วมได้ (กิจกรรมจบหรือถูกยกเลิกแล้ว)</p>
                ) : !event.joinUrl ? (
                  <p className="text-neutral-500 font-medium bg-neutral-100 inline-block rounded-xl event-join-status">ยังไม่เปิดให้เข้าร่วมกลุ่ม</p>
                ) : (
                  <>
                    <button 
                      onClick={handleJoinGroup}
                      disabled={isJoining}
                      className="btn btn-primary btn-md event-join-btn"
                    >
                      {isJoining ? 'กำลังตรวจสอบ...' : (
                        <>Join Group <ExternalLink size={20} /></>
                      )}
                    </button>
                    {joinError && <p className="text-error mt-2 text-sm">{joinError}</p>}
                    {!user && <p className="text-neutral-500 text-sm mt-3">เข้าสู่ระบบเพื่อเข้าร่วมกลุ่มกิจกรรมนี้</p>}
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Comments Section */}
          <div className="event-detail-comments" id="comments">
            <h3 className="heading-4">ความคิดเห็น</h3>
            <p className="event-detail-helper">ทุกคนสามารถอ่านคอมเมนต์ที่เผยแพร่ได้ แต่ต้องเข้าสู่ระบบก่อนส่ง</p>
            
            {user ? (
              <CommentComposer 
                user={user} 
                onSubmit={handlePostComment} 
                isSubmitting={isSubmittingComment} 
              />
            ) : (
              <div className="event-comment-login">
                <p className="text-brand-800 font-medium">เข้าสู่ระบบเพื่อแสดงความคิดเห็น</p>
                <button 
                  onClick={() => setIsLoginModalOpen(true)} 
                  className="btn btn-primary btn-md"
                >
                  เข้าสู่ระบบ
                </button>
              </div>
            )}
            
            <CommentList comments={comments} isLoading={isLoadingComments} />
          </div>
        </div>
      </main>
      
      <Footer />
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        redirectOnComplete={`/events/${event.id}`}
      />
    </div>
  );
}
