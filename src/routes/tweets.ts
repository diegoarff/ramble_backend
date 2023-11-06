import { Router } from 'express';
import { TweetsController } from '../controllers';
import { validate } from '../middlewares';
import { createTweetSchema, updateTweetSchema } from '../zod';

const router = Router();

router.post('/', validate(createTweetSchema), TweetsController.createTweet);

router.get('/recent', TweetsController.getRecentTweets);

router.get('/following', TweetsController.getFollowingTweets);

router.get('/search', TweetsController.searchTweets);

router.get('/user/:userId', TweetsController.getUserTweets);

router.get('/user/:userId/replies', TweetsController.getUserReplies);

router.get('/user/:userId/liked', TweetsController.getUserLikedTweets);

router.post(
  '/:tweetId/reply',
  validate(createTweetSchema),
  TweetsController.createTweet,
);

router.get('/:tweetId/replies', TweetsController.getTweetReplies);

router.post('/:tweetId/like', TweetsController.handleLike);

router
  .route('/:tweetId')
  .get(TweetsController.getTweet)
  .delete(TweetsController.deleteTweet);

router.put(
  '/:tweetId',
  validate(updateTweetSchema),
  TweetsController.updateTweet,
);

export default router;
