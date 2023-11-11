import BaseController from './BaseController';
import type { Request, Response } from 'express';
import type { AuthRequest } from '../interfaces';
import { User, Follow, Block, userPipeline } from '../models';
import { Types } from 'mongoose';

class UsersController extends BaseController {
  updatePassword = async (req: Request, res: Response): Promise<Response> => {
    const userId = (req as AuthRequest).user._id;

    const { oldPassword, newPassword } = req.body;

    try {
      const user = await User.findById(userId);

      if (user == null) {
        return this.errorRes(res, 404, 'User not found');
      }

      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        return this.errorRes(res, 400, 'Invalid password');
      }

      user.password = newPassword;

      await user.save();

      return this.successRes(res, 200, 'Password updated');
    } catch (error) {
      return this.errorRes(res, 500, 'Error updating password', error);
    }
  };

  getUser = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params;
    const authUserId = (req as AuthRequest).user._id;

    try {
      const user = await userPipeline(authUserId)
        .match({ _id: new Types.ObjectId(userId) })
        .exec();

      if (user.length === 0) {
        return this.errorRes(res, 404, 'User not found');
      }

      return this.successRes(res, 200, 'User retrieved', user[0]);
    } catch (error) {
      return this.errorRes(res, 500, 'Error getting user', error);
    }
  };

  getAuthUser = async (req: Request, res: Response): Promise<Response> => {
    const userId = (req as AuthRequest).user._id;

    try {
      const user = await userPipeline()
        .match({ _id: new Types.ObjectId(userId) })
        .exec();

      if (user.length === 0) {
        return this.errorRes(res, 404, 'User not found');
      }

      return this.successRes(res, 200, 'User retrieved', user[0]);
    } catch (error) {
      console.log(error);
      return this.errorRes(res, 500, 'Error getting user', error);
    }
  };

  updateUser = async (req: Request, res: Response): Promise<Response> => {
    const { name, username, avatar, bio } = req.body;
    const userId = (req as AuthRequest).user._id;

    try {
      const user = await User.findOne({ _id: userId });

      if (user == null) {
        return this.errorRes(res, 404, 'User not found');
      }

      user.name = name ?? user.name;
      user.username = username ?? user.username;
      user.avatar = avatar ?? user.avatar;
      user.bio = bio ?? user.bio;

      await user.save();

      return this.successRes(res, 200, 'User updated', user.toSafeObject());
    } catch (error) {
      return this.errorRes(res, 500, 'Error updating user', error);
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<Response> => {
    const userId = (req as AuthRequest).user._id;

    try {
      const user = await User.findOne({ _id: userId });

      if (user == null) {
        return this.errorRes(res, 404, 'User not found');
      }

      await user.deleteOne();

      return this.successRes(res, 200, 'Account deleted');
    } catch (error) {
      return this.errorRes(res, 500, 'Error deleting user', error);
    }
  };

  searchUsers = async (req: Request, res: Response): Promise<Response> => {
    const { query, date } = req.query;

    if (!query) {
      return this.errorRes(res, 400, 'Query cannot be empty');
    }

    try {
      const userPipelineBuilder = userPipeline()
        .match({
          $or: [
            { name: { $regex: query as string, $options: 'i' } },
            { username: { $regex: query as string, $options: 'i' } },
          ],
        })
        .sort({ createdAt: -1 });

      if (date) {
        userPipelineBuilder.match({
          createdAt: { $lt: new Date(date as string) },
        });
      }

      const users = await userPipelineBuilder.limit(10).exec();

      return this.successRes(res, 200, 'Users retrieved', users);
    } catch (error) {
      console.log(error);
      return this.errorRes(res, 500, 'Error getting users', error);
    }
  };

  getUserFollowers = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params;
    const { date } = req.query;

    try {
      const user = User.exists({ _id: userId });

      if (!user) {
        return this.errorRes(res, 404, 'User not found');
      }

      const followerPipelineBuilder = Follow.find({ followingId: userId })
        .populate({
          path: 'userId',
          select: '-password -email -createdAt -updatedAt',
        })
        .select('-_id userId')
        .sort({ createdAt: -1 });

      if (date) {
        followerPipelineBuilder.where({
          createdAt: { $lt: new Date(date as string) },
        });
      }

      const followers = await followerPipelineBuilder.limit(10).exec();

      const followersRes = followers.map((user) => user.userId);
      return this.successRes(res, 200, 'Followers retrieved', followersRes);
    } catch (error) {
      return this.errorRes(res, 500, 'Error getting followers', error);
    }
  };

  getUserFollowing = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params;
    const { date } = req.query;

    try {
      const user = User.exists({ _id: userId });

      if (!user) {
        return this.errorRes(res, 404, 'User not found');
      }

      const followingPipelineBuilder = Follow.find({ userId })
        .populate({
          path: 'followingId',
          select: '-password -email -createdAt -updatedAt',
        })
        .select('-_id followingId')
        .sort({ createdAt: -1 });

      if (date) {
        followingPipelineBuilder.where({
          createdAt: { $lt: new Date(date as string) },
        });
      }

      const following = await followingPipelineBuilder.limit(10).exec();

      const followingRes = following.map((follow) => follow.followingId);
      return this.successRes(res, 200, 'Following retrieved', followingRes);
    } catch (error) {
      return this.errorRes(res, 500, 'Error getting following', error);
    }
  };

  handleFollow = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params;
    const authUserId = (req as AuthRequest).user._id;

    if (userId === authUserId.toString()) {
      return this.errorRes(res, 400, 'Cannot follow yourself');
    }

    try {
      const user = User.exists({ _id: userId });

      if (!user) {
        return this.errorRes(res, 404, 'User not found');
      }

      const follow = await Follow.findOne({
        followingId: userId,
        userId: authUserId,
      });

      if (follow != null) {
        await follow.deleteOne();

        return this.successRes(res, 200, 'User unfollowed', follow);
      }

      const isBlocked = await Block.findOne({
        blockedUserId: userId,
        userId: authUserId,
      });

      if (isBlocked != null) {
        return this.errorRes(res, 400, 'Cannot follow a blocked user');
      }

      const hasMeBlocked = await Block.findOne({
        blockedUserId: authUserId,
        userId,
      });

      if (hasMeBlocked != null) {
        return this.errorRes(res, 400, 'Cannot follow a user that blocked you');
      }

      await Follow.create({
        followingId: userId,
        userId: authUserId,
      });

      return this.successRes(res, 200, 'User followed');
    } catch (error) {
      return this.errorRes(res, 500, 'Error following user', error);
    }
  };

  handleBlock = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params;
    const authUserId = (req as AuthRequest).user._id;

    if (userId === authUserId.toString()) {
      return this.errorRes(res, 400, 'Cannot block yourself');
    }

    try {
      const user = User.exists({ _id: userId });

      if (!user) {
        return this.errorRes(res, 404, 'User not found');
      }

      const block = await Block.findOne({
        blockedUserId: userId,
        userId: authUserId,
      });

      if (block != null) {
        await block.deleteOne();

        return this.successRes(res, 200, 'User unblocked', block);
      }

      const following = await Follow.findOne({
        followingId: userId,
        userId: authUserId,
      });

      if (following != null) {
        await following.deleteOne();
      }

      const isFollowingMe = await Follow.findOne({
        followingId: authUserId,
        userId,
      });

      if (isFollowingMe != null) {
        await isFollowingMe.deleteOne();
      }

      await Block.create({
        blockedUserId: userId,
        userId: authUserId,
      });

      return this.successRes(res, 200, 'User blocked');
    } catch (error) {
      return this.errorRes(res, 500, 'Error blocking user', error);
    }
  };
}

export default new UsersController();
