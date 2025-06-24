const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Package = require('../models/packageModel');

// Load environment variables from main .env file
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.URL);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

// Package data
const packagesData = [
  {
    "name": "Basic Fruits Facial",
    "price": "199",
    "service_details": [
      "Facial",
      "Fruits facial products"
    ]
  },
  {
    "name": "Basic Waxing - Full Hands with Underarms",
    "price": "199",
    "service_details": [
      "Waxing",
      "Full hands",
      "Underarms",
      "Normal Aloe Vera wax",
      "White chocolate wax"
    ]
  },
  {
    "name": "Rica Wax - Full Hands with Underarms",
    "price": "299",
    "service_details": [
      "Waxing",
      "Full hands",
      "Underarms",
      "Rica wax"
    ]
  },
  {
    "name": "Diamond + Gold Facial",
    "price": "350",
    "service_details": [
      "Facial",
      "Diamond facial",
      "Gold facial products"
    ]
  },
  {
    "name": "Standard Waxing - Full Hand + Full Legs with Underarms",
    "price": "399",
    "service_details": [
      "Waxing",
      "Full hands",
      "Full legs",
      "Underarms",
      "Normal Aloe Vera wax",
      "White chocolate wax"
    ]
  },
  {
    "name": "Rica Wax - Full Hand + Full Legs with Underarms",
    "price": "499",
    "service_details": [
      "Waxing",
      "Full hands",
      "Full legs",
      "Underarms",
      "Rica wax"
    ]
  },
  {
    "name": "Premium Facial - Jovees + VLCC + Lotus Diamond with D Tan",
    "price": "499",
    "service_details": [
      "Facial",
      "Jovees products",
      "VLCC products",
      "Lotus Diamond",
      "D Tan treatment"
    ]
  },
  {
    "name": "Complete Body Waxing - Normal Wax",
    "price": "550",
    "service_details": [
      "Waxing",
      "Full body wax",
      "Normal Aloe Vera wax",
      "White chocolate wax"
    ]
  },
  {
    "name": "EVERYDAY FRESH KIT",
    "price": "599",
    "service_details": [
      "BB Cream/Compact",
      "Kajal/Eyeliner",
      "Lip Balm/Tint"
    ]
  },
  {
    "name": "DAILY HAIR CARE",
    "price": "650",
    "service_details": [
      "Hair Wash & Blow Dry",
      "Basic Hair Trim"
    ]
  },
  {
    "name": "LIP & NAIL PERFECTION",
    "price": "700",
    "service_details": [
      "Lipstick Application (Choice of Shade)",
      "Basic Nail Paint (Hands OR Feet)"
    ]
  },
  {
    "name": "QUICK GROOMING FIX",
    "price": "749",
    "service_details": [
      "Eyebrow Threading",
      "Express Manicure OR Express Pedicure"
    ]
  },
  {
    "name": "EYE GLAM PACKAGE",
    "price": "850",
    "service_details": [
      "Kajal/Eyeliner Application",
      "Mascara Application",
      "Basic Eyeshadow Blend"
    ]
  },
  {
    "name": "STUDENT DISCOUNT COMBO",
    "price": "950",
    "service_details": [
      "Basic Haircut",
      "Eyebrow Threading",
      "Express Pedicure"
    ]
  },
  {
    "name": "DAILY GLOW ESSENTIALS",
    "price": "999",
    "service_details": [
      "Foundation/Cushion Compact",
      "Kajal",
      "Small Eyeshadow Palette (Neutrals)",
      "Matte Liquid Lipstick"
    ]
  },
  {
    "name": "Luxury Facial - Lotus + Kanpeki with D Tan",
    "price": "999",
    "service_details": [
      "Facial",
      "Lotus products",
      "Kanpeki products",
      "D Tan treatment"
    ]
  },
  {
    "name": "MEN'S GROOMING ESSENTIALS",
    "price": "1000",
    "service_details": [
      "Hair Cut",
      "Beard Trim",
      "Face Cleanup"
    ]
  },
  {
    "name": "EXPRESS PAMPER SESSION",
    "price": "1199",
    "service_details": [
      "Express Facial (Cleanse, Scrub, Massage)",
      "Basic Manicure",
      "Basic Pedicure"
    ]
  },
  {
    "name": "Basic Hair Smoothing - Glatt Brand",
    "price": "1200",
    "service_details": [
      "Hair Smoothing",
      "Glatt brand products",
      "Price varies with hair length"
    ]
  },
  {
    "name": "INSTANT REFRESH FACIAL",
    "price": "1400",
    "service_details": [
      "Moisturizing",
      "Quick Face Massage"
    ]
  },
  {
    "name": "HALDI RADIANCE LOOK (BASIC)",
    "price": "1599",
    "service_details": [
      "Natural Dewy Makeup Look",
      "Simple Braided Hairstyle/Half-Updo"
    ]
  },
  {
    "name": "SKIN BRIGHTENING FACIAL",
    "price": "1800",
    "service_details": [
      "Deep Cleansing",
      "Exfoliation",
      "Brightening Mask",
      "Face Massage"
    ]
  },
  {
    "name": "HALDI RADIANCE LOOK (DELUXE)",
    "price": "1999",
    "service_details": [
      "Natural Dewy Makeup Look",
      "Simple Braided Hairstyle/Half-Updo",
      "Basic Nail Paint Application"
    ]
  },
  {
    "name": "Ultra Premium Facial - O3 + Ceshmara + Lotus High Quality",
    "price": "1999",
    "service_details": [
      "Facial",
      "O3 products",
      "Ceshmara products",
      "Lotus high quality products",
      "Premium treatment"
    ]
  },
  {
    "name": "Premium Rica Wax - Full Body",
    "price": "1999",
    "service_details": [
      "Waxing",
      "Full body wax",
      "Rica wax",
      "Premium treatment"
    ]
  },
  {
    "name": "PARTY READY GLAM (EYES FOCUS)",
    "price": "2099",
    "service_details": [
      "Eye Makeup (Smokey/Glitter)",
      "Basic Base Makeup",
      "Lipstick Application",
      "Hair Styling (Blowout/Curls)"
    ]
  },
  {
    "name": "Premium Hair Smoothing - Loreal",
    "price": "2200",
    "service_details": [
      "Hair Smoothing",
      "Loreal brand products",
      "Price varies with hair length"
    ]
  },
  {
    "name": "FESTIVE READY MAKEOVER",
    "price": "2300",
    "service_details": [
      "Light Festive Makeup",
      "Simple Festive Hairstyle",
      "Nail Art (Basic)"
    ]
  },
  {
    "name": "FULL PARTY GLAM",
    "price": "2499",
    "service_details": [
      "Full Party Makeup (Contouring, Highlight, Eye Focus)",
      "Party Hairstyle (Elaborate Curls/Updo)"
    ]
  },
  {
    "name": "HAIR & FACE REVIVE",
    "price": "2699",
    "service_details": [
      "Hair Spa Treatment",
      "Full Clean-up Facial",
      "Basic Haircut (Trim/U-Cut)"
    ]
  },
  {
    "name": "DELUXE MANI-PEDI COMBO",
    "price": "2799",
    "service_details": [
      "Spa Manicure",
      "Spa Pedicure",
      "Foot Massage"
    ]
  },
  {
    "name": "WEEKEND WIND-DOWN",
    "price": "2850",
    "service_details": [
      "Full Body Massage (Relaxing)",
      "Aroma Pedicure"
    ]
  },
  {
    "name": "PRE-EVENT QUICK FIX",
    "price": "2999",
    "service_details": [
      "Basic Party Makeup",
      "Party Hairstyle",
      "Express Manicure"
    ]
  },
  {
    "name": "THE BRIDAL GLOW ESSENTIALS",
    "price": "8999",
    "service_details": [
      "Bridal Makeup (HD/Airbrush)",
      "Bridal Hairstyle (Classic Bun/Braids)",
      "Draping (Saree/Lehenga)",
      "Pre-Bridal Facial (Glow-focused)"
    ]
  },
  {
    "name": "GROOM'S ESSENTIAL PREP",
    "price": "9999",
    "service_details": [
      "Hair Cut & Styling",
      "Beard Grooming/Shave",
      "Face Cleanup",
      "Basic Manicure",
      "Basic Pedicure"
    ]
  },
  {
    "name": "PRE-WEDDING PAMPER",
    "price": "11999",
    "service_details": [
      "Full Body Waxing (Rica)",
      "Luxury Manicure",
      "Luxury Pedicure",
      "Bridal Hair Spa",
      "De-Tan Pack (Full Body)"
    ]
  },
  {
    "name": "PRE-WEDDING REVITALIZER",
    "price": "14999",
    "service_details": [
      "Deep Cleansing Facial",
      "De-Tan Pack (Face & Neck)",
      "Full Body Massage (Relaxing)",
      "Hair Spa Treatment",
      "Luxury Manicure & Pedicure"
    ]
  },
  {
    "name": "MEHENDI & SANGEET READY",
    "price": "14999",
    "service_details": [
      "Mehendi Makeup (Natural Look)",
      "Sangeet Makeup (Glam Look)",
      "Two Event Hairstyles",
      "Basic Nail Art (Hands)"
    ]
  },
  {
    "name": "COMPLETE CHARM BRIDAL",
    "price": "19999",
    "service_details": [
      "Bridal Makeup (Premium HD/Airbrush)",
      "Bridal Hairstyle (Advanced)",
      "Draping",
      "Pre-Bridal Cleanup Facial",
      "Full Body Waxing",
      "Manicure & Pedicure"
    ]
  },
  {
    "name": "THE DAPPER GROOM PACKAGE",
    "price": "22999",
    "service_details": [
      "Premium Hair Cut & Styling",
      "Designer Beard Styling/Shave",
      "Advanced Groom Facial (e.g., Gold Facial)",
      "Full Body Polishing",
      "Spa Manicure & Pedicure",
      "Pre-Wedding Consultation (Hair/Skin)"
    ]
  },
  {
    "name": "BRIDAL CELEBRATION PACKAGE",
    "price": "24999",
    "service_details": [
      "Bridal Makeup & Hair (Main Event)",
      "Reception Makeup & Hair",
      "Draping (Two Looks)",
      "Bridal Glow Facial",
      "Full Body Polishing"
    ]
  },
  {
    "name": "THE GRAND BRIDAL OPULENCE",
    "price": "35000",
    "service_details": [
      "Signature Airbrush Bridal Makeup",
      "Custom Bridal Hairstyle with Extensions (if needed)",
      "Multiple Draping Styles (Trial Included)",
      "Premium Pre-Bridal Skin Treatment (e.g., Hydrafacial)",
      "Luxury Body Polish & Spa"
    ]
  },
  {
    "name": "DESIGNER BRIDAL JOURNEY",
    "price": "49000",
    "service_details": [
      "Two Look Changes (Wedding & Reception Makeup & Hair)",
      "Personalized Makeup & Hair Consultation",
      "Advanced Skincare Regimen (3 Sessions - e.g., Chemical Peel, Microdermabrasion)",
      "Designer Nail Extensions/Art",
      "Full Body Contouring & De-stress Massage"
    ]
  },
  {
    "name": "ELITE WEDDING WEEK PAMPER",
    "price": "65000",
    "service_details": [
      "Bridal Makeup & Hair (Wedding Day)",
      "Engagement/Sangeet Makeup & Hair",
      "Reception Makeup & Hair",
      "Full Pre-Bridal Series (Facials, Body Polishing, Waxing, Mani-Pedi)",
      "Personalized Stylist Assistance (Draping & Accessories)",
      "Keratin/Protein Hair Treatment"
    ]
  },
  {
    "name": "THE ROYAL BRIDE EXPERIENCE",
    "price": "79000",
    "service_details": [
      "Celebrity-Style Airbrush Makeup for Main Event",
      "Customized Hair Styling for Multiple Events",
      "Personalized Pre-Bridal Skincare Plan (6 Sessions)",
      "Advanced Nail Art with Gel Extensions",
      "Full Body De-Tan & Glow Treatment",
      "Relaxing Aromatherapy Full Body Massage",
      "Assistant for Touch-ups (up to 4 hours)"
    ]
  }
];

