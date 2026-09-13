import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, AlertTriangle } from 'lucide-react';
import Header from '../components/Header';
import ConversationList from '../components/messages/ConversationList';
import ChatHeader from '../components/messages/ChatHeader';
import MessageList from '../components/messages/MessageList';
import MessageComposer from '../components/messages/MessageComposer';
import { useAuth } from '../context/AuthContext';
import { getMyGroups, getGroupById, getGroupMembers, markAsRead } from '../services/groupRepository';
import { getMessages, getNewMessages, sendMessage } from '../services/messageRepository';

export default function Messages() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- Conversation list state ---
  const [groups, setGroups] = useState([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);

  // --- Active chat state ---
  const [activeGroup, setActiveGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [chatError, setChatError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);

  // --- Composer state ---
  const draftsRef = useRef({});
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);

  // --- Polling ---
  const pollRef = useRef(null);
  const lastMessageIdRef = useRef(null);

  // Load conversation list
  const loadGroups = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoadingGroups(true);
      const data = await getMyGroups(user);
      setGroups(data);
    } catch (err) {
      console.error('Failed to load groups', err);
    } finally {
      setIsLoadingGroups(false);
    }
  }, [user]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Load active chat when groupId changes
  useEffect(() => {
    if (!groupId || !user) {
      setActiveGroup(null);
      setMessages([]);
      setAccessDenied(false);
      setChatError('');
      return;
    }

    let cancelled = false;

    const loadChat = async () => {
      setIsLoadingMessages(true);
      setChatError('');
      setAccessDenied(false);
      setNewMessageCount(0);

      // Save current draft before switching
      if (activeGroup) {
        draftsRef.current[activeGroup.id] = draft;
      }

      try {
        const [groupData, membersData, messagesData] = await Promise.all([
          getGroupById(groupId, user),
          getGroupMembers(groupId, user),
          getMessages(groupId, user)
        ]);

        if (cancelled) return;

        setActiveGroup(groupData);
        setMembers(membersData);
        setMessages(messagesData.messages);
        setHasMoreMessages(messagesData.hasMore);

        // Restore draft for this group
        setDraft(draftsRef.current[groupId] || '');

        // Track last message ID for polling
        if (messagesData.messages.length > 0) {
          const lastMsg = messagesData.messages[messagesData.messages.length - 1];
          lastMessageIdRef.current = lastMsg.id;

          // Mark as read
          await markAsRead(groupId, user, lastMsg.id);
          loadGroups(); // Refresh unread counts
        }
      } catch (err) {
        if (cancelled) return;
        if (err.message === 'Access denied' || err.message === 'Group not found') {
          setAccessDenied(true);
        } else {
          setChatError(err.message || 'โหลดข้อความไม่สำเร็จ');
        }
      } finally {
        if (!cancelled) setIsLoadingMessages(false);
      }
    };

    loadChat();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, user]);

  // Polling for new messages
  useEffect(() => {
    if (!groupId || !user || accessDenied) return;

    const poll = async () => {
      if (!lastMessageIdRef.current) return;

      try {
        const newMsgs = await getNewMessages(groupId, user, { after: lastMessageIdRef.current });
        if (newMsgs.length > 0) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const unique = newMsgs.filter(m => !existingIds.has(m.id));
            if (unique.length === 0) return prev;

            setNewMessageCount(c => c + unique.filter(m => m.senderId !== user.id).length);
            return [...prev, ...unique];
          });

          const lastNew = newMsgs[newMsgs.length - 1];
          lastMessageIdRef.current = lastNew.id;
        }
      } catch (err) {
        // Silently fail polling
      }
    };

    pollRef.current = setInterval(poll, 5000);
    return () => clearInterval(pollRef.current);
  }, [groupId, user, accessDenied]);

  // Mark as read when at bottom & tab is visible
  useEffect(() => {
    if (!groupId || !user || messages.length === 0) return;

    const handleVisibility = async () => {
      if (document.visibilityState === 'visible' && messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.id && lastMsg.id !== lastMessageIdRef.current) {
          lastMessageIdRef.current = lastMsg.id;
        }
        await markAsRead(groupId, user, lastMsg.id);
        loadGroups();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [groupId, user, messages, loadGroups]);

  // --- Handlers ---

  const handleSelectGroup = (id) => {
    // Save current draft
    if (activeGroup) {
      draftsRef.current[activeGroup.id] = draft;
    }
    navigate(`/messages/${id}`);
  };

  const handleBack = () => {
    if (activeGroup) {
      draftsRef.current[activeGroup.id] = draft;
    }
    navigate('/messages');
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || isSending || !user || !groupId) return;

    const requestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Optimistic: add message to list immediately
    const optimistic = {
      id: null,
      requestId,
      groupId,
      senderId: user.id,
      senderName: user.displayName || user.username,
      senderAvatarUrl: user.avatarUrl || null,
      text,
      createdAt: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, optimistic]);
    setDraft('');
    setIsSending(true);

    try {
      const confirmed = await sendMessage(groupId, user, text, requestId);

      setMessages(prev =>
        prev.map(m => m.requestId === requestId ? { ...confirmed, status: 'sent' } : m)
      );

      lastMessageIdRef.current = confirmed.id;
      await markAsRead(groupId, user, confirmed.id);
      loadGroups();
    } catch (err) {
      setMessages(prev =>
        prev.map(m => m.requestId === requestId ? { ...m, status: 'failed' } : m)
      );
      // Restore draft
      setDraft(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleRetry = async (failedMsg) => {
    setMessages(prev =>
      prev.map(m => m.requestId === failedMsg.requestId ? { ...m, status: 'sending' } : m)
    );
    setIsSending(true);

    try {
      const confirmed = await sendMessage(groupId, user, failedMsg.text, failedMsg.requestId);
      setMessages(prev =>
        prev.map(m => m.requestId === failedMsg.requestId ? { ...confirmed, status: 'sent' } : m)
      );
      lastMessageIdRef.current = confirmed.id;
      await markAsRead(groupId, user, confirmed.id);
      loadGroups();
    } catch (err) {
      setMessages(prev =>
        prev.map(m => m.requestId === failedMsg.requestId ? { ...m, status: 'failed' } : m)
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleLoadMore = async () => {
    if (!messages.length || !groupId || !user) return;

    const firstMsg = messages[0];
    try {
      const older = await getMessages(groupId, user, { before: firstMsg.id });
      setMessages(prev => [...older.messages, ...prev]);
      setHasMoreMessages(older.hasMore);
    } catch (err) {
      // Silently fail
    }
  };

  const handleScrollToBottom = async () => {
    setNewMessageCount(0);
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.id) {
        await markAsRead(groupId, user, lastMsg.id);
        loadGroups();
      }
    }
  };

  const handleErrorRetry = () => {
    if (groupId) {
      navigate(`/messages/${groupId}`);
    }
  };

  // --- Render ---

  const showChatOnMobile = !!groupId;

  return (
    <div className="msg-layout">
      <Header />

      <main className="msg-main">
        <div className={`msg-sidebar-wrapper ${showChatOnMobile ? 'msg-hide-mobile' : ''}`}>
          <ConversationList
            groups={groups}
            isLoading={isLoadingGroups}
            activeGroupId={groupId}
            onSelect={handleSelectGroup}
          />
        </div>

        <div className={`msg-chat-wrapper ${!showChatOnMobile ? 'msg-hide-mobile' : ''}`}>
          {accessDenied ? (
            <div className="msg-chat-placeholder">
              <AlertTriangle size={40} />
              <p>ไม่สามารถเข้าถึงกลุ่มนี้ได้</p>
              <button type="button" className="btn btn-secondary btn-md" onClick={handleBack}>
                กลับรายการแชท
              </button>
            </div>
          ) : !groupId ? (
            <div className="msg-chat-placeholder">
              <MessageSquare size={48} />
              <p>เลือกกลุ่มเพื่อเริ่มพูดคุย</p>
            </div>
          ) : activeGroup ? (
            <div className="msg-chat">
              <ChatHeader
                group={activeGroup}
                memberCount={members.length}
                onBack={handleBack}
              />
              <MessageList
                messages={messages}
                currentUserId={user?.id}
                isLoading={isLoadingMessages}
                hasMore={hasMoreMessages}
                onLoadMore={handleLoadMore}
                onRetry={handleRetry}
                newMessageCount={newMessageCount}
                onScrollToBottom={handleScrollToBottom}
                error={chatError}
                onErrorRetry={handleErrorRetry}
              />
              <MessageComposer
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onSend={handleSend}
                disabled={isSending}
              />
            </div>
          ) : isLoadingMessages ? (
            <div className="msg-chat-placeholder">
              <div className="msg-spinner" />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
