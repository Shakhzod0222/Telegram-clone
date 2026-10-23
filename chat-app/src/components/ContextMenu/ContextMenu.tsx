import React, { useEffect, useRef } from 'react';
import styles from './ContextMenu.module.css';
import { useChatContext } from '../../context/useChatContext.ts';
import { useMessages } from '../../hooks/useMessages.ts';
import { useChats } from '../../hooks/useChats.ts';

const QUICK_REACTIONS = ['👍', '❤️', '🔥', '🚀', '😂', '🎉'];

export const ContextMenu: React.FC = () => {
  const { state, dispatch } = useChatContext();
  const { contextMenu } = state;
  const menuRef = useRef<HTMLDivElement>(null);

  const { deleteMessage, pinMessage, unpinMessage, addReaction, setReplyingTo } =
    useMessages(state.activeChatId);

  const { pinChat, muteChat, markChatRead, deleteChat } = useChats();

  useEffect(() => {
    if (!contextMenu) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch({ type: 'CLOSE_CONTEXT_MENU' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [contextMenu, dispatch]);

  if (!contextMenu) return null;

  // Adjust coordinates if menu overflows window
  const menuWidth = 200;
  const menuHeight = contextMenu.type === 'message' ? 240 : 180;
  const x = Math.min(contextMenu.x, window.innerWidth - menuWidth - 10);
  const y = Math.min(contextMenu.y, window.innerHeight - menuHeight - 10);

  const handleClose = () => {
    dispatch({ type: 'CLOSE_CONTEXT_MENU' });
  };

  return (
    <>
      <div className={styles.overlay} onClick={handleClose} onContextMenu={(e) => { e.preventDefault(); handleClose(); }} />

      <div
        ref={menuRef}
        className={styles.menu}
        style={{ left: `${x}px`, top: `${y}px` }}
        role="menu"
      >
        {contextMenu.type === 'message' && contextMenu.message && (
          <>
            {/* Quick reaction emojis */}
            <div className={styles.reactionRow}>
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  className={styles.reactionBtn}
                  onClick={() => {
                    addReaction(contextMenu.message!.id, emoji);
                    handleClose();
                  }}
                  type="button"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <button
              className={styles.item}
              role="menuitem"
              onClick={() => {
                setReplyingTo(contextMenu.message!);
                handleClose();
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
              </svg>
              Javob berish
            </button>

            <button
              className={styles.item}
              role="menuitem"
              onClick={() => {
                if (contextMenu.message?.text) {
                  navigator.clipboard.writeText(contextMenu.message.text);
                }
                handleClose();
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
              </svg>
              Nusxalash
            </button>

            <button
              className={styles.item}
              role="menuitem"
              onClick={() => {
                if (contextMenu.message?.isPinned) {
                  unpinMessage();
                } else {
                  pinMessage(contextMenu.message!.id);
                }
                handleClose();
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
              </svg>
              {contextMenu.message.isPinned ? 'Qadashdan chiqarish' : 'Qadash'}
            </button>

            <button
              className={`${styles.item} ${styles.danger}`}
              role="menuitem"
              onClick={() => {
                deleteMessage(contextMenu.message!.id);
                handleClose();
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
              O'chirish
            </button>
          </>
        )}

        {contextMenu.type === 'chat' && contextMenu.chat && (
          <>
            <button
              className={styles.item}
              role="menuitem"
              onClick={() => {
                pinChat(contextMenu.chat!.id, !contextMenu.chat!.isPinned);
                handleClose();
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
              </svg>
              {contextMenu.chat.isPinned ? 'Qadashdan chiqarish' : 'Qadash'}
            </button>

            <button
              className={styles.item}
              role="menuitem"
              onClick={() => {
                markChatRead(contextMenu.chat!.id);
                handleClose();
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17l-4.24-4.24-1.41 1.41 5.66 5.66L23.66 7l-1.42-1.41z" />
              </svg>
              O'qilgan deb belgilash
            </button>

            <button
              className={styles.item}
              role="menuitem"
              onClick={() => {
                muteChat(contextMenu.chat!.id, !contextMenu.chat!.isMuted);
                handleClose();
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71z" />
              </svg>
              {contextMenu.chat.isMuted ? 'Ovozni yoqish' : 'Ovozsiz qilish'}
            </button>

            <button
              className={`${styles.item} ${styles.danger}`}
              role="menuitem"
              onClick={() => {
                deleteChat(contextMenu.chat!.id);
                handleClose();
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
              Chatni o'chirish
            </button>
          </>
        )}
      </div>
    </>
  );
};
