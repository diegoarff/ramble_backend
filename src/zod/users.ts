import { z } from 'zod';
import { bio, name, password, username } from './generics';

export const updateUserSchema = z
  .object({
    name,
    username,
    bio,
    avatar: z.string().url({ message: 'Avatar must be a valid URL' }),
  })
  .partial()
  .superRefine(({ name, username, bio }, ctx) => {
    if (!name && !username && !bio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one field must be provided',
        path: ['name', 'username', 'bio'],
      });
    }
  });

export const updatePasswordSchema = z
  .object({
    oldPassword: password,
    newPassword: password,
    confirmNewPassword: password,
  })
  .superRefine(({ newPassword, confirmNewPassword }, ctx) => {
    if (newPassword !== confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must match new password',
        path: ['confirmNewPassword'],
      });
    }
  });
