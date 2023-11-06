
# Ramble Backend

This is the backend for [Ramble](https://github.com/diegoarff/ramble), a Twitter / X clone made for an university project.


## API Reference
Para aquellos endpoints con paginación (los que cuentan con un parámetro date), usar el campo `createdAt` del último elemento devuelto en la lista.

- [Create a new user account](#create-a-new-user-account)
- [Sign in an existing user](#sign-in-an-existing-user)
- [Get authenticated user](#get-authenticated-user)
- [Update authenticated user](#update-authenticated-user)
- [Delete user account](#delete-user-account)
- [Update user password](#update-user-password)
- [Get the profile of a user](#get-the-profile-of-a-user)
- [Follow or unfollow a user](#follow-or-unfollow-a-user)
- [Block or unblock a user](#block-or-unblock-a-user)
- [Get followers list of a user](#get-followers-list-of-a-user)
- [Get following list of a user](#get-following-list-of-a-user)
- [Search users (by name or username)](#search-users-by-name-or-username)
- [Get tweets from user](#get-tweets-from-user)
- [Get reply tweets from user](#get-reply-tweets-from-user)
- [Get liked tweets from user](#get-liked-tweets-from-user)
- [Search tweets](#search-tweets)
- [Get recent tweets](#get-recent-tweets)
- [Get following tweets](#get-following-tweets)
- [Create tweet](#create-tweet)
- [Get tweet](#get-tweet)
- [Update tweet](#update-tweet)
- [Delete tweet](#delete-tweet)
- [Reply to a tweet](#reply-to-a-tweet)
- [Like or unlike a tweet](#like-or-unlike-a-tweet)
- [Get replies from a tweet](#get-replies-from-a-tweet)

```http
GET ?date={ createdAt field of last item }`
```
### Create a new user account
```http
  POST /auth/signup
```
#### Request
```
body: {
    name: string,
    username: string,
    email: string,
    password: string,
    bio?: string
}
```
Password must be at least 8 characters and contain 1 number and 1 uppercase.
#### Response
```
{
  "status": "success",
  "message": "User created",
  "data": {
    "_id": "",
    "name": "",
    "username": "",
    "email": "",
    "bio": "",
    "avatar": "",
    "createdAt": "",
  }
}
```
### Sign in an existing user
```http
  POST /auth/signin
```
#### Request
```
body: {
    identifier: string,
    password: string
}
```
Identifier is the username or email of the user trying to sign in.
#### Response
```
{
  "status": "success",
  "message": "User logged in",
  "data": {
    "token": JWT Token
  }
}
```
### Get authenticated user
```http
  GET /users/me
```
#### Request
```
Requires Authorization header with Bearer token
```
#### Response
```
{
  "status": "success",
  "message": "User retrieved",
  "data": {
    "_id": "",
    "name": "",
    "username": "",
    "bio": "",
    "avatar": "",
    "createdAt": "",
    "followingCount": number,
    "followersCount": number
  }
}
```
### Update authenticated user
```http
  PUT /users/me
```
#### Request
```
Requires Authorization header with Bearer token

body: {
    name?: string,
    username?: string,
    bio?: string,
    avatar?: string
}
```
At least one field must be provided.
#### Response
```
{
  "status": "success",
  "message": "User updated",
  "data": {
    "_id": "",
    "name": "",
    "username": "",
    "email": "",
    "bio": "",
    "avatar": "",
    "createdAt": "",
  }
}
```
### Delete user account
```http
  DELETE /users/me
```
#### Request
```
Requires Authorization header with Bearer token
```
#### Response
```
{
  "status": "success",
  "message": "Account deleted"
}
```
### Update user password
```http
  DELETE /users/me/password
```
#### Request
```
Requires Authorization header with Bearer token

body: {
  "oldPassword": string,
  "newPassword": string,
  "confirmNewPassword": string
}
```
#### Response
```
{
  "status": "success",
  "message": "Password updated"
}
```
### Get the profile of a user
```http
  GET /users/:userId
```
#### Request
```
Requires Authorization header with Bearer token
```
#### Response
```
{
  "status": "success",
  "message": "User retrieved",
  "data": {
    "_id": "",
    "name": "",
    "username": "",
    "bio": "",
    "avatar": "",
    "createdAt": "",
    "followingCount": number,
    "followersCount": number,
    "hasMeBlocked": boolean,
    "blocked": boolean,
    "following": boolean
  }
}
```
### Follow or unfollow a user
```http
  POST /users/:userId/follow
```
#### Request
```
Requires Authorization header with Bearer token
```
#### Response
```
{
  "status": "success",
  "message": "User followed" | "User unfollowed"
}
```
### Block or unblock a user
```http
  POST /users/:userId/block
```
#### Request
```
Requires Authorization header with Bearer token
```
#### Response
```
{
  "status": "success",
  "message": "User blocked" | "User unblocked"
}
```
### Get followers list of a user
```http
  GET /users/:userId/followers
  PARAMS: date
```
#### Request
```
Requires Authorization header with Bearer token
```
#### Response
```
{
  "status": "success",
  "message": "Followers retrieved",
  "data": [
    {
      "_id": "",
      "name": "",
      "username": "",
      "bio": "",
      "avatar": ""
    },
    { ... },
    ...
  ]
}
```
### Get following list of a user
```http
  GET /users/:userId/following
  PARAMS: date
```
#### Request
```
Requires Authorization header with Bearer token
```
#### Response
```
{
  "status": "success",
  "message": "Following retrieved",
  "data": [
    {
      "_id": "",
      "name": "",
      "username": "",
      "bio": "",
      "avatar": ""
    },
    { ... },
    ...
  ]
}
```
### Search users (by name or username)
```http
  GET /users/search
  PARAMS: query, date
```
#### Request
```
Requires Authorization header with Bearer token
```
#### Response
```
{
  "status": "success",
  "message": "Users retrieved",
  "data": [
    {
      "_id": "",
      "name": "",
      "username": "",
      "bio": "",
      "avatar": "",
      "createdAt": "",
      "followingCount": number,
      "followersCount": number
    }, 
    { ... },
    ...
  ]
}
```
### Get tweets from user
```http
  GET /tweets/user/:userId
  PARAMS: date
```
#### Request
```
Requires Authorization header with Bearer token
```
#### Response
```
{
  "status": "success",
  "message": "Tweets from user retrieved",
  "data": [
    {
      "_id": "",
      "content": "",
      "image": "" | null,
      "isReplyTo": null,
      "isEdited": boolean,
      "createdAt": "",
      "user": [
        {
          "_id": "",
          "name": "",
          "username": "",
          "avatar": ""
        }
      ],
      "liked": boolean,
      "likeCount": number,
      "replyCount": number
    },
    { ... },
    ...
  ]
}
```
### Get reply tweets from user
```http
  GET /tweets/user/:userId/replies
  PARAMS: date
```
#### Request
```
Requires Authorization header with Bearer token
```
#### Response
```
{
  "status": "success",
  "message": "Replies from user retrieved",
  "data": [
    {
      "_id": "",
      "content": "",
      "image": "" | null,
      "isReplyTo": "",
      "isEdited": boolean,
      "createdAt": "",
      "user": [
        {
          "_id": "",
          "name": "",
          "username": "",
          "avatar": ""
        }
      ],
      "liked": boolean,
      "likeCount": number,
      "replyCount": number
    },
    { ... },
    ...
  ]
}
```
### Get liked tweets from user
```http
  GET /tweets/user/:userId/liked
  PARAMS: date
```
#### Request
```
Requires Authorization header with Bearer token
```
#### Response
```
{
  "status": "success",
  "message": "Liked tweets from user retrieved",
  "data": [
    {
      "_id": "",
      "content": "",
      "image": "" | null,
      "isReplyTo": "" | null,
      "isEdited": boolean,
      "createdAt": "",
      "user": [
        {
          "_id": "",
          "name": "",
          "username": "",
          "avatar": ""
        }
      ],
      "liked": boolean,
      "likeCount": number,
      "replyCount": number
    },
    { ... },
    ...
  ]
}
```
### Search tweets
```http
  GET /tweets/search
  PARAMS: query, date
```
#### Request
```
Requires Authorization header with Bearer token
```
#### Response
```
{
  "status": "success",
  "message": "Tweets retrieved",
  "data": [
    {
      "_id": "",
      "content": "",
      "image": "" | null,
      "isReplyTo": null,
      "isEdited": boolean,
      "createdAt": "",
      "user": [
        {
          "_id": "",
          "name": "",
          "username": "",
          "avatar": ""
        }
      ],
      "liked": boolean,
      "likeCount": number,
      "replyCount": number
    },
    { ... },
    ...
  ]
}
```
### Get recent tweets
```http
  GET /tweets/recent
  PARAMS: date
```
#### Request
```
Requires Authorization header with Bearer token
```
#### Response
```
{
  "status": "success",
  "message": "Recent tweets retrieved",
  "data": [
    {
      "_id": "",
      "content": "",
      "image": "" | null,
      "isReplyTo": null,
      "isEdited": boolean,
      "createdAt": "",
      "user": [
        {
          "_id": "",
          "name": "",
          "username": "",
          "avatar": ""
        }
      ],
      "liked": boolean,
      "likeCount": number,
      "replyCount": number
    },
    { ... },
    ...
  ]
}
```
### Get following tweets
```http
  GET /tweets/following
  PARAMS: date
```
#### Request
```
Requires Authorization header with Bearer token
```
#### Response
```
{
  "status": "success",
  "message": "Following tweets retrieved",
  "data": [
    {
      "_id": "",
      "content": "",
      "image": "" | null,
      "isReplyTo": null,
      "isEdited": boolean,
      "createdAt": "",
      "user": [
        {
          "_id": "",
          "name": "",
          "username": "",
          "avatar": ""
        }
      ],
      "liked": boolean,
      "likeCount": number,
      "replyCount": number
    },
    { ... },
    ...
  ]
}
```
### Create tweet 
```http
  POST /tweets/
```
#### Request
```
Requires Authorization header with Bearer token

body: {
  "content": string,
  "image"?: string
}
```
#### Response
```
{
  "status": "success",
  "message": "Tweet created",
  "data": {
    "content": "",
    "image": "" | null,
    "userId": "",
    "isReplyTo": null,
    "isEdited": false,
    "_id": "",
    "createdAt": "",
    "updatedAt": ""
  }
}
```
### Get tweet
```http
  GET /tweets/:tweetId
```
#### Request
```
Requires Authorization header with Bearer token
```
#### Response
```
{
  "status": "success",
  "message": "Tweet retrieved",
  "data": {
    "_id": "",
    "content": "",
    "image": "" | null,
    "isReplyTo": "" | null,
    "isEdited": boolean,
    "createdAt": "",
    "user": [
      {
        "_id": "",
        "name": "",
        "username": "",
        "avatar": ""
      }
    ],
    "liked": boolean,
    "likeCount": number,
    "replyCount": number
  }
}
```
### Update tweet
```http
  PUT /tweets/:tweetId
```
#### Request
```
Requires Authorization header with Bearer token

body: {
  "content"?: string,
  "image"?: string
}
```
#### Response
```
{
  "status": "success",
  "message": "Tweet updated",
  "data": {
    "_id": "",
    "content": "",
    "image": "" | null,
    "userId": "",
    "isReplyTo": "" | null,
    "isEdited": boolean,
    "createdAt": "",
    "updatedAt": ""
  }
}
```
### Delete tweet
```http
  DELETE /tweets/:tweetId
```
#### Request
```
Requires Authorization header with Bearer token
```
#### Response
```
{
  "status": "success",
  "message": "Tweet deleted",
  "data": {
    "_id": "",
    "content": "",
    "image": "" | null,
    "userId": "",
    "isReplyTo": "" | null,
    "isEdited": boolean,
    "createdAt": "",
    "updatedAt": ""
  }
}
```
### Reply to a tweet 
```http
  POST /tweets/:tweetId/reply
```
#### Request
```
Requires Authorization header with Bearer token

body: {
  "content": string,
  "image"?: string
}
```
#### Response
```
{
  "status": "success",
  "message": "Tweet created",
  "data": {
    "content": "",
    "image": "" | null,
    "userId": "",
    "isReplyTo": null,
    "isEdited": false,
    "_id": "",
    "createdAt": "",
    "updatedAt": ""
  }
}
```
### Like or unlike a tweet 
```http
  POST /tweets/:tweetId/like
```
#### Request
```
Requires Authorization header with Bearer token
```
#### Response
```
{
  "status": "success",
  "message": "Tweet liked" | "Tweet unliked"
}
```
### Get replies from a tweet
```http
  GET /tweets/:tweetId/replies
  PARAMS: date
```
#### Request
```
Requires Authorization header with Bearer token
```
#### Response
```
{
  "status": "success",
  "message": "Tweet replies retrieved",
  "data": [
    {
      "_id": "",
      "content": "",
      "image": "" | null,
      "isReplyTo": "",
      "isEdited": boolean,
      "createdAt": "",
      "user": [
        {
          "_id": "",
          "name": "",
          "username": "",
          "avatar": ""
        }
      ],
      "liked": boolean,
      "likeCount": number,
      "replyCount": number
    },
    { ... },
    ...
  ]
}
```