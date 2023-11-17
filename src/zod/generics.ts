import { z } from 'zod';

export const name = z
  .string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string',
  })
  .min(2, 'Name must be at least 2 characters')
  .max(30, 'Name must be at most 30 characters');

export const username = z
  .string({
    required_error: 'Username is required',
    invalid_type_error: 'Username must be a string',
  })
  .min(2, 'Username must be at least 2 characters')
  .max(25, 'Username must be at most 25 characters');

export const email = z
  .string({
    required_error: 'Email is required',
    invalid_type_error: 'Email must be a string',
  })
  .email('Invalid email format');

export const password = z
  .string({
    required_error: 'Password is required',
    invalid_type_error: 'Password must be a string',
  })
  .min(8, 'Password must be at least 8 characters')
  .max(50, 'Password must be at most 50 characters')
  .regex(
    /^(?=.*[A-Z])(?=.*\d).+/,
    'Password must contain at least one uppercase letter and one number',
  );

export const bio = z
  .string({
    invalid_type_error: 'Bio must be a string',
  })
  .max(100, 'Bio must be at most 100 characters')
  .optional();
