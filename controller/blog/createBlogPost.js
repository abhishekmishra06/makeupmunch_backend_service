 const BlogPost = require('../../models/blogPostModel');
const { sendGeneralResponse } = require('../../utils/responseHelper');

const createBlogPost = async (req, res) => {
    if (!req.body) {
        return sendGeneralResponse(res, false, 'Request body is missing', 400);
    }

    const { title, content, category, tags, author_id } = req.body;

    if (!title) {
        return sendGeneralResponse(res, false, 'Title is required', 400);
    }
    if (!content) {
        return sendGeneralResponse(res, false, 'Content is required', 400);
    }
    if (!category) {
         return sendGeneralResponse(res, false, 'Category is required', 400);
    }
    if (!author_id) {
        return sendGeneralResponse(res, false, 'Author ID is required', 400);
    }

    try {
        const newBlogPost = new BlogPost({
            title,
            content,
            category,
            tags,
            author: author_id,
            status: 'published',  
            createdAt: Date.now()
        });

        await newBlogPost.save();

        sendGeneralResponse(res, true, 'Blog post created successfully', 201, newBlogPost);
    } catch (error) {
        console.error('Error creating blog post:', error);
        sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};


module.exports = {createBlogPost}