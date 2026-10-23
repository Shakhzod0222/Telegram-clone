import React from 'react';
import styles from './MessageBubble.module.css';
import type { Message, ChatType } from '../../types/index.ts';
import { Avatar } from '../Avatar/Avatar.tsx';
import { getMemberColor } from '../../utils/colors.ts';
import { formatMessageTime, formatFileSize } from '../../utils/formatters.ts';
import { renderSafeMessageText } from '../../utils/textParser.tsx';

interface MessageBubbleProps {
  message: Message;
  chatType: ChatType;
  currentUserId: string;
  onContextMenu: (e: React.MouseEvent, message: Message) => void;
  onReactionClick: (emoji: string) => void;
  onReplyClick?: (replyMessageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  chatType,
  currentUserId,
  onContextMenu,
  onReactionClick,
  onReplyClick,
}) => {
  const isOutgoing = message.isOutgoing;
  const isGroup = chatType === 'group';
  const showSenderInfo = isGroup && !isOutgoing;
  const senderColor = getMemberColor(message.senderName, message.senderColorIndex);

  return (
    <div
      className={`${styles.row} ${isOutgoing ? styles.outgoingRow : styles.incomingRow}`}
      onContextMenu={(e) => onContextMenu(e, message)}
    >
      {/* Small avatar for incoming messages in group chats */}
      {showSenderInfo && (
        <div className={styles.senderAvatar}>
          <Avatar
            name={message.senderName}
            avatarUrl={message.senderAvatar}
            colorIndex={message.senderColorIndex}
            size="sm"
            showOnline={false}
          />
        </div>
      )}

      <div
        className={`${styles.bubble} ${isOutgoing ? styles.outgoingBubble : styles.incomingBubble}`}
      >
        {/* Group sender name in distinct member color */}
        {showSenderInfo && (
          <div className={styles.senderName} style={{ color: senderColor }}>
            {message.senderName}
          </div>
        )}

        {/* Reply preview if replying to another message */}
        {message.replyTo && (
          <div
            className={styles.replyContainer}
            onClick={() => onReplyClick?.(message.replyTo!.messageId)}
            role="button"
            tabIndex={0}
            title="Asl xabarga o'tish"
          >
            <div>
              <div className={styles.replySender}>{message.replyTo.senderName}</div>
              <div className={styles.replySnippet}>{message.replyTo.textSnippet}</div>
            </div>
          </div>
        )}

        {/* Attachments rendering */}
        {message.attachments?.map((att) => (
          <div key={att.id}>
            {att.type === 'image' ? (
              <img
                src={att.url}
                alt={att.fileName}
                className={styles.attachmentImage}
                loading="lazy"
              />
            ) : (
              <div className={styles.attachmentDoc}>
                <div className={styles.docIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                  </svg>
                </div>
                <div className={styles.docDetails}>
                  <span className={styles.docName}>{att.fileName}</span>
                  <span className={styles.docSize}>{formatFileSize(att.fileSize)}</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* XSS-safe text rendering with auto linkification */}
        <span className={styles.messageContent}>
          {renderSafeMessageText(message.text)}
        </span>

        {/* Timestamp and message status */}
        <span className={styles.meta}>
          {message.isEdited && <span>tahrirlangan </span>}
          <span>{formatMessageTime(message.timestamp)}</span>

          {isOutgoing && (
            <span className={styles.ticks} title={message.status}>
              {message.status === 'sending' && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="9" />
                  <polyline points="12 7 12 12 15 15" />
                </svg>
              )}

              {message.status === 'sent' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}

              {(message.status === 'delivered' || message.status === 'read') && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17l-4.24-4.24-1.41 1.41 5.66 5.66L23.66 7l-1.42-1.41zM.41 13.41L6.07 19.07l1.41-1.41L1.83 12 .41 13.41z" />
                </svg>
              )}
            </span>
          )}
        </span>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={styles.reactionsContainer}>
            {message.reactions.map((r) => {
              const hasReacted = r.users.includes(currentUserId);
              return (
                <button
                  key={r.emoji}
                  className={`${styles.reactionPill} ${hasReacted ? styles.reactionPillActive : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReactionClick(r.emoji);
                  }}
                  aria-label={`${r.emoji} reaksiyasi (${r.count})`}
                >
                  <span>{r.emoji}</span>
                  <span>{r.count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
