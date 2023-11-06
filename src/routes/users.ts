import { Router } from 'express';
import { UsersController } from '../controllers';
import { validate } from '../middlewares';
import { updateUserSchema, updatePasswordSchema } from '../zod';

const router = Router();

router.get('/search', UsersController.searchUsers);

router
  .route('/me')
  .get(UsersController.getAuthUser)
  .delete(UsersController.deleteUser);

router.put('/me', validate(updateUserSchema), UsersController.updateUser);

router.put(
  '/me/password',
  validate(updatePasswordSchema),
  UsersController.updatePassword,
);

router.get('/:userId/tweets', UsersController.getUserTweets);

router.get('/:userId/liked', UsersController.getUserLikedTweets);

router.get('/:userId/replies', UsersController.getUserReplies);

router.get('/:userId/followers', UsersController.getUserFollowers);

router.get('/:userId/following', UsersController.getUserFollowing);

router.post('/:userId/follow', UsersController.handleFollow);

router.post('/:userId/block', UsersController.handleBlock);

router.get('/:userId', UsersController.getUser);

export default router;
