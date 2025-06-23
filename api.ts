import axios from 'axios';
import { Alert } from 'react-native';
import config from './SpringBootConfig';

const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      Alert.alert('Network Error', 'Unable to connect to the server. Please check your connection.');
    } else if (error.response.status === 401) {
      Alert.alert('Unauthorized', 'Please log in again.');
    } else if (error.response.status === 404) {
      Alert.alert('Not Found', 'The requested resource was not found.');
    } else {
      Alert.alert('Error', error.response.data.message || 'An error occurred.');
    }
    return Promise.reject(error);
  }
);

export default api;