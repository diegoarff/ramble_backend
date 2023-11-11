import { Schema, model } from 'mongoose';
import { type IBlockDocument } from '../interfaces';

const BlockSchema = new Schema<IBlockDocument>(
  {
    blockedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default model<IBlockDocument>('Block', BlockSchema);
