import { Router } from 'express';
import { TweetsController } from '../controllers';

const router = Router();

router.post('/', TweetsController.createTweet);

router.get('/recent', TweetsController.getRecentTweets);

router.get('/following', TweetsController.getFollowingTweets);

router.get('/search', TweetsController.searchTweets);

router.post('/:tweetId/reply', TweetsController.createTweet);

router.get('/:tweetId/replies', TweetsController.getTweetReplies);

router.post('/:tweetId/like', TweetsController.handleLike);

router
  .route('/:tweetId')
  .get(TweetsController.getTweet)
  .put(TweetsController.updateTweet)
  .delete(TweetsController.deleteTweet);

export default router;
