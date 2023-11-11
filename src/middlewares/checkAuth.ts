import type { Request, Response, NextFunction } from 'express';
import passport from 'passport';

export function checkAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  passport.authenticate(
    'jwt',
    { session: false },
    (err: Error, user: Express.User) => {
      if (err) {
        // Handle errors, e.g., log them or send a server error response
        console.error(err);
        return res
          .status(500)
          .json({ status: 'error', message: 'Internal Server Error' });
      }

      if (!user) {
        // Custom unauthorized response
        return res.status(401).json({
          status: 'error',
          message: 'You are not authorized to access this resource',
        });
      }

      // Authentication successful, store the user in the request
      req.user = user;
      next();
    },
  )(req, res, next);
}
