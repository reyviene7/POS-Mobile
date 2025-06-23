import axios from 'axios';
import Constants from 'expo-constants';

export const CloudinaryConfig = {
  CLOUD_NAME: Constants.expoConfig?.extra?.cloudinaryCloudName,
  API_KEY: Constants.expoConfig?.extra?.cloudinaryApiKey,
  UPLOAD_PRESET: Constants.expoConfig?.extra?.cloudinaryUploadPreset,
  UPLOAD_URL: `https://api.cloudinary.com/v1_1/${Constants.expoConfig?.extra?.cloudinaryCloudName}/image/upload`,
};

export const uploadToCloudinary = async (uri: string) => {
  const formData = new FormData();
  formData.append('file', {
    uri,
    type: 'image/jpeg', 
    name: 'upload.jpg',
  } as any); 

  formData.append('upload_preset', CloudinaryConfig.UPLOAD_PRESET!);

  try {
    const response = await axios.post(CloudinaryConfig.UPLOAD_URL!, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};