// controllers/fcmController.js
// const FcmToken = require('../../models/fcmtoken_model/');

const fcmtoken_model = require("../../models/fcmtoken_model");

const storeFcmToken = async (req, res) => {
  const { fcmToken } = req.body;

  if (!fcmToken) {
    return res.status(400).json({ success: false, message: 'FCM token is required' });
  }

  try {
    const exists = await fcmtoken_model.findOne({ token: fcmToken });
    if (!exists) {
      await FcmToken.create({ token: fcmToken });
    }

    return res.status(200).json({ success: true, message: 'FCM token stored successfully' });
  } catch (error) {
    console.error('Error storing FCM token:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { storeFcmToken };
