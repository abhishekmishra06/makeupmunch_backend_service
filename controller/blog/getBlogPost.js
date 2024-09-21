const { sendGeneralResponse } = require('../../utils/responseHelper');
const BlogPost = require('../../models/blogPostModel');


const readBlogPosts = async (req, res) => {
    const { category, author_id, tags, post_id } = req.query;

    let query = {};

    if (post_id) {
        query._id = post_id;
    }
    if (category) {
        query.category = category;
    }
    if (author_id) {
        query.author = author_id;
    }
    if (tags) {
        query.tags = { $in: tags.split(',') };
    }

    try {
        const blogPosts = await BlogPost.find(query);

        if (blogPosts.length === 0) {
            return sendGeneralResponse(res, false, 'No blog posts found', 404);
        }

        sendGeneralResponse(res, true, 'Blog posts retrieved successfully', 200, blogPosts);
    } catch (error) {
        console.error('Error retrieving blog posts:', error);
        sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};



module.exports = {readBlogPosts}