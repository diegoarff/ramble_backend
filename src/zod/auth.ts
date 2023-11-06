import { z } from 'zod';
import { bio, email, name, password, username } from './generics';

export const signUpSchema = z.object({
  name,
  username,
  email,
  password,
  bio,
});

export const signInSchema = z.object({
  username,
  password,
});
