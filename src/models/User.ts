import { Schema, model } from 'mongoose';
import { type IUserDocument } from '../interfaces';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Tweet from './Tweet';
import Like from './Like';
import Follow from './Follow';
import Block from './Block';

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        'https://firebasestorage.googleapis.com/v0/b/ramble-322a6.appspot.com/o/test%2F1698975678282.jpeg?alt=media&token=c9a7b759-be64-4a3e-aa5b-b932c7b7159f',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

UserSchema.pre<IUserDocument>('save', async function (next) {
  if (!this.isModified('password')) next();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);

  this.password = hashedPassword;
  next();
});

UserSchema.pre('deleteOne', { document: true }, async function (next) {
  const userId = this._id;

  await Promise.all([
    Tweet.deleteMany({ userId }),
    Like.deleteMany({ userId }),
    Follow.deleteMany({ userId }),
    Follow.deleteMany({ followeeId: userId }),
    Block.deleteMany({ userId }),
    Block.deleteMany({ blockedId: userId }),
  ]);

  next();
});

UserSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.createToken = function (): string {
  return jwt.sign(
    { id: this._id, username: this.username },
    (process.env.JWT_SECRET as string) || 'secret',
  );
};

export default model<IUserDocument>('User', UserSchema);
