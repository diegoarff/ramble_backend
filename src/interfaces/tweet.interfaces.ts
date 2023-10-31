import { type Document, type ObjectId } from 'mongoose';

export interface ITweet {
  content: string;
  image?: string | null;
  userId: ObjectId;
  isReplyTo?: string | null;
  isEdited: boolean;
}

export interface ITweetDocument extends ITweet, Document {}
