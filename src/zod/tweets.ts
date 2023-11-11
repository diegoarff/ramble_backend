import { z } from 'zod';

export const createTweetSchema = z.object({
  content: z
    .string({
      required_error: 'Content is required',
      invalid_type_error: 'Content must be a string',
    })
    .max(280, 'Content must be at most 280 characters'),
  image: z
    .string({
      invalid_type_error: 'Image must be a string',
    })
    .optional(),
});

export const updateTweetSchema = createTweetSchema
  .partial()
  .superRefine(({ content, image }, ctx) => {
    if (!content && !image) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one field must be provided',
        path: ['content', 'image'],
      });
    }
  });
