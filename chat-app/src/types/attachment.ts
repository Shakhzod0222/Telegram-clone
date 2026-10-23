export type AttachmentType = 'image' | 'video' | 'audio' | 'document' | 'voice';

export interface Attachment {
  id: string;
  type: AttachmentType;
  url: string;
  fileName: string;
  fileSize: number; // in bytes
  mimeType?: string;
  thumbnailUrl?: string;
  duration?: number; // for audio/voice in seconds
  width?: number;
  height?: number;
}
