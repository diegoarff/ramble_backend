import { type Document, type ObjectId } from 'mongoose';

export interface ILike {
  userId: ObjectId;
  tweetId: ObjectId;
}

export interface ILikeDocument extends ILike, Document {}
