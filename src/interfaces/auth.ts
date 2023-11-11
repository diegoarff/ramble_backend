import type { Types } from 'mongoose';
import type { Request } from 'express';

export interface AuthRequest extends Request {
  user: {
    _id: Types.ObjectId;
  };
}
