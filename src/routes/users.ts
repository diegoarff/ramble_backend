import { Router } from 'express';
import { UsersController } from '../controllers';

const router = Router();

router.get('/search', UsersController.searchUsers);

router
  .route('/me')
  .get(UsersController.getAuthUser)
  .put(UsersController.updateUser)
  .delete(UsersController.deleteUser);

router.get('/:userId', UsersController.getUser);

router.get('/:userId/tweets', UsersController.getUserTweets);

router.get('/:userId/liked', UsersController.getUserLikedTweets);

router.get('/:userId/replies', UsersController.getUserReplies);

router.get('/:userId/followers', UsersController.getUserFollowers);

router.get('/:userId/following', UsersController.getUserFollowing);

router
  .route('/:userId/follow')
  .post(UsersController.handleFollow)
  .delete(UsersController.handleFollow);

router
  .route('/:userId/block')
  .post(UsersController.handleBlock)
  .delete(UsersController.handleBlock);

export default router;
