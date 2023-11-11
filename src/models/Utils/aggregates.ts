import Tweet from '../Tweet';
import User from '../User';
import type { Aggregate, Types } from 'mongoose';

export function tweetPipeline(
  deepMatchFilter: object | null = null,
  authId?: Types.ObjectId,
): Aggregate<unknown[]> {
  let pipeline = Tweet.aggregate()
    .lookup({
      from: 'likes',
      localField: '_id',
      foreignField: 'tweetId',
      as: 'likes',
    })
    .lookup({
      from: 'tweets',
      localField: '_id',
      foreignField: 'isReplyTo',
      as: 'replies',
    })
    .lookup({
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'user',
    });

  if (deepMatchFilter) {
    pipeline = pipeline.match(deepMatchFilter);
  }

  if (authId) {
    pipeline = pipeline.lookup({
      from: 'likes',
      localField: '_id',
      foreignField: 'tweetId',
      as: 'userLikes',
    });
  }

  return pipeline
    .addFields({
      liked: {
        $cond: {
          if: {
            $in: [authId, '$userLikes.userId'],
          },
          then: true,
          else: false,
        },
      },
    })
    .project({
      _id: 1,
      content: 1,
      image: 1,
      isReplyTo: 1,
      isEdited: 1,
      createdAt: 1,
      user: {
        $let: {
          vars: {
            userObj: { $arrayElemAt: ['$user', 0] },
          },
          in: {
            _id: '$$userObj._id',
            name: '$$userObj.name',
            username: '$$userObj.username',
            avatar: '$$userObj.avatar',
          },
        },
      },
      likeCount: { $size: '$likes' },
      replyCount: { $size: '$replies' },
      liked: 1,
    });
}

export function userPipeline(authId?: Types.ObjectId): Aggregate<unknown[]> {
  let pipeline = User.aggregate()
    .lookup({
      from: 'follows',
      localField: '_id',
      foreignField: 'userId',
      as: 'following',
    })
    .lookup({
      from: 'follows',
      localField: '_id',
      foreignField: 'followingId',
      as: 'followers',
    });

  if (authId) {
    pipeline = pipeline
      .lookup({
        from: 'follows',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$userId', authId] },
                  { $eq: ['$followingId', '$$userId'] },
                ],
              },
            },
          },
        ],
        as: 'isFollowing',
      })
      .lookup({
        from: 'blocks',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$blockedUserId', '$$userId'] },
                  { $eq: ['$userId', authId] },
                ],
              },
            },
          },
        ],
        as: 'myBlocks',
      })
      .lookup({
        from: 'blocks',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$blockedUserId', authId] },
                  { $eq: ['$userId', '$$userId'] },
                ],
              },
            },
          },
        ],
        as: 'blocksMe',
      })
      .project({
        _id: 1,
        name: 1,
        username: 1,
        bio: 1,
        avatar: 1,
        createdAt: 1,
        followingCount: { $size: '$following' },
        followersCount: { $size: '$followers' },
        hasMeBlocked: { $gt: [{ $size: '$blocksMe' }, 0] },
        blocked: { $gt: [{ $size: '$myBlocks' }, 0] },
        following: { $gt: [{ $size: '$isFollowing' }, 0] },
      });
  } else {
    pipeline = pipeline.project({
      _id: 1,
      name: 1,
      username: 1,
      bio: 1,
      avatar: 1,
      createdAt: 1,
      followingCount: { $size: '$following' },
      followersCount: { $size: '$followers' },
    });
  }

  return pipeline;
}
