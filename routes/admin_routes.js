const express = require('express');
const multer = require('multer');
const { getAdminOverviewStats } = require('../controller/adminController/getAdminOverviewStatsController');
const errorHandler = require('../middleware/errorHandler');
const { getAllUsersForAdmin } = require('../controller/adminController/userListController');
const { getAllBookingsForAdmin } = require('../controller/adminController/allBookingsController');
const { getAllArtistsForAdmin } = require('../controller/adminController/artistListController');
const { getUserDetailsForAdmin } = require('../controller/adminController/getUserDetailsForAdminController');
const { getArtistDetailsForAdmin } = require('../controller/adminController/getArtistDetailsForAdminController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });



router.get('/getOverviewStats', getAdminOverviewStats);
router.get('/getAllUsersForAdmin', getAllUsersForAdmin);
router.get('/getAllBookingsForAdmin', getAllBookingsForAdmin);
router.get('/getAllArtistsForAdmin', getAllArtistsForAdmin);
router.get('/getUserDetailsForAdmin/:userId', getUserDetailsForAdmin);

router.get('/getArtistDetailsForAdmin/:artistId', getArtistDetailsForAdmin);

router.use(errorHandler);

module.exports = router;

