// http functions to fetch data from the server
// import localstorage to get the API key
import axios from 'axios';
import { API_HOST } from './host';
export const apiFetchStock = async () => {
  try {
    // get apikey from local storage
    const apiKey = localStorage.getItem('ApiKey');
    if (!apiKey) {
      throw new Error('API key not found in local storage');
    }
    // set the API key in the headers
    axios.defaults.headers.common['Authorization'] = `ApiKey ${apiKey}`;
    const response = await axios.get(`${API_HOST}/stock`);  
    return response.data;   
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export const apiCreateSales = async (salesData) => {
  try {
    // get apikey from local storage
    const apiKey = localStorage.getItem('ApiKey');
    if (!apiKey) {
      throw new Error('API key not found in local storage');
    }
    // set the API key in the headers
    axios.defaults.headers.common['Authorization'] = `ApiKey ${apiKey}`;
    const response = await axios.post(`${API_HOST}/sales`, salesData);
    return response.data;
  } catch (error) {
    console.error('Error creating sales:', error);
    throw error;
  }
}

