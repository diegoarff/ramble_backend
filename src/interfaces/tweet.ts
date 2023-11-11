import type { Document, Types } from 'mongoose';

export interface ITweet {
  content: string;
  image?: string;
  userId: Types.ObjectId;
  isReplyTo?: string | null;
  isEdited: boolean;
}

export interface ITweetDocument extends ITweet, Document {}
