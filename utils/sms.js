const axios = require('axios');

 
const sendSMS = async (phone, otpMessage) => {
    const fast2smsAPIKey = 'OyhJatNpsPLTXrzjSwD3nGCKfA70uH2b5Fc6qiQgVmxMUEYodl1haKoW8GsCQL6e3krNjIOEgnRmiSYt'; 
    
    try {
        const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
            route: 'q', // Make sure this matches the route for transactional/OTP messages
            // sender_id: 'FSTSMS',
            message: otpMessage,  
            language: 'english',
            numbers: phone 
        }, {
            headers: {
                'authorization': fast2smsAPIKey,
             }
        });

        console.log('OTP sent successfully:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.log(error.response.data); 

        console.error('Error sending OTP:', error);
        return { success: false, error: error.message };
    }
}; 
  
module.exports = { sendSMS };
 