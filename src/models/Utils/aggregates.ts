import Tweet from '../Tweet';
import User from '../User';
import type { Aggregate } from 'mongoose';

// TODO: Create a pagination pipeline

export function tweetPipeline(deepMatchFilter?: object): Aggregate<unknown[]> {
  let pipeline = Tweet.aggregate()
    .lookup({
      from: 'likes',
      localField: '_id',
      foreignField: 'tweetId',
      as: 'likes',
    })
    .lookup({
      from: 'retweets',
      localField: '_id',
      foreignField: 'tweetId',
      as: 'retweets',
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

  return pipeline.project({
    _id: 1,
    content: 1,
    image: 1,
    isReplyTo: 1,
    isEdited: 1,
    createdAt: 1,
    user: { $arrayElemAt: ['$user', 0] },
    likeCount: { $size: '$likes' },
    retweetCount: { $size: '$retweets' },
    replyCount: { $size: '$replies' },
  });
}

export function userPipeline(): Aggregate<unknown[]> {
  return User.aggregate()
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
}
