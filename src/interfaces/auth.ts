import type { JwtPayload } from 'jsonwebtoken';
import type { Request } from 'express';

export interface AuthRequest extends Request {
  userId: string | JwtPayload;
}
