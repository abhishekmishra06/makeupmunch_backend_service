const { sendGeneralResponse } = require("./responseHelper");

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
};


const validateRequiredFields = ( res, body, fields) => {
    for (const field of fields) {
        if (!body[field]) {
            return sendGeneralResponse(res, false, `${field.charAt(0).toUpperCase() + field.slice(1)} is required`, 400);
        }
    }
    return null;
  };
  
  const validateRequiredAddressFields = (res, address, fields) => {
    for (const field of fields) {
        if (!address[field]) {
            return sendGeneralResponse(res, false, `Address ${field} is required`, 400);
        }
    }
    return null;
  };
  
//   const validateServicesFormat = (services) => {
//     for (const service of services) {
//         if (!service.service || !Array.isArray(service.subServices) || service.subServices.length === 0) {
//             return sendGeneralResponse(res, false, 'Each service must have a name and at least one subService', 400);
//         }
//     }
//     return null;
//   };




// const validateServicesFormat = (res, services) => {
//     if (!Array.isArray(services) || services.length === 0) {
//         return sendGeneralResponse(res, false, 'Services are required for artists', 400);
//     }

//     for (const service of services) {
//         if (!service.service || !Array.isArray(service.subServices) || service.subServices.length === 0) {
//             return sendGeneralResponse(res, false, 'Each service must have a name and at least one subService', 400);
//         }

//         for (const subService of service.subServices) {
//             if (!subService.name || typeof subService.price !== 'number' || subService.price <= 0) {
//                 return sendGeneralResponse(res, false, 'Each subService must have a valid name and a positive price', 400);
//             }
//         }
//     }

//     return null; // No error
// };



const validateServicesFormat=(res, services, role) =>{
    // Check if services is an array and not empty
    if (!Array.isArray(services) || services.length === 0) {
      return sendGeneralResponse(res, false, "No services provided", 400);
    }
    
    // Loop through each service to validate serviceName and subServices
    for (const service of services) {
      if (!service.serviceName) {
        return sendGeneralResponse(res, false, "Each service must have a name", 400);
      }
  
      // Check if subServices exists and has at least one element
      if (!Array.isArray(service.subServices) || service.subServices.length === 0) {
        return sendGeneralResponse(res, false, "Each service must have at least one subService", 400);
      }
  
      // Validate each subService
      for (const subService of service.subServices) {
        if (!subService.subServiceName || !subService.subServicePrice) {
          return sendGeneralResponse(res, false, "Subservice must have a name and price", 400);
        }
      }
    }
    return null;  // No validation errors
  }

module.exports = {
     validateEmail, validatePhone ,validateRequiredFields ,  validateRequiredAddressFields ,  validateServicesFormat
}; 










