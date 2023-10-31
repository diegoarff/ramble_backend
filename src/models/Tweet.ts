import { Schema, model } from 'mongoose';
import { type ITweetDocument } from '../interfaces';

const TweetSchema = new Schema<ITweetDocument>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 280,
    },
    image: {
      type: String,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isReplyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Tweet',
      default: null,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default model<ITweetDocument>('Tweet', TweetSchema);
