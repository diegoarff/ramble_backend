import BaseController from './BaseController';
import type { Request, Response } from 'express';
import { Tweet } from '../models';
import type { AuthRequest } from '../interfaces';

class TweetsController extends BaseController {
  // getRecentTweets = async (
  //   req: Request,
  //   res: Response,
  // ): Promise<Response> => {};

  // getFollowingTweets = async (
  //   req: Request,
  //   res: Response,
  // ): Promise<Response> => {};

  // searchTweets = async (req: Request, res: Response): Promise<Response> => {};

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
      const tweet = await Tweet.findById(tweetId).exec();

      if (tweet == null) {
        return this.errorRes(res, 404, 'Tweet not found');
      }

      return this.successRes(res, 200, 'Tweet retrieved', tweet);
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

  // getTweetReplies = async (
  //   req: Request,
  //   res: Response,
  // ): Promise<Response> => {};

  // likeTweet = async (req: Request, res: Response): Promise<Response> => {};

  // unlikeTweet = async (req: Request, res: Response): Promise<Response> => {};

  // retweet = async (req: Request, res: Response): Promise<Response> => {};

  // unretweet = async (req: Request, res: Response): Promise<Response> => {};
}

export default new TweetsController();
