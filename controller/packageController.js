const Package = require('../models/packageModel');

// Get all packages
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching packages', error: error.message });
  }
};

// Create new package
exports.createPackage = async (req, res) => {
  try {
    const newPackage = new Package(req.body);
    const savedPackage = await newPackage.save();
    res.status(201).json(savedPackage);
  } catch (error) {
    res.status(400).json({ message: 'Error creating package', error: error.message });
  }
};

// Update package
exports.updatePackage = async (req, res) => {
  try {
    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedPackage);
  } catch (error) {
    res.status(400).json({ message: 'Error updating package', error: error.message });
  }
};

// Delete package
exports.deletePackage = async (req, res) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting package', error: error.message });
  }
};