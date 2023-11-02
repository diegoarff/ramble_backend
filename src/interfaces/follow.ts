import { type Document, type ObjectId } from 'mongoose';

export interface IFollow {
  followingId: ObjectId;
  userId: ObjectId;
}

export interface IFollowDocument extends IFollow, Document {}
