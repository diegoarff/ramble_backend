import { Router } from 'express';

const router = Router();

// TODO: Implement controllers

router.get('/search');

router.route('/:userId').get().put().delete();

router.get('/:userId/tweets');

router.get('/:userId/liked');

router.get('/:userId/replies');

router.get('/:userId/followers');

router.get('/:userId/following');

router.route('/:userId/follow').post().delete();

router.route('/:userId/block').post().delete();

export default router;
