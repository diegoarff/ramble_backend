import { Router } from 'express';

const router = Router();

// TODO: Implement controllers

router.get('/recent');

router.get('/following');

router.get('/search');

router.post('/'); // Create a new tweet

router.route('/:tweetId').get().put().delete();

router.post('/:tweetId/reply');

router.get('/:tweetId/replies');

router.route('/:tweetId/like').post().delete();

router.route('/:tweetId/retweet').post().delete();

export default router;
