import { Schema, model } from 'mongoose';
import { type IFollowDocument } from '../interfaces';

const FollowSchema = new Schema<IFollowDocument>(
  {
    followingId: {
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

export default model<IFollowDocument>('Follow', FollowSchema);
