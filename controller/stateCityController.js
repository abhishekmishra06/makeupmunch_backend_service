 const axios = require('axios');
const { sendGeneralResponse } = require('../utils/responseHelper');
  require('dotenv').config();
 
const API_BASE_URL = 'https://www.universal-tutorial.com/api';
const { STATE_CITY_API_TOKEN, STATE_CITY_EMAIL } = process.env;

let authToken = null;

const getAuthToken = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getaccesstoken`, {
      headers: {
        'Accept': 'application/json',
        'api-token': STATE_CITY_API_TOKEN,
        'user-email': STATE_CITY_EMAIL
      }
    });
    authToken = response.data.auth_token;
    return authToken;
  } catch (error) {
    console.error('Error fetching auth token:', error);
    throw error;
  }
};

const fetchData = async (endpoint) => {
  if (!authToken) {
    await getAuthToken();
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
};












const getCountries = async (req, res) => {
    try {
      const countries = await fetchData('countries');
    //   res.json(countries);
      sendGeneralResponse(res, true, 'All countries', 200, countries);

    } catch (error) {
      sendGeneralResponse(res, false, 'Internal Server Error', 500 );
     }
  };
  
 
  const getStates = async (req, res) => {
    const { countryName } = req.params;
    try {
      const states = await fetchData(`states/${countryName}`);
    //   res.json(states);
      const stateNames = states.map(state => state.state_name);

      sendGeneralResponse(res, true, 'All states', 200, stateNames);

    } catch (error) {
       sendGeneralResponse(res, false, 'Internal Server Error', 500 );
      

    }
  };
  
 
  const getCities = async (req, res) => {
    const { stateName } = req.params;
    try {
      const cities = await fetchData(`cities/${stateName}`);
      const cityNames = cities.map(city => city.city_name);

    //   res.json(cities);
       sendGeneralResponse(res, true, 'All city', 200, cityNames);

    } catch (error) {
       sendGeneralResponse(res, false, 'Internal Server Error', 500 );

    }
  };
  
  module.exports = {
    getCountries,
    getStates,
    getCities,
    fetchData
  };