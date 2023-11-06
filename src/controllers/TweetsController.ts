import BaseController from './BaseController';
import type { Request, Response } from 'express';
import { Tweet, Follow, Like, Block, tweetPipeline, User } from '../models';
import type { AuthRequest } from '../interfaces';
import { Types } from 'mongoose';

class TweetsController extends BaseController {
  createTweet = async (req: Request, res: Response): Promise<Response> => {
    const { content, image } = req.body;
    const { tweetId } = req.params;
    const userId = (req as AuthRequest).user._id;

    try {
      const tweet = await Tweet.create({
        content,
        image: image ?? null,
        userId,
        isReplyTo: tweetId ?? null,
      });

      await tweet.save();

      return this.successRes(res, 201, 'Tweet created', tweet);
    } catch (error) {
      return this.errorRes(res, 500, 'Failed to create tweet', error);
    }
  };

  getTweet = async (req: Request, res: Response): Promise<Response> => {
    const { tweetId } = req.params;
    const userId = (req as AuthRequest).user._id;

    try {
      const tweet = await tweetPipeline(null, userId)
        .match({ _id: new Types.ObjectId(tweetId) })
        .exec();

      if (tweet.length === 0) {
        return this.errorRes(res, 404, 'Tweet not found');
      }

      return this.successRes(res, 200, 'Tweet retrieved', tweet[0]);
    } catch (error) {
      return this.errorRes(res, 500, 'Failed to get tweet', error);
    }
  };

  updateTweet = async (req: Request, res: Response): Promise<Response> => {
    const { content, image } = req.body;
    const { tweetId } = req.params;
    const userId = (req as AuthRequest).user._id;

    try {
      const tweet = await Tweet.findOne({ _id: tweetId });

      if (tweet == null) {
        return this.errorRes(res, 404, 'Tweet not found');
      }

      if (!tweet.userId.equals(userId)) {
        return this.errorRes(
          res,
          403,
          'You do not possess permissions to update this tweet',
        );
      }

      tweet.content = content ?? tweet.content;
      tweet.image = image ?? tweet.image;
      tweet.isEdited = true;

      await tweet.save();

      return this.successRes(res, 200, 'Tweet updated', tweet);
    } catch (error) {
      return this.errorRes(res, 500, 'Failed to update tweet', error);
    }
  };

  deleteTweet = async (req: Request, res: Response): Promise<Response> => {
    const { tweetId } = req.params;

    try {
      const tweet = await Tweet.findOne({ _id: tweetId });
      const userId = (req as AuthRequest).user._id;

      if (tweet == null) {
        return this.errorRes(res, 404, 'Tweet not found');
      }

      if (!tweet.userId.equals(userId)) {
        return this.errorRes(
          res,
          403,
          'You do not possess permissions to delete this tweet',
        );
      }

      await tweet.deleteOne();

      return this.successRes(res, 200, 'Tweet deleted', tweet);
    } catch (error) {
      return this.errorRes(res, 500, 'Failed to delete tweet', error);
    }
  };

  getRecentTweets = async (req: Request, res: Response): Promise<Response> => {
    const userId = (req as AuthRequest).user._id;
    const { date } = req.query;

    try {
      const myBlocks = await Block.find({ userId });
      const blocksMe = await Block.find({ blockedUserId: userId });

      const blockedUserIds = myBlocks.map((block) => block.blockedUserId);
      const blockedByUserIds = blocksMe.map((block) => block.userId);

      const tweetPipelineBuilder = tweetPipeline(null, userId)
        .match({
          $and: [
            { 'user._id': { $nin: blockedUserIds } },
            { 'user._id': { $nin: blockedByUserIds } },
            { isReplyTo: null },
          ],
        })
        .sort({ createdAt: -1 });

      if (date) {
        tweetPipelineBuilder.match({
          createdAt: { $lt: new Date(date as string) },
        });
      }

      const tweets = await tweetPipelineBuilder.limit(10).exec();

      return this.successRes(res, 200, 'Recent tweets retrieved', tweets);
    } catch (error) {
      return this.errorRes(res, 500, 'Failed to get recent tweets', error);
    }
  };

  getFollowingTweets = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const userId = (req as AuthRequest).user._id;
    const { date } = req.query;

