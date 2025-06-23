import Constants from 'expo-constants';

// Interface for type safety
interface SpringBootConfig {
  API_BASE_URL: string;
  API_TIMEOUT: number;
}

// Override with app.json extra field if available
const config: SpringBootConfig = {
  API_BASE_URL: Constants.expoConfig?.extra?.apiBaseUrl,
  API_TIMEOUT: Constants.expoConfig?.extra?.API_TIMEOUT,
};

export default config;