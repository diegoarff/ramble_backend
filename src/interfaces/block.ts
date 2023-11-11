import type { Document, Types } from 'mongoose';

export interface IBlock {
  userId: Types.ObjectId;
  blockedUserId: Types.ObjectId;
}

export interface IBlockDocument extends IBlock, Document {}
