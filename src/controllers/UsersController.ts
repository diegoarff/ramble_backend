import BaseController from './BaseController';
import type { Request, Response } from 'express';
import type { AuthRequest } from '../interfaces';
import {
  User,
  Follow,
  Block,
  Retweet,
  Like,
  Tweet,
  tweetPipeline,
  userPipeline,
} from '../models';
import { Types } from 'mongoose';

class UsersController extends BaseController {
  getUser = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params;
    const authUserId = (req as AuthRequest).user._id;

    try {
      const user = await userPipeline()
        .match({ _id: new Types.ObjectId(userId) })
        .lookup({
          from: 'blocks',
          let: { userId: '$_id', authUserId },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$blockedUserId', '$$userId'] },
                    { $eq: ['$userId', '$$authUserId'] },
                  ],
                },
              },
            },
          ],
          as: 'myBlocks',
        })
        .lookup({
          from: 'blocks',
          let: { userId: '$_id', authUserId },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$blockedUserId', '$$authUserId'] },
                    { $eq: ['$userId', '$$userId'] },
                  ],
                },
              },
            },
          ],
          as: 'blocksMe',
        })
        .project({
          _id: 1,
          name: 1,
          username: 1,
          bio: 1,
          createdAt: 1,
          followingCount: { $size: '$following' },
          followersCount: { $size: '$followers' },
          isBlocked: { $gt: [{ $size: '$myBlocks' }, 0] },
          hasMeBlocked: { $gt: [{ $size: '$blocksMe' }, 0] },
        })
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

      await Tweet.deleteMany({ userId });
      await Retweet.deleteMany({ userId });
      await Like.deleteMany({ userId });
      await Follow.deleteMany({ userId });
      await Follow.deleteMany({ followingId: userId });
      await Block.deleteMany({ userId });
      await Block.deleteMany({ blockedUserId: userId });
      await user.deleteOne();

      return this.successRes(res, 200, 'Account deleted');
    } catch (error) {
      return this.errorRes(res, 500, 'Error deleting user', error);
    }
  };

  // searchUsers
  searchUsers = async (req: Request, res: Response): Promise<Response> => {
    const { q } = req.query;

    if (!q) {
      return this.errorRes(res, 400, 'Query cannot be empty');
    }

    try {
      const users = await userPipeline()
        .match({
          $or: [
            { name: { $regex: q as string, $options: 'i' } },
            { username: { $regex: q as string, $options: 'i' } },
          ],
        })
        .project({
          _id: 1,
          name: 1,
          username: 1,
          bio: 1,
          createdAt: 1,
          followingCount: { $size: '$following' },
          followersCount: { $size: '$followers' },
        })
        .limit(10)
        .exec();

      return this.successRes(res, 200, 'Users retrieved', users);
    } catch (error) {
      return this.errorRes(res, 500, 'Error getting users', error);
    }
  };

  getUserTweets = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params;

    try {
      const user = User.exists({ _id: userId });

      if (!user) {
        return this.errorRes(res, 404, 'User not found');
      }

      const tweets = await tweetPipeline({
        'user._id': new Types.ObjectId(userId),
      }).exec();

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

    try {
      const user = User.exists({ _id: userId });

      if (!user) {
        return this.errorRes(res, 404, 'User not found');
      }

      const tweets = await tweetPipeline({
        'likes.userId': new Types.ObjectId(userId),
      }).exec();

      return this.successRes(res, 200, 'Liked tweets retrieved', tweets);
    } catch (error) {
      return this.errorRes(res, 500, 'Error getting liked tweets', error);
    }
  };

  getUserReplies = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params;

    try {
      const user = User.exists({ _id: userId });

      if (!user) {
        return this.errorRes(res, 404, 'User not found');
      }

      const tweets = await tweetPipeline({
        'replies.user._id': new Types.ObjectId(userId),
      }).exec();

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
        .populate('userId')
        .exec();

      return this.successRes(res, 200, 'Followers retrieved', followers);
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
        .populate('followingId')
        .exec();

      return this.successRes(res, 200, 'Following retrieved', following);
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

        return this.successRes(res, 200, 'Follow removed', follow);
      }

      await Follow.create({
        followingId: userId,
        userId: authUserId,
      });

      return this.successRes(res, 200, 'Follow updated');
    } catch (error) {
      return this.errorRes(res, 500, 'Error updating follow', error);
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

        return this.successRes(res, 200, 'Block removed', block);
      }

      await Block.create({
        blockedUserId: userId,
        userId: authUserId,
      });

      return this.successRes(res, 200, 'Block updated');
    } catch (error) {
      return this.errorRes(res, 500, 'Error updating block', error);
    }
  };
}

export default new UsersController();
