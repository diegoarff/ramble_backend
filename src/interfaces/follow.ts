import type { Document, Types } from 'mongoose';

export interface IFollow {
  followingId: Types.ObjectId;
  userId: Types.ObjectId;
}

export interface IFollowDocument extends IFollow, Document {}
