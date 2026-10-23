import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './MessageInput.module.css';
import type { Attachment, Message } from '../../types/index.ts';
import { EmojiPicker } from '../EmojiPicker/EmojiPicker.tsx';

interface MessageInputProps {
  onSendMessage: (text: string, attachments?: Attachment[]) => void;
  replyingToMessage: Message | null;
  onCancelReply: () => void;
  onTyping: () => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  replyingToMessage,
  onCancelReply,
  onTyping,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [text, adjustHeight]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTyping();
  };

  const handleSend = () => {
    if (!text.trim() && attachments.length === 0) return;

    onSendMessage(text, attachments.length > 0 ? attachments : undefined);
    setText('');
    setAttachments([]);
    setShowEmojiPicker(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle file attachment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isImg = file.type.startsWith('image/');
    const reader = new FileReader();

    reader.onload = () => {
      const resultUrl = reader.result as string;
      const newAtt: Attachment = {
        id: `att_${Date.now()}`,
        type: isImg ? 'image' : 'document',
        url: resultUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      };
      setAttachments((prev) => [...prev, newAtt]);
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSelectEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const hasContent = text.trim().length > 0 || attachments.length > 0;

  return (
    <div className={styles.container} role="region" aria-label="Xabar yozish maydoni">
      {/* Reply bar if user is replying */}
      {replyingToMessage && (
        <div className={styles.replyBar}>
          <div className={styles.replyContent}>
            <span className={styles.replyTitle}>Javob berilmoqda: {replyingToMessage.senderName}</span>
            <span className={styles.replySnippet}>{replyingToMessage.text}</span>
          </div>
          <button
            className={styles.closeReplyBtn}
            onClick={onCancelReply}
            aria-label="Javobni bekor qilish"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Attachment preview */}
      {attachments.map((att) => (
        <div key={att.id} className={styles.attachmentPreview}>
          {att.type === 'image' ? (
            <img src={att.url} alt={att.fileName} className={styles.previewImage} />
          ) : (
            <span>📄 {att.fileName}</span>
          )}
          <button
            className={styles.closeReplyBtn}
            onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
            aria-label="Faylni olib tashlash"
          >
            ✕
          </button>
        </div>
      ))}

      <div className={styles.inputRow}>
        {/* Attachment button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.zip,.txt"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Fayl yoki rasm biriktirish"
          title="Fayl biriktirish"
          disabled={disabled}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        {/* Text Input area */}
        <div className={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            rows={1}
            placeholder="Xabar yozing..."
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-label="Xabar matni"
          />
        </div>

        {/* Emoji picker button */}
        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          aria-label="Emoji tanlash"
          aria-expanded={showEmojiPicker}
          title="Emoji"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
            <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
          </svg>
        </button>

        {/* Send Button / Voice Note button */}
        <button
          type="button"
          className={styles.sendBtn}
          onClick={handleSend}
          aria-label={hasContent ? "Xabarni yuborish" : "Ovozli xabar"}
          title={hasContent ? "Yuborish (Enter)" : "Ovozli xabar"}
          disabled={disabled}
        >
          {hasContent ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>
      </div>

      {/* Floating Emoji Picker Popover */}
      <EmojiPicker
        isOpen={showEmojiPicker}
        onSelectEmoji={handleSelectEmoji}
        onClose={() => setShowEmojiPicker(false)}
      />
    </div>
  );
};
