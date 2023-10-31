import { Schema, model } from 'mongoose';
import { type IFollowDocument } from '../interfaces';

const FollowSchema = new Schema<IFollowDocument>(
  {
    followingId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    followerId: {
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
