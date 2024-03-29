const { ValidationError, NotFoundError, AuthorizationError } = require('../../models/errors');
const CommentService = require('../../services/comment.service');
const { upload, handleMulterException } = require('../../multer');
const PostService = require('../../services/posts.service');
const LikeService = require('../../services/like.service');
const FileService = require('../../services/file.service');
const { authenticate } = require('../../middleware');
const router = require('express').Router();
const Joi = require('joi');

router.get('/', [authenticate], all);

async function all(req, res) {
    console.log('posts/');

    try {
        let posts = await PostService.getPosts(req.user);
        return res.status(200).json(posts);
    } catch (e) {
        return res.status(500).json({ message: 'Unknown error' });
    }
}

router.get('/:_id/comments', [authenticate], post_comments);

async function post_comments(req, res) {
    console.log('posts/:_id/comments');

    const schema = Joi.string().length(24);

    try {
        const post_id = req.params._id;

        const { error, value } = schema.validate(post_id, { escapeHtml: true });
        if (error) throw new ValidationError(error.details[0].message);

        let comments = await CommentService.postComments(value);
        return res.status(200).json(comments);
    } catch (e) {
        if (e instanceof ValidationError) {
            return res.status(400).json({ message: e.message });
        }
        return res.status(500).json({ message: 'Unknown error' });
    }
}

router.post('/create', [authenticate, upload.single('image'), handleMulterException], create);

async function create(req, res) {
    console.log('posts/create');

    const schema = Joi.object().keys({
        text: Joi.string().required()
    });

    try {

        const current_user = req.user;
        const post_details = req.body;
        const post_file = req.file;

        const { error, value } = schema.validate(post_details, { escapeHtml: true });
        if (error) throw new ValidationError(error.details[0].message);

        let post = await PostService.createPost(value, current_user);

        if (post_file) {
            post = await FileService.SavePostImage(post, post_file);
        }

        return res.status(201).json(post);

    } catch (e) {
        if (e instanceof ValidationError) {
            return res.status(400).json({ message: e.message });
        }
        return res.status(500).json({ message: 'Unknown error' });
    }
}

router.delete('/delete', [authenticate], del);

async function del(req, res) {
    console.log('posts/delete');

    const schema = Joi.object().keys({
        _id: Joi.string().alphanum().length(24).required()
    });

    try {
        const post = req.body;
        const current_user = req.user;

        const { error, value } = schema.validate(post, { escapeHtml: true });
        if (error) throw new ValidationError(error.details[0].message);

        await PostService.delPost(value, current_user);
        return res.status(200).send();
    } catch (e) {
        if (e instanceof NotFoundError) {
            return res.status(404).json({ message: e.message });
        }
        if (e instanceof AuthorizationError) {
            return res.status(403).json({ message: e.message });
        }
        return res.status(500).json({ message: 'Unknown error' });
    }
}

router.get('/:_id/likes', [authenticate], likes);

async function likes(req, res) {
    console.log('posts/:_id/likes')

    const schema = Joi.string().length(24);

    try {
        const post_id = req.params._id;
        const current_user = req.user;

        const { error, value } = schema.validate(post_id, { escapeHtml: true });
        if (error) throw new ValidationError(error.details[0].message);

        let likes = await LikeService.getPostLikes(value, current_user);
        return res.status(200).json(likes);
    } catch (e) {
        if (e instanceof ValidationError) {
            return res.status(400).json({ message: e.message });
        }
        return res.status(500).json({ message: 'Unknown error' });
    }

}

module.exports = router