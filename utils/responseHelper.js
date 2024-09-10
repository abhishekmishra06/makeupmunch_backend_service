/**
 * Sends a custom error response.
 *
 * @param {Object} res  
 * @param {string} message  
 * @param {boolean} status  
 * @param {number} statusCode  
 *  * @param {Object|Array} [data=[]]  

 * @returns {Object} 
 */
function sendGeneralResponse(res, status, message, statusCode, data=[]) {

 
    return res.status(statusCode).json({
        
        status: status,
        message: message,
        data: data
    });
}

module.exports = {
    sendGeneralResponse: sendGeneralResponse
};
