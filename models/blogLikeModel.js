const mongoose = require('mongoose');

const bloglikeSchema  = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    blog_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BlogPost',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const BlogLike  = mongoose.model('BlogLike', bloglikeSchema);

module.exports = BlogLike  ;
