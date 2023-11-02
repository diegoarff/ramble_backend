import { type Document, type ObjectId } from 'mongoose';

export interface IBlock {
  userId: ObjectId;
  blockedUserId: ObjectId;
}

export interface IBlockDocument extends IBlock, Document {}
