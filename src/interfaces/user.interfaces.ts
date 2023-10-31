import { type Document } from 'mongoose';

export interface IUser {
  name: string;
  username: string;
  email: string;
  password: string;
  bio: string;
  avatar: string;
}

export interface IUserDocument extends IUser, Document {
  comparePassword: (password: string) => Promise<boolean>;
  createToken: () => string;
}
