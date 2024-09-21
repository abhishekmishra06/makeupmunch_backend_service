const { sendGeneralResponse } = require('../../utils/responseHelper');
const BlogPost = require('../../models/blogPostModel');


const deleteBlogPost = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return sendGeneralResponse(res, false, 'Post ID is required', 400);
    }

    try {
        const deletedPost = await BlogPost.findByIdAndDelete(id);

        if (!deletedPost) {
            return sendGeneralResponse(res, false, 'Blog post not found', 404);
        }

        sendGeneralResponse(res, true, 'Blog post deleted successfully', 200);
    } catch (error) {
        console.error('Error deleting blog post:', error);
        sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};

module.exports = {deleteBlogPost}