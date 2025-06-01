const { About, Experience, Certification, Product } = require('../models/artistProfileModel');

// ==================== ABOUT SECTION ====================

// Get About
const getAbout = async (req, res) => {
    try {
        const { artistId } = req.params;
        const about = await About.findOne({ artistId });
        
        res.status(200).json({
            success: true,
            data: about
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching about section',
            error: error.message
        });
    }
};

// Create or Update About
const createOrUpdateAbout = async (req, res) => {
    try {
        const { artistId } = req.params;
        const { description } = req.body;

        const aboutData = {
            artistId,
            description
        };

        const about = await About.findOneAndUpdate(
            { artistId },
            aboutData,
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'About section updated successfully',
            data: about
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating about section',
            error: error.message
        });
    }
};

// ==================== EXPERIENCE SECTION ====================

// Get All Experiences
const getExperiences = async (req, res) => {
    try {
        const { artistId } = req.params;
        const experiences = await Experience.find({ artistId }).sort({ year: -1 });
        
        res.status(200).json({
            success: true,
            data: experiences
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching experiences',
            error: error.message
        });
    }
};

// Add Experience
const addExperience = async (req, res) => {
    try {
        const { artistId } = req.params;
        const { year, company, description } = req.body;

        const experience = new Experience({
            artistId,
            year,
            company,
            description
        });

        await experience.save();

        res.status(201).json({
            success: true,
            message: 'Experience added successfully',
            data: experience
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding experience',
            error: error.message
        });
    }
};

// Update Experience
const updateExperience = async (req, res) => {
    try {
        const { experienceId } = req.params;
        const { year, company, description } = req.body;

        const experience = await Experience.findByIdAndUpdate(
            experienceId,
            {
                year,
                company,
                description
            },
            { new: true }
        );

        if (!experience) {
            return res.status(404).json({
                success: false,
                message: 'Experience not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Experience updated successfully',
            data: experience
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating experience',
            error: error.message
        });
    }
};

// Delete Experience
const deleteExperience = async (req, res) => {
    try {
        const { experienceId } = req.params;

        const experience = await Experience.findByIdAndDelete(experienceId);

        if (!experience) {
            return res.status(404).json({
                success: false,
                message: 'Experience not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Experience deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting experience',
            error: error.message
        });
    }
};

// ==================== CERTIFICATION SECTION ====================

// Get All Certifications
const getCertifications = async (req, res) => {
    try {
        const { artistId } = req.params;
        const certifications = await Certification.find({ artistId }).sort({ issueDate: -1 });
        
        res.status(200).json({
            success: true,
            data: certifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching certifications',
            error: error.message
        });
    }
};

// Add Certification
const addCertification = async (req, res) => {
    try {
        const { artistId } = req.params;
        const { name, issuingOrganization, issueDate, expiryDate, credentialId, certificateUrl } = req.body;

        const certification = new Certification({
            artistId,
            name,
            issuingOrganization,
            issueDate,
            expiryDate,
            credentialId,
            certificateUrl
        });

        await certification.save();

        res.status(201).json({
            success: true,
            message: 'Certification added successfully',
            data: certification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding certification',
            error: error.message
        });
    }
};

// Update Certification
const updateCertification = async (req, res) => {
    try {
        const { certificationId } = req.params;
        const { name, issuingOrganization, issueDate, expiryDate, credentialId, certificateUrl } = req.body;

        const certification = await Certification.findByIdAndUpdate(
            certificationId,
            {
                name,
                issuingOrganization,
                issueDate,
                expiryDate,
                credentialId,
                certificateUrl
            },
            { new: true }
        );

        if (!certification) {
            return res.status(404).json({
                success: false,
                message: 'Certification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Certification updated successfully',
            data: certification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating certification',
            error: error.message
        });
    }
};

// Delete Certification
const deleteCertification = async (req, res) => {
    try {
        const { certificationId } = req.params;

        const certification = await Certification.findByIdAndDelete(certificationId);

        if (!certification) {
            return res.status(404).json({
                success: false,
                message: 'Certification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Certification deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting certification',
            error: error.message
        });
    }
};

// ==================== PRODUCTS SECTION ====================

// Get All Products
const getProducts = async (req, res) => {
    try {
        const { artistId } = req.params;
        const products = await Product.find({ artistId }).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// Add Product
const addProduct = async (req, res) => {
    try {
        const { artistId } = req.params;
        const { category, productName } = req.body;

        const product = new Product({
            artistId,
            category,
            productName
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product added successfully',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding product',
            error: error.message
        });
    }
};

// Update Product
const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { category, productName } = req.body;

        const product = await Product.findByIdAndUpdate(
            productId,
            {
                category,
                productName
            },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};

// Delete Product
const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findByIdAndDelete(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
};

module.exports = {
    // About
    getAbout,
    createOrUpdateAbout,
    
    // Experience
    getExperiences,
    addExperience,
    updateExperience,
    deleteExperience,
    
    // Certification
    getCertifications,
    addCertification,
    updateCertification,
    deleteCertification,
    
    // Products
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct
}; 