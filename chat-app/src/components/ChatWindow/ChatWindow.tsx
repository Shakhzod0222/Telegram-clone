import React, { useRef, useState, useEffect, useMemo } from 'react';
import styles from './ChatWindow.module.css';
import { useChatContext } from '../../context/useChatContext.ts';
import { useChats } from '../../hooks/useChats.ts';
import { useMessages } from '../../hooks/useMessages.ts';
import { useVirtualList } from '../../hooks/useVirtualList.ts';
import { useTypingIndicator } from '../../hooks/useTypingIndicator.ts';
import { ChatHeader } from '../ChatHeader/ChatHeader.tsx';
import { PinnedBar } from '../PinnedBar/PinnedBar.tsx';
import { MessageBubble } from '../MessageBubble/MessageBubble.tsx';
import { MessageInput } from '../MessageInput/MessageInput.tsx';
import type { Message } from '../../types/index.ts';

export const ChatWindow: React.FC = () => {
  const { state, dispatch } = useChatContext();
  const { activeChat, selectChat, deleteChat, muteChat } = useChats();
  const {
    messages,
    pinnedMessage,
    replyingToMessage,
    setReplyingTo,
    sendMessage,
    unpinMessage,
    addReaction,
  } = useMessages(state.activeChatId);

  const { sendTyping } = useTypingIndicator(state.activeChatId);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [inChatSearch, setInChatSearch] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const lastMessageCountRef = useRef(messages.length);

  // Filter messages if search inside chat is active
  const filteredMessages = useMemo(() => {
    if (!chatSearchQuery.trim()) return messages;
    const q = chatSearchQuery.toLowerCase();
    return messages.filter((m) => m.text.toLowerCase().includes(q));
  }, [messages, chatSearchQuery]);

  // Virtual scrolling hook
  const {
    virtualItems,
    totalHeight,
    measureElement,
    scrollToIndex,
    scrollToBottom,
    isNearBottom,
  } = useVirtualList({
    itemsCount: filteredMessages.length,
    estimateSize: 64,
    overscan: 10,
    containerRef: messagesContainerRef,
  });

  // Auto-scroll to bottom on new message if user is already near bottom or outgoing
  useEffect(() => {
    if (filteredMessages.length > lastMessageCountRef.current) {
      const lastMsg = filteredMessages[filteredMessages.length - 1];
      if (lastMsg?.isOutgoing || isNearBottom) {
        setTimeout(() => scrollToBottom('smooth'), 50);
      }
    }
    lastMessageCountRef.current = filteredMessages.length;
  }, [filteredMessages, isNearBottom, scrollToBottom]);

  // Initial scroll to bottom when switching chats
  useEffect(() => {
    if (state.activeChatId) {
      setTimeout(() => scrollToBottom('instant'), 20);
    }
  }, [state.activeChatId, scrollToBottom]);

  // Scroll to pinned message
  const handleScrollToPinned = () => {
    if (!pinnedMessage) return;
    const idx = filteredMessages.findIndex((m) => m.id === pinnedMessage.id);
    if (idx !== -1) {
      scrollToIndex(idx, 'smooth');
    }
  };

  const handleMessageContextMenu = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();
    dispatch({
      type: 'OPEN_CONTEXT_MENU',
      payload: {
        x: e.clientX,
        y: e.clientY,
        type: 'message',
        targetId: message.id,
        message,
      },
    });
  };

  if (!activeChat) {
    return (
      <main className={styles.emptyWindow} aria-label="Suhbat tanlanmagan">
        <div className={styles.emptyBadge}>
          Xabarlarni ko'rish uchun suhbatni tanlang
        </div>
      </main>
    );
  }

  // Last message for aria-live announcements
  const latestIncoming = messages.filter((m) => !m.isOutgoing).slice(-1)[0];

  return (
    <main className={styles.chatWindow} aria-label={`${activeChat.title} suhbat oynasi`}>
      {/* Hidden aria-live region for accessibility announcement of incoming messages */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {latestIncoming ? `${latestIncoming.senderName}: ${latestIncoming.text}` : ''}
      </div>

      {/* Chat Header */}
      <ChatHeader
        chat={activeChat}
        onBack={() => selectChat(null)}
        onSearchClick={() => setInChatSearch((prev) => !prev)}
        onDeleteChat={() => deleteChat(activeChat.id)}
        onMuteToggle={() => muteChat(activeChat.id, !activeChat.isMuted)}
      />

      {/* In-chat search bar */}
      {inChatSearch && (
        <div className={styles.searchBar}>
          <input
            type="text"
            className={styles.searchBarInput}
            placeholder="Ushbu chat ichidan qidiruv..."
            value={chatSearchQuery}
            onChange={(e) => setChatSearchQuery(e.target.value)}
            autoFocus
          />
          <button
            onClick={() => {
              setInChatSearch(false);
              setChatSearchQuery('');
            }}
            aria-label="Qidiruvni yopish"
          >
            ✕
          </button>
        </div>
      )}

      {/* Pinned Message Bar */}
      {pinnedMessage && (
        <PinnedBar
          pinnedMessage={pinnedMessage}
          onClick={handleScrollToPinned}
          onUnpin={unpinMessage}
        />
      )}

      {/* Virtual Scroll Message List */}
      <div
        ref={messagesContainerRef}
        className={styles.messagesContainer}
        role="log"
        aria-label="Xabarlar tarixi"
      >
        <div
          className={styles.virtualScrollArea}
          style={{ height: `${totalHeight}px` }}
        >
          {virtualItems.map((virtualItem) => {
            const message = filteredMessages[virtualItem.index];
            if (!message) return null;

            return (
              <div
                key={message.id}
                ref={(node) => measureElement(virtualItem.index, node)}
                className={styles.virtualRow}
                style={{
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <MessageBubble
                  message={message}
                  chatType={activeChat.type}
                  currentUserId={state.profile.id}
                  onContextMenu={handleMessageContextMenu}
                  onReactionClick={(emoji) => addReaction(message.id, emoji)}
                  onReplyClick={(replyId) => {
                    const idx = filteredMessages.findIndex((m) => m.id === replyId);
                    if (idx !== -1) scrollToIndex(idx, 'smooth');
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll to bottom button */}
      {!isNearBottom && (
        <button
          className={styles.scrollToBottomBtn}
          onClick={() => scrollToBottom('smooth')}
          aria-label="Eng pastki xabarlarga o'tish"
          title="Pastga tushish"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </button>
      )}

      {/* Message Input Bottom Panel */}
      <MessageInput
        onSendMessage={sendMessage}
        replyingToMessage={replyingToMessage}
        onCancelReply={() => setReplyingTo(null)}
        onTyping={sendTyping}
        disabled={activeChat.type === 'channel'}
      />
    </main>
  );
};
