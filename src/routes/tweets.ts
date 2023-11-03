import { Router } from 'express';
import { TweetsController } from '../controllers';

const router = Router();

router.get('/recent', TweetsController.getRecentTweets);

router.get('/following', TweetsController.getFollowingTweets);

router.get('/search', TweetsController.searchTweets);

router.post('/', TweetsController.createTweet);

router
  .route('/:tweetId')
  .get(TweetsController.getTweet)
  .put(TweetsController.updateTweet)
  .delete(TweetsController.deleteTweet);

router.post('/:tweetId/reply', TweetsController.createTweet);

router.get('/:tweetId/replies', TweetsController.getTweetReplies);

router
  .route('/:tweetId/like')
  .post(TweetsController.handleLike)
  .delete(TweetsController.handleLike);

router
  .route('/:tweetId/retweet')
  .post(TweetsController.handleRetweet)
  .delete(TweetsController.handleRetweet);

export default router;
