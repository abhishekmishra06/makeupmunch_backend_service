const Package = require("../../../models/packageModel");
const { sendGeneralResponse } = require("../../../utils/responseHelper");

const updatePackageById = async (req, res) => {
    try {
        const packageId = req.params.id;
        const updatedData = req.body;

        const updatedPackage = await Package.findByIdAndUpdate(packageId, updatedData, {
            new: true,
            runValidators: true,
        });

        if (!updatedPackage) {
            return sendGeneralResponse(res, false, "Package not found", 404);


        }

        return sendGeneralResponse(
            res,
            true,
            "Package updated successfully",
            200,
            updatedPackage
        );
    } catch (error) {
        console.error("Error updating package:", error);
        return sendGeneralResponse(  res, false, "Internal server error",  500);

      
    }
};



module.exports = { updatePackageById };
