const { sendGeneralResponse } = require("../utils/responseHelper");
const Service = require('../models/serviceModel');



const createService = async (req, res) => {
    const { services, subServices } = req.body;

     if (!services || !subServices || !Array.isArray(subServices)) {
        return sendGeneralResponse(res, false, 'Required fields are missing or invalid', 400);
    }

    try {
         const newService = new Service({
            services,
            subServices
        });

        await newService.save();
        sendGeneralResponse(res, true, 'Service with multiple subservices created successfully', 201, newService);
    } catch (error) {
        console.error('Service creation error:', error);
        sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};





// const getServices = async (req, res) => {
//     try {
//         // Fetch all services from the database
//         const services = await Service.find({});

//         // Group services by type
//         const groupedServices = services.reduce((acc, service) => {
//             if (!acc[service.type]) {
//                 acc[service.type] = [];
//             }
//             acc[service.type].push(service.name);
//             return acc;
//         }, {});

//         // Format the response
//          sendGeneralResponse(res, true, 'Services retrieved successfully', 200, groupedServices);
//     } catch (error) {
//         console.error('Get services error:', error);
//         sendGeneralResponse(res, false, 'Internal server error', 500);
//     }
// };




const getServices = async (req, res) => {
    try {
         const services = await Service.find({});

         sendGeneralResponse(res, true, 'Services retrieved successfully', 200, services);
    } catch (error) {
        console.error('Get services error:', error);
        sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};

 






const updateService = async (req, res) => {
    const { id } = req.params;  
    const { addSubService, removeSubService, updateSubService, newSubService } = req.body;

    try {
        // Fetch the service by ID
        const service = await Service.findById(id);
        if (!service) {
            return sendGeneralResponse(res, false, 'Service not found', 404);
        }

        // Add a new subservice to the array
        if (addSubService) {
            if (!service.subServices.includes(addSubService)) {
                service.subServices.push(addSubService);
            } else {
                return sendGeneralResponse(res, false, 'Subservice already exists', 400);
            }
        }

        // Remove a subservice from the array
        if (removeSubService) {
            const index = service.subServices.indexOf(removeSubService);
            if (index > -1) {
                service.subServices.splice(index, 1);
            } else {
                return sendGeneralResponse(res, false, 'Subservice not found', 400);
            }
        }

        // Update or correct the spelling of a subservice
        if (updateSubService && newSubService) {
            const index = service.subServices.indexOf(updateSubService);
            if (index > -1) {
                service.subServices[index] = newSubService;
            } else {
                return sendGeneralResponse(res, false, 'Subservice to update not found', 400);
            }
        }

        // Save the updated service document
        await service.save();

        sendGeneralResponse(res, true, 'Service updated successfully', 200, service);
    } catch (error) {
        console.error('Service update error:', error);
        sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};

module.exports = { createService  , getServices , updateService};
