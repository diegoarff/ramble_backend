import { Schema, model } from 'mongoose';
import { type IRetweetDocument } from '../interfaces';

const RetweetSchema = new Schema<IRetweetDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tweetId: {
      type: Schema.Types.ObjectId,
      ref: 'Tweet',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default model<IRetweetDocument>('Retweet', RetweetSchema);
