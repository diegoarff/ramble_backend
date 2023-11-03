import BaseController from './BaseController';
import type { Request, Response } from 'express';
import { User } from '../models';

class AuthController extends BaseController {
  signUp = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name, username, email, password, bio } = req.body;

      const userExists = await User.exists({ username });

      if (userExists !== null) {
        return this.errorRes(res, 400, 'Username already exists');
      }

      const user = await User.create({
        name,
        username,
        email,
        password,
        bio,
      });

      return this.successRes(res, 201, 'User created', user);
    } catch (error) {
      console.log(error);
      return this.errorRes(res, 500, 'Internal server error');
    }
  };

  signIn = async (req: Request, res: Response): Promise<Response> => {
    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username });

      if (user == null) {
        return this.errorRes(res, 404, 'User not found');
      }

      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return this.errorRes(res, 400, 'Invalid password');
      }

      const token = user.createToken();

      return this.successRes(res, 200, 'User logged in', { token });
    } catch (error) {
      return this.errorRes(res, 500, 'Internal server error');
    }
  };
}

export default new AuthController();
