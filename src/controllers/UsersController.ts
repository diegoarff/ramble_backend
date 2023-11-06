import BaseController from './BaseController';
import type { Request, Response } from 'express';
import type { AuthRequest } from '../interfaces';
import { User, Follow, Block, tweetPipeline, userPipeline } from '../models';
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
    const { name, username, bio } = req.body;
    const userId = (req as AuthRequest).user._id;

    try {
      const user = await User.findOne({ _id: userId });

      if (user == null) {
        return this.errorRes(res, 404, 'User not found');
      }

      user.name = name ?? user.name;
      user.username = username ?? user.username;
      user.bio = bio ?? user.bio;

      await user.save();

      return this.successRes(res, 200, 'User updated', user);
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

  // searchUsers
  searchUsers = async (req: Request, res: Response): Promise<Response> => {
    const { q } = req.query;
    const authUserId = (req as AuthRequest).user._id;

    if (!q) {
      return this.errorRes(res, 400, 'Query cannot be empty');
    }

    try {
      const users = await userPipeline(authUserId)
        .match({
          $or: [
            { name: { $regex: q as string, $options: 'i' } },
            { username: { $regex: q as string, $options: 'i' } },
          ],
        })
        .match({
          hasMeBlocked: false, // Exclude users who have blocked you
          blocked: false, // Exclude users who are blocked by you
        })
        .exec();

      return this.successRes(res, 200, 'Users retrieved', users);
    } catch (error) {
      console.log(error);
      return this.errorRes(res, 500, 'Error getting users', error);
    }
  };

  getUserTweets = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params;
    const authUserId = (req as AuthRequest).user._id;

    try {
      const user = User.exists({ _id: userId });

      if (!user) {
        return this.errorRes(res, 404, 'User not found');
      }

      const tweets = await tweetPipeline(null, authUserId)
        .match({
          'user._id': new Types.ObjectId(userId),
        })
        .match({ isReplyTo: null })
        .sort({ createdAt: -1 })
        .exec();

      return this.successRes(res, 200, 'Tweets from user retrieved', tweets);
    } catch (error) {
      return this.errorRes(res, 500, 'Error getting tweets', error);
    }
  };

  getUserLikedTweets = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { userId } = req.params;
    const authUserId = (req as AuthRequest).user._id;

    try {
      const user = User.exists({ _id: userId });

      if (!user) {
        return this.errorRes(res, 404, 'User not found');
      }

      const tweets = await tweetPipeline(
        {
          'likes.userId': new Types.ObjectId(userId),
        },
        authUserId,
      )
        .sort({ createdAt: -1 })
        .exec();

      return this.successRes(res, 200, 'Liked tweets retrieved', tweets);
    } catch (error) {
      return this.errorRes(res, 500, 'Error getting liked tweets', error);
    }
  };

  getUserReplies = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params;
    const authUserId = (req as AuthRequest).user._id;

    try {
      const user = User.exists({ _id: userId });

      if (!user) {
        return this.errorRes(res, 404, 'User not found');
      }

      const tweets = await tweetPipeline(
        {
          'replies.user._id': new Types.ObjectId(userId),
        },
        authUserId,
      )
        .sort({ createdAt: -1 })
        .exec();

      return this.successRes(res, 200, 'Replies retrieved', tweets);
    } catch (error) {
      return this.errorRes(res, 500, 'Error getting replies', error);
    }
  };

  getUserFollowers = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params;

    try {
      const user = User.exists({ _id: userId });

      if (!user) {
        return this.errorRes(res, 404, 'User not found');
      }

      const followers = await Follow.find({ followingId: userId })
        .populate({
          path: 'userId',
          select: '-password -email -createdAt -updatedAt',
        })
        .select('-_id userId')
        .exec();

      const followersRes = followers.map((user) => user.userId);
      return this.successRes(res, 200, 'Followers retrieved', followersRes);
    } catch (error) {
      return this.errorRes(res, 500, 'Error getting followers', error);
    }
  };

  getUserFollowing = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params;

    try {
      const user = User.exists({ _id: userId });

      if (!user) {
        return this.errorRes(res, 404, 'User not found');
      }

      const following = await Follow.find({ userId })
        .populate({
          path: 'followingId',
          select: '-password -email -createdAt -updatedAt',
        })
        .select('-_id followingId')
        .exec();

      const followingRes = following.map((follow) => follow.followingId);
      return this.successRes(res, 200, 'Following retrieved', followingRes);
    } catch (error) {
      return this.errorRes(res, 500, 'Error getting following', error);
    }
  };

  handleFollow = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params;
    const authUserId = (req as AuthRequest).user._id;

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
