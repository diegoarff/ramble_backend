import BaseController from './BaseController';
import type { Request, Response } from 'express';
import { Tweet, Follow, Like, Retweet } from '../models';
import type { AuthRequest } from '../interfaces';
import { type Aggregate, Types } from 'mongoose';

class TweetsController extends BaseController {
  // TODO: Create a pagination pipeline

  private tweetPipeline(): Aggregate<unknown[]> {
    return Tweet.aggregate()
      .lookup({
        from: 'likes',
        localField: '_id',
        foreignField: 'tweetId',
        as: 'likes',
      })
      .lookup({
        from: 'retweets',
        localField: '_id',
        foreignField: 'tweetId',
        as: 'retweets',
      })
      .lookup({
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      })
      .project({
        _id: 1,
        content: 1,
        image: 1,
        isReplyTo: 1,
        isEdited: 1,
        createdAt: 1,
        user: { $arrayElemAt: ['$user', 0] },
        likeCount: { $size: '$likes' },
        retweetCount: { $size: '$retweets' },
      });
  }

  getRecentTweets = async (_: Request, res: Response): Promise<Response> => {
    try {
      const recentTweets = await this.tweetPipeline()
        .sort({ createdAt: -1 })
        .limit(10)
        .exec();

      return this.successRes(res, 200, 'Recent tweets retrieved', recentTweets);
    } catch (error) {
      return this.errorRes(res, 500, 'Failed to get recent tweets', error);
    }
  };

  getFollowingTweets = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const userId = (req as AuthRequest).user._id;

    try {
      const following = await Follow.find({ userId }).select('followingId');

      const followingUserIds = following.map((follow) => follow.followingId);

      const followingTweets = await this.tweetPipeline()
        .match({ userId: { $in: followingUserIds } })
        .sort({ createdAt: -1 })
        .limit(10) // Adjust the number of tweets to return as needed
        .exec();

      return this.successRes(
        res,
        200,
        'Following tweets retrieved',
        followingTweets,
      );
    } catch (error) {
      return this.errorRes(res, 500, 'Failed to get following tweets', error);
    }
  };

  getTweetReplies = async (req: Request, res: Response): Promise<Response> => {
    const { tweetId } = req.params;

    try {
      const tweetReplies = await Tweet.find({ isReplyTo: tweetId })
        .sort({ createdAt: 1 })
        .populate('userId', 'name username avatar') // Populate the 'userId' field with user information
        .exec();

      return this.successRes(res, 200, 'Tweet replies retrieved', tweetReplies);
    } catch (error) {
      return this.errorRes(res, 500, 'Failed to get tweet replies', error);
    }
  };

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

    try {
      const tweet = await this.tweetPipeline()
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
          'You do not possess permissions to update this tweet',
        );
      }

      tweet.content = content ?? tweet.content;
      tweet.image = image ?? tweet.image;

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

  searchTweets = async (req: Request, res: Response): Promise<Response> => {
    const { query } = req.query;

    if (!query) {
      return this.errorRes(res, 400, 'Query cannot be empty');
    }

    try {
      const tweets = await this.tweetPipeline()
        .match({ content: { $regex: query, $options: 'i' } })
        .sort({ createdAt: -1 })
        .limit(10)
        .exec();

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

  handleRetweet = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { tweetId } = req.params;
      const userId = (req as AuthRequest).user._id;

      const retweet = await Retweet.findOne({ userId, tweetId });

      if (retweet != null) {
        await retweet.deleteOne();

        return this.successRes(res, 200, 'Tweet unretweeted', retweet);
      }

      await Retweet.create({ userId, tweetId });

      return this.successRes(res, 200, 'Tweet retweeted');
    } catch (error) {
      return this.errorRes(res, 500, 'Failed to retweet tweet', error);
    }
  };
}

export default new TweetsController();
