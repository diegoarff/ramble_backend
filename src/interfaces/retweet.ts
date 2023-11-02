import { type Document, type ObjectId } from 'mongoose';

export interface IRetweet {
  userId: ObjectId;
  tweetId: ObjectId;
}

export interface IRetweetDocument extends IRetweet, Document {}
