const { Customer } = require('../models/userModel');
const { Booking } = require('../models/bookingModel');

const updateAddressAfterBooking = async (req, res) => {
  try {
    const { bookingId, userId } = req.body;

    // Find the booking to get address details
    const booking = await Booking.findById(bookingId).populate('user_id');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify user ownership
    if (booking.user_id._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this booking address'
      });
    }

    const bookingAddress = booking.user_info?.address;
    
    if (!bookingAddress) {
      return res.status(400).json({
        success: false,
        message: 'No address found in booking'
      });
    }

    // Find user and update addresses
    const user = await Customer.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize addresses array if it doesn't exist
    if (!user.addresses) {
      user.addresses = [];
    }

    // Check if address already exists (matching street, area, pincode, city)
    const addressExists = user.addresses.some(addr => 
      addr.street === bookingAddress.street &&
      addr.area === bookingAddress.area &&
      addr.pincode === bookingAddress.pincode &&
      addr.city === bookingAddress.city
    );

    if (!addressExists) {
      // Add new address with additional metadata
      const newAddress = {
        street: bookingAddress.street,
        area: bookingAddress.area,
        pincode: bookingAddress.pincode,
        city: bookingAddress.city,
        landmark: bookingAddress.landmark,
        isDefault: user.addresses.length === 0, // Make first address default
        addedFromBooking: true,
        bookingId: bookingId,
        dateAdded: new Date()
      };

      user.addresses.push(newAddress);
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Address saved successfully',
        data: {
          savedAddress: newAddress,
          totalAddresses: user.addresses.length
        }
      });
    } else {
      return res.status(200).json({
        success: true,
        message: 'Address already exists in your saved addresses',
        data: {
          totalAddresses: user.addresses.length
        }
      });
    }

  } catch (error) {
    console.error('Error updating address after booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const getBookingAddress = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        address: booking.user_info?.address,
        bookingId: booking._id
      }
    });

  } catch (error) {
    console.error('Error getting booking address:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const getUserSavedAddresses = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await Customer.findById(userId).select('addresses');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        addresses: user.addresses || [],
        totalAddresses: user.addresses ? user.addresses.length : 0
      }
    });

  } catch (error) {
    console.error('Error getting user addresses:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.body;
    
    const user = await Customer.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.addresses || user.addresses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No addresses found for user'
      });
    }

    // Reset all addresses to not default
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });

    // Set the selected address as default
    const selectedAddress = user.addresses.id(addressId);
    
    if (!selectedAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    selectedAddress.isDefault = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Default address updated successfully',
      data: {
        defaultAddress: selectedAddress
      }
    });

  } catch (error) {
    console.error('Error setting default address:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const updateBookingAddress = async (req, res) => {
  try {
    const { bookingId, address } = req.body;

    if (!bookingId || !address) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and address are required'
      });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update the booking address
    booking.user_info.address = {
      street: address.street,
      area: address.area,
      city: address.city,
      pincode: address.pincode,
      landmark: address.landmark || ''
    };

    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking address updated successfully',
      data: {
        booking: booking
      }
    });

  } catch (error) {
    console.error('Error updating booking address:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  updateAddressAfterBooking,
  getBookingAddress,
  getUserSavedAddresses,
  setDefaultAddress,
  updateBookingAddress
}; 