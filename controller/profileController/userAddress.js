// controllers/addressController.js
const mongoose = require("mongoose");
const Address = require('../../models/userAddressModel');
const { sendGeneralResponse } = require('../../utils/responseHelper');
const { validateRequiredFields } = require('../../utils/validation');

const addUserAddress = async (req, res) => {
    const { userId, address } = req.body;

    const requiredFields = [
        'addressLine', 'city', 'state', 'pincode'
    ];

     if (!mongoose.Types.ObjectId.isValid(userId)) {
        return sendGeneralResponse(res, false, "Invalid userId", 400);
    }


        if (!address) {
        return sendGeneralResponse(res, false, "Address is required", 400);
    }


    const error = validateRequiredFields(res, address, ['addressLine', 'city', 'state', 'pincode']);
    if (error) return error;



 
    try {
        let userAddress = await Address.findOne({ userId });

        if (!userAddress) {
            userAddress = new Address({ userId, addresses: [address] });
        } else {
            userAddress.addresses.push(address);
        }

        await userAddress.save();

        return sendGeneralResponse(res, true, "Address saved successfully", 200, userAddress);


    } catch (error) {
        console.error('Add address error:', error);
        return sendGeneralResponse(res, false, "Internal server error", 500);


    }
};




const updateUserAddress = async (req, res) => {
    const { userId, addressId, updatedAddress } = req.body;


    const requiredFields = [
        'addressLine', 'city', 'state', 'pincode'
    ];




    const error = validateRequiredFields(res, req.body, requiredFields);
    if (error) return sendGeneralResponse(res, false, `${error}`, 400);


    try {
        const addressDoc = await Address.findOne({ userId });

        if (!addressDoc) {
            return sendGeneralResponse(res, false, "No addresses found for this user", 404);
        }

        const addressIndex = addressDoc.addresses.findIndex(addr => addr._id.toString() === addressId);

        if (addressIndex === -1) {
            return sendGeneralResponse(res, false, "Address not found", 404);
        }

        // Update the specific address object
        addressDoc.addresses[addressIndex] = {
            ...addressDoc.addresses[addressIndex]._doc,
            ...updatedAddress
        };

        await addressDoc.save();

        return sendGeneralResponse(res, true, "Address updated successfully", 200, addressDoc);
    } catch (error) {
        console.error("Update address error:", error);
        return sendGeneralResponse(res, false, "Internal server error", 500);
    }
};




const deleteUserAddress = async (req, res) => {
    const { userId, addressId } = req.body;


    console.log(userId)
    console.log(addressId)
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(addressId)) {
        return sendGeneralResponse(res, false, "Invalid userId or addressId", 400);
    }



    try {
        const addressDoc = await Address.findOne({ userId });

        if (!addressDoc) {
            return sendGeneralResponse(res, false, "No addresses found for this user", 404);
        }

        const filteredAddresses = addressDoc.addresses.filter(addr => addr._id.toString() !== addressId);

        if (filteredAddresses.length === addressDoc.addresses.length) {
            return sendGeneralResponse(res, false, "Address not found", 404);
        }

        addressDoc.addresses = filteredAddresses;
        await addressDoc.save();

        return sendGeneralResponse(res, true, "Address deleted successfully", 200, addressDoc);
    } catch (error) {
        console.error("Delete address error:", error);
        return sendGeneralResponse(res, false, "Internal server error", 500);
    }
};



const getUserAddresses = async (req, res) => {
    const { userId } = req.params;

    try {
        const addressDoc = await Address.findOne({ userId });

        if (!addressDoc) {
            return sendGeneralResponse(res, true, "No addresses found", 200, []);
        }

        return sendGeneralResponse(res, true, "Address fetched successfully", 200, addressDoc.addresses);
    } catch (error) {
        console.error("Get address error:", error);
        return sendGeneralResponse(res, false, "Internal server error", 500);
    }
};




module.exports = { addUserAddress, updateUserAddress, deleteUserAddress, getUserAddresses };
