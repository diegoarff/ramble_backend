import { Router } from 'express';
import { TweetsController } from '../controllers';

const router = Router();

// TODO: Implement controllers

router.get('/recent');

router.get('/following');

router.get('/search');

router.post('/', TweetsController.createTweet);

router
  .route('/:tweetId')
  .get(TweetsController.getTweet)
  .put(TweetsController.updateTweet)
  .delete(TweetsController.deleteTweet);

router.post('/:tweetId/reply', TweetsController.createTweet);

router.get('/:tweetId/replies');

router.route('/:tweetId/like').post().delete();

router.route('/:tweetId/retweet').post().delete();

export default router;
