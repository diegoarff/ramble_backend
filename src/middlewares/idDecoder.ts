import jwt from 'jsonwebtoken';

import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../interfaces';

import 'dotenv/config';

export default function idDecoder(
  req: Request,
  _: Response,
  next: NextFunction,
): void {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'secret');

      (req as AuthRequest).userId = decoded;
    } catch (error) {
      console.error(error);
    }
  }

  next();
}
