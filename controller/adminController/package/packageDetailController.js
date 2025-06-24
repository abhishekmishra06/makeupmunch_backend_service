const Package = require("../../../models/packageModel");
const { sendGeneralResponse } = require("../../../utils/responseHelper");

const getPackageById = async (req, res) => {
    try {
        const packageId = req.params.id;
        const packageData = await Package.findById(packageId);

        if (!packageData) {

                return sendGeneralResponse(res, false, "Package not found", 404);

            
        }

        return sendGeneralResponse(
            res,
            true,
            "Package fetched successfully",
            200,
            packageData
        );
    } catch (error) {
        console.error("Error fetching package by ID:", error);

            return sendGeneralResponse(res, false, "Internal server error", 500);

    }
};


module.exports = { getPackageById };
