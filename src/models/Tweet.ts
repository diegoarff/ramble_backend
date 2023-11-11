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
      default: null,
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

// On tweet deleteone or delete many, delete all replies
TweetSchema.pre('deleteOne', { document: true }, async function () {
  await this.model('Tweet').deleteMany({ isReplyTo: this._id });
});

export default model<ITweetDocument>('Tweet', TweetSchema);
