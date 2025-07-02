import Constants from 'expo-constants';

// Interface for type safety
interface SpringBootConfig {
  API_BASE_URL: string;
  API_TIMEOUT: number;
}

const extra = Constants.expoConfig?.extra || Constants.manifest?.extra;

// Override with app.json extra field if available
const config: SpringBootConfig = {
  API_BASE_URL: extra?.apiBaseUrl,
  API_TIMEOUT: extra?.API_TIMEOUT,
};

export default config;