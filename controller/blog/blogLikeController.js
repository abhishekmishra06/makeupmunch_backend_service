const BlogLike = require('../../models/blogLikeModel');
const BlogPost = require('../../models/blogPostModel');
const { sendGeneralResponse } = require('../../utils/responseHelper');
 

const likeBlogPost = async (req, res) => {
    const { user_id, blog_id } = req.body;

    if (!user_id || !blog_id) {
        return sendGeneralResponse(res, false, 'User ID and Blog ID are required', 400);
    }

    try {
        // Check if the blog post exists
        const blog = await BlogPost.findById(blog_id);
        if (!blog) {
            return sendGeneralResponse(res, false, 'Blog post not found', 404);
        }

        // Check if the user has already liked this blog post
        const existingLike = await BlogLike.findOne({ user_id, blog_id });
        if (existingLike) {
            return sendGeneralResponse(res, false, 'You have already liked this blog post', 400);
        }

        // Save the new like
        const newLike = new BlogLike({ user_id, blog_id });
        await newLike.save();

        // Respond with success
        sendGeneralResponse(res, true, 'Blog post liked successfully', 201, newLike);
    } catch (error) {
        console.error('Error liking blog post:', error);
        sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};

module.exports = { likeBlogPost };
