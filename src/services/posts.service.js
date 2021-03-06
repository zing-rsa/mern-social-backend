const { NotFoundError, AuthorizationError } = require('../models/errors');
const { ObjectId } = require('mongodb');
const db = require('../mongo').db();

let posts = db.collection('posts');
let comments = db.collection('comments');

const createPost = async (post, current_user) => {

    post = {
        ...post,
        timestamp: new Date(),
        owner: current_user._id
    }

    let inserted_post = await posts.insertOne(post);

    return {
        ...post,
        _id: inserted_post.insertedId.toHexString()
    }
}

const getPosts = async () => {

    const pipeline = [
        {
            '$lookup': {
                'from': 'comments',
                'localField': '_id',
                'foreignField': 'parent',
                'as': 'comments'
            }
        },
        {
            '$lookup': {
                'from': 'users',
                'localField': 'owner',
                'foreignField': '_id',
                'as': 'owner'
            }
        },
        {
            "$unwind": "$owner"
        },
        {
            "$project": {
                "owner.email": 0,
                "owner.bio": 0,
                "owner.pass": 0,
                "owner.roles": 0
            }
        },
        {
            '$sort': {
                'timestamp': -1
            }
        }
    ]

    const data = await posts.aggregate(pipeline).toArray();

    return data;
}

const getUserPosts = async (user_id) => {

    const pipeline = [
        {
            '$match': {
                owner: ObjectId(user_id)
            }
        },
        {
            '$lookup': {
                'from': 'comments',
                'localField': '_id',
                'foreignField': 'parent',
                'as': 'comments'
            }
        },
        {
            '$lookup': {
                'from': 'users',
                'localField': 'owner',
                'foreignField': '_id',
                'as': 'owner'
            }
        },
        {
            "$unwind": "$owner"
        },
        {
            "$project": {
                "owner.email": 0,
                "owner.bio": 0,
                "owner.pass": 0,
                "owner.roles": 0
            }
        },
        {
            '$sort': {
                'timestamp': -1
            }
        }
    ]

    let user_posts = await posts.aggregate(pipeline).toArray();
    
    return user_posts;
}

const delPost = async (post, current_user) => {

    const post_query = { _id: ObjectId(post._id) }
    const comment_query = { parent: ObjectId(post._id) }

    let existing_post = await posts.findOne(post_query);
    if (!existing_post) throw new NotFoundError('Post does not exist');

    if (!existing_post.owner.equals(current_user._id) && !current_user.roles.includes('admin')) {
        throw new AuthorizationError("Action not permitted");
    }

    await comments.deleteMany(comment_query);
    await posts.deleteOne(post_query);

    return;
}

module.exports = {
    createPost,
    getUserPosts,
    getPosts,
    delPost
}