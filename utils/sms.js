// const axios = require('axios');

 
// const sendSMS = async (phone, otpMessage) => {
    // const fast2smsAPIKey = 'OyhJatNpsPLTXrzjSwD3nGCKfA70uH2b5Fc6qiQgVmxMUEYodl1haKoW8GsCQL6e3krNjIOEgnRmiSYt'; 
    
//     try {
//         const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
//             route: 'otp', // Make sure this matches the route for transactional/OTP messages
//             // sender_id: 'JG-MKUPMN',
//             variables_values: otpMessage,
//              numbers: phone 
//         }, {
//             headers: {
//                 'authorization': fast2smsAPIKey,
//              }
//         });

//         console.log('OTP sent successfully:', response.data);
//         return { success: true, data: response.data };
//     } catch (error) {
//         console.log(error.response.data); 

//         console.error('Error sending OTP:', error);
//         return { success: false, error: error.message };
//     }
// }; 
  
// module.exports = { sendSMS };
  


const axios = require('axios');

const sendSMS = async (phone, otpMessage) => {
    const fast2smsAPIKey = 'OyhJatNpsPLTXrzjSwD3nGCKfA70uH2b5Fc6qiQgVmxMUEYodl1haKoW8GsCQL6e3krNjIOEgnRmiSYt'; 

    try { 
        const response = await axios.post(
            'https://www.fast2sms.com/dev/bulkV2',
            new URLSearchParams({
                variables_values: otpMessage,
                route: 'otp',
                numbers: phone
            }),
            {
                headers: {
                    'authorization': fast2smsAPIKey,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        console.log('OTP sent successfully:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error sending OTP:', error.response?.data || error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendSMS };
