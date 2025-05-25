const express = require('express');
const multer = require('multer');
const { getAdminOverviewStats } = require('../controller/adminController/getAdminOverviewStatsController');
const errorHandler = require('../middleware/errorHandler');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });



router.get('/getOverviewStats', getAdminOverviewStats);


router.use(errorHandler);

module.exports = router;

