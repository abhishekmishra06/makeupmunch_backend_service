const express = require('express');
const { submitFeedback, preRegisterUser } = require('../controller/new_ai_fedback/campaignController');
const router = express.Router();

router.post('/feedback', submitFeedback);
router.post('/pre-register', preRegisterUser);

module.exports = router;
