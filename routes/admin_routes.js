const express = require('express');
const multer = require('multer');
const { getAdminOverviewStats } = require('../controller/adminController/getAdminOverviewStatsController');
const errorHandler = require('../middleware/errorHandler');
const { getAllUsersForAdmin } = require('../controller/adminController/userListController');
const { getAllBookingsForAdmin } = require('../controller/adminController/allBookingsController');
const { getAllArtistsForAdmin } = require('../controller/adminController/artistListController');
const { getUserDetailsForAdmin } = require('../controller/adminController/getUserDetailsForAdminController');
const { getArtistDetailsForAdmin } = require('../controller/adminController/getArtistDetailsForAdminController');
const { getAllPackagesForAdmin } = require('../controller/adminController/adminPackageListController');
const { getPackageById } = require('../controller/adminController/package/packageDetailController');
const { updatePackageById } = require('../controller/adminController/package/packageUpdateController');
const { deletePackageById } = require('../controller/adminController/package/packageDeleteController');
const { getBookingDetailsById } = require('../controller/adminController/booking/bookingDetailController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });



router.get('/getOverviewStats', getAdminOverviewStats);



router.get('/getAllUsersForAdmin', getAllUsersForAdmin);
router.get('/getUserDetailsForAdmin/:userId', getUserDetailsForAdmin);



router.get('/getAllArtistsForAdmin', getAllArtistsForAdmin);
router.get('/getArtistDetailsForAdmin/:artistId', getArtistDetailsForAdmin);
// router.put("/artist/:artistId", updateArtistDetailsForAdmin);
// router.delete("/artist/:artistId", deleteArtistByAdmin);



router.get("/getAllPackagesForAdmin", getAllPackagesForAdmin);
router.get("/packages/:id", getPackageById);
router.put("/packages/:id", updatePackageById);
router.delete("/packages/:id", deletePackageById);



router.get('/getAllBookingsForAdmin', getAllBookingsForAdmin);
router.get('/bookingDetail/:bookingId', getBookingDetailsById);

router.use(errorHandler);

module.exports = router;

 