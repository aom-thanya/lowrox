import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function FloatingChatButton() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  if (!user || pathname === '/onboarding' || pathname === '/messages' || pathname.startsWith('/messages/')) return null;

  return (
    <Link to="/messages" className="floating-chat-button" aria-label="เปิดแชท" title="เปิดแชท">
      <MessageCircle size={24} aria-hidden="true" />
      <span>แชท</span>
    </Link>
  );
}
