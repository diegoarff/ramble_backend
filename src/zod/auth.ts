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
  identifier: z
    .string({
      required_error: 'Username or email is required',
      invalid_type_error: 'Identifier must be a string',
    })
    .min(2)
    .max(255),
  password,
});
