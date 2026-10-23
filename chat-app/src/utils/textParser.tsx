import React from 'react';

// URL regex matching http, https, and www. links
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

/**
 * Safely parse plain text into React nodes with automatic clickable links.
 * Strictly prevents XSS by never using innerHTML or dangerouslySetInnerHTML.
 */
export function renderSafeMessageText(text: string): React.ReactNode {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex state
  URL_REGEX.lastIndex = 0;

  while ((match = URL_REGEX.exec(text)) !== null) {
    const matchIndex = match.index;
    const matchedUrl = match[0];

    // Push plain text prior to URL
    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex));
    }

    const href = matchedUrl.startsWith('http://') || matchedUrl.startsWith('https://')
      ? matchedUrl
      : `https://${matchedUrl}`;

    parts.push(
      <a
        key={`link-${matchIndex}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="message-link"
        onClick={(e) => e.stopPropagation()}
      >
        {matchedUrl}
      </a>
    );

    lastIndex = matchIndex + matchedUrl.length;
  }

  // Push remaining plain text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
