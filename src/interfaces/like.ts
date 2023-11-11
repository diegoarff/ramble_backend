import type { Document, Types } from 'mongoose';

export interface ILike {
  userId: Types.ObjectId;
  tweetId: Types.ObjectId;
}

export interface ILikeDocument extends ILike, Document {}
