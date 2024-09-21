
const { sendGeneralResponse } = require('../../utils/responseHelper');
const BlogPost = require('../../models/blogPostModel');

const updateBlogPost = async (req, res) => {
    if (!req.body || !req.params.id) {
        return sendGeneralResponse(res, false, 'Request body or post ID is missing', 400);
    }

    const { title, content, category, tags } = req.body;
    const post_id = req.params.id;

    try {
        const updatedPost = await BlogPost.findByIdAndUpdate(post_id, {
            $set: {
                title,
                content,
                category,
                tags
            }
        }, { new: true });

        if (!updatedPost) {
            return sendGeneralResponse(res, false, 'Blog post not found', 404);
        }

        sendGeneralResponse(res, true, 'Blog post updated successfully', 200, updatedPost);
    } catch (error) {
        console.error('Error updating blog post:', error);
        sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};




module.exports = {updateBlogPost}