const Package = require("../../models/packageModel");
const { sendGeneralResponse } = require("../../utils/responseHelper");

const getAllPackagesForAdmin = async (req, res) => {
    try {
        const packages = await Package.find().sort({ createdAt: -1 });

        return sendGeneralResponse(
            res,
            true,
            "All packages fetched successfully",
            200,
            packages
        );
    } catch (error) {
        console.error("Error fetching packages:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = { getAllPackagesForAdmin };