// Transform data to match the Package model schema
const transformPackageData = (packages) => {
  return packages.map(pkg => ({
    name: pkg.name,
    price: pkg.price,
    services: pkg.service_details // Transform services to services
  }));
};

// Function to add packages to database
const addPackages = async () => {
  try {
    await connectDB();
    
    // Transform the data
    const transformedPackages = transformPackageData(packagesData);
    
    // Check if packages already exist to avoid duplicates
    const existingPackages = await Package.find({});
    const existingPackageNames = existingPackages.map(pkg => pkg.name);
    
    // Filter out packages that already exist
    const newPackages = transformedPackages.filter(pkg => 
      !existingPackageNames.includes(pkg.name)
    );
    
    if (newPackages.length === 0) {
      console.log('All packages already exist in the database.');
      return;
    }
    
    // Insert new packages
    const result = await Package.insertMany(newPackages);
    console.log(`Successfully added ${result.length} packages to the database.`);
    
    // Log the added packages
    result.forEach((pkg, index) => {
      console.log(`${index + 1}. ${pkg.name} - ${pkg.price}`);
    });
    
  } catch (error) {
    console.error('Error adding packages:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Function to clear all packages (optional - for testing)
const clearAllPackages = async () => {
  try {
    await connectDB();
 
  } catch (error) {
    console.error('Error clearing packages:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--clear')) {
  clearAllPackages();
} else {
  addPackages();
} 