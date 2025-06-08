const Package = require("../../../models/packageModel");
const { sendGeneralResponse } = require("../../../utils/responseHelper");

const deletePackageById = async (req, res) => {
    try {
        const packageId = req.params.id;

        const deletedPackage = await Package.findByIdAndDelete(packageId);

        if (!deletedPackage) {
            return sendGeneralResponse(res, false, "Package not found", 404);
        }

        return sendGeneralResponse(
            res,
            true,
            "Package deleted successfully",
            200,
            deletedPackage
        );
    } catch (error) {
        console.error("Error deleting package:", error);

        return sendGeneralResponse(res, false, "Internal server error", 500);

    }
};



module.exports = { deletePackageById };
