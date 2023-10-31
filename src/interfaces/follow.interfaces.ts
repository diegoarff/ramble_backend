import { type Document, type ObjectId } from 'mongoose';

export interface IFollow {
  followingId: ObjectId;
  followerId: ObjectId;
}

export interface IFollowDocument extends IFollow, Document {}