    try {
      const following = await Follow.find({ userId }).select('followingId');

      const followingUserIds = following.map((follow) => follow.followingId);
      console.log(followingUserIds);

      const tweetPipelineBuilder = tweetPipeline(null, userId)
        .match({ 'user._id': { $in: followingUserIds } })
        .match({ isReplyTo: null })
        .sort({ createdAt: -1 });

      if (date) {
        tweetPipelineBuilder.match({
          createdAt: { $lt: new Date(date as string) },
        });
      }

      const tweets = await tweetPipelineBuilder.limit(10).exec();

      return this.successRes(res, 200, 'Following tweets retrieved', tweets);
    } catch (error) {
      return this.errorRes(res, 500, 'Failed to get following tweets', error);
    }
  };

  getTweetReplies = async (req: Request, res: Response): Promise<Response> => {
    const { tweetId } = req.params;
    const userId = (req as AuthRequest).user._id;
    const { date } = req.query;

    try {
      const tweetPipelineBuilder = tweetPipeline(null, userId).match({
        isReplyTo: new Types.ObjectId(tweetId),
      });

      if (date) {
        tweetPipelineBuilder.match({
          createdAt: { $lt: new Date(date as string) },
        });
      }

      const tweetReplies = await tweetPipelineBuilder.limit(10).exec();

      return this.successRes(res, 200, 'Tweet replies retrieved', tweetReplies);
    } catch (error) {
      return this.errorRes(res, 500, 'Failed to get tweet replies', error);
    }
  };

  getUserTweets = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params;
    const authUserId = (req as AuthRequest).user._id;
    const { date } = req.query;

    try {
      const user = User.exists({ _id: userId });

      if (!user) {
        return this.errorRes(res, 404, 'User not found');
      }

      const tweetPipelineBuilder = tweetPipeline(null, authUserId)
        .match({
          'user._id': new Types.ObjectId(userId),
          isReplyTo: null,
        })
        .sort({ createdAt: -1 });

      if (date) {
        tweetPipelineBuilder.match({
          createdAt: { $lt: new Date(date as string) },
        });
      }

      const tweets = await tweetPipelineBuilder.limit(10).exec();

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
    const { date } = req.query;

    try {
      const user = User.exists({ _id: userId });

      if (!user) {
        return this.errorRes(res, 404, 'User not found');
      }

      const tweetPipelineBuilder = tweetPipeline(
        {
          'likes.userId': new Types.ObjectId(userId),
        },
        authUserId,
      ).sort({ createdAt: -1 });

      if (date) {
        tweetPipelineBuilder.match({
          createdAt: { $lt: new Date(date as string) },
        });
      }

      const tweets = await tweetPipelineBuilder.limit(10).exec();

      return this.successRes(res, 200, 'Liked tweets retrieved', tweets);
    } catch (error) {
      return this.errorRes(res, 500, 'Error getting liked tweets', error);
    }
  };

  getUserReplies = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params;
    const authUserId = (req as AuthRequest).user._id;
    const { date } = req.query;

    try {
      const user = User.exists({ _id: userId });

      if (!user) {
        return this.errorRes(res, 404, 'User not found');
      }

      const tweetPipelineBuilder = tweetPipeline(null, authUserId)
        .match({
          'user._id': new Types.ObjectId(userId),
          isReplyTo: { $ne: null },
        })
        .sort({
          createdAt: -1,
        });

      if (date) {
        tweetPipelineBuilder.match({
          createdAt: { $lt: new Date(date as string) },
        });
      }

      const tweets = await tweetPipelineBuilder.limit(10).exec();

      return this.successRes(res, 200, 'Replies retrieved', tweets);
    } catch (error) {
      return this.errorRes(res, 500, 'Error getting replies', error);
    }
  };

  searchTweets = async (req: Request, res: Response): Promise<Response> => {
    const { query, date } = req.query;
    const userId = (req as AuthRequest).user._id;

    if (!query) {
      return this.errorRes(res, 400, 'Query cannot be empty');
    }

    try {
      const myBlocks = await Block.find({ userId });
      const blocksMe = await Block.find({ blockedUserId: userId });

      const blockedUserIds = myBlocks.map((block) => block.blockedUserId);
      const blockedByUserIds = blocksMe.map((block) => block.userId);

      const tweetPipelineBuilder = tweetPipeline(null, userId)
        .match({
          $and: [
            { content: { $regex: query as string, $options: 'i' } },
            { 'user._id': { $nin: blockedUserIds } },
            { 'user._id': { $nin: blockedByUserIds } },
            { isReplyTo: null },
          ],
        })
        .sort({ createdAt: -1 });

      if (date) {
        tweetPipelineBuilder.match({
          createdAt: { $lt: new Date(date as string) },
        });
      }

      const tweets = await tweetPipelineBuilder.limit(10).exec();

      return this.successRes(res, 200, 'Tweets retrieved', tweets);
    } catch (error) {
      return this.errorRes(res, 500, 'Failed to get tweets', error);
    }
  };

  handleLike = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { tweetId } = req.params;
      const userId = (req as AuthRequest).user._id;

      const like = await Like.findOne({ userId, tweetId });

      if (like != null) {
        await like.deleteOne();

        return this.successRes(res, 200, 'Tweet unliked', like);
      }

      await Like.create({ userId, tweetId });

      return this.successRes(res, 200, 'Tweet liked');
    } catch (error) {
      return this.errorRes(res, 500, 'Failed to like tweet', error);
    }
  };
}

export default new TweetsController();
