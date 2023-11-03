import type { Document, Types } from 'mongoose';

export interface IRetweet {
  userId: Types.ObjectId;
  tweetId: Types.ObjectId;
}

export interface IRetweetDocument extends IRetweet, Document {}
