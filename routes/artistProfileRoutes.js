const express = require('express');
const router = express.Router();
const {
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
} = require('../controller/artistProfileController');

// ==================== ABOUT ROUTES ====================
router.get('/about/:artistId', getAbout);
router.post('/about/:artistId', createOrUpdateAbout);
router.put('/about/:artistId', createOrUpdateAbout);

// ==================== EXPERIENCE ROUTES ====================
router.get('/experience/:artistId', getExperiences);
router.post('/experience/:artistId', addExperience);
router.put('/experience/:experienceId', updateExperience);
router.delete('/experience/:experienceId', deleteExperience);

// ==================== CERTIFICATION ROUTES ====================
router.get('/certifications/:artistId', getCertifications);
router.post('/certifications/:artistId', addCertification);
router.put('/certifications/:certificationId', updateCertification);
router.delete('/certifications/:certificationId', deleteCertification);

// ==================== PRODUCTS ROUTES ====================
router.get('/products/:artistId', getProducts);
router.post('/products/:artistId', addProduct);
router.put('/products/:productId', updateProduct);
router.delete('/products/:productId', deleteProduct);

module.exports = router; 