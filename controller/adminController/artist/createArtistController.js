const { About, Experience, Certification, Product } = require("../../../models/artistProfileModel");
const { Artist } = require("../../../models/userModel");
const { sendGeneralResponse } = require("../../../utils/responseHelper");

const createArtist = async (req, res) => {
  try {
    const {
      businessName,
      username,
      email,
      password,
      phone,
      city,
      specialties,
      profile_img,
      availability,
      gender,
      isLogin,
      paymentMethods,
      advanceAmount,
      aboutDescription,
      experiences,
      certifications,
      products
    } = req.body;

    // Step 1: Create Artist
    const existingArtist = await Artist.findOne({ email });
    if (existingArtist) {
      return sendGeneralResponse(res, false, "Artist already exists with this email", 400, null);
    }

    const newArtist = new Artist({
      businessName,
      username,
      email,
      password, // You may want to hash this if needed
      phone,
      city,
      specialties,
      profile_img,
      availability,
      gender,
      role: 'artist',
      providedByUs: true,
      isLogin,
      paymentMethods,
      advanceAmount
    });

    const savedArtist = await newArtist.save();

    // Step 2: Create About
    if (aboutDescription) {
      await About.create({
        artistId: savedArtist._id,
        description: aboutDescription
      });
    }

    // Step 3: Create Experiences
    if (Array.isArray(experiences)) {
      for (const exp of experiences) {
        await Experience.create({
          artistId: savedArtist._id,
          year: exp.year,
          company: exp.company,
          description: exp.description
        });
      }
    }

    // Step 4: Create Certifications
    if (Array.isArray(certifications)) {
      for (const cert of certifications) {
        await Certification.create({
          artistId: savedArtist._id,
          name: cert.name,
          issuingOrganization: cert.issuingOrganization,
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate || null,
          credentialId: cert.credentialId || '',
          certificateUrl: cert.certificateUrl || ''
        });
      }
    }

    // Step 5: Create Products
    if (Array.isArray(products)) {
      for (const product of products) {
        await Product.create({
          artistId: savedArtist._id,
          category: product.category,
          productName: product.productName
        });
      }
    }

    return sendGeneralResponse(res, true, "Artist created successfully", 201, savedArtist);
  } catch (error) {
    console.error("Error creating artist:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { createArtist };
