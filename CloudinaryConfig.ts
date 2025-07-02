import axios from 'axios';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || Constants.manifest?.extra;

export const CloudinaryConfig = {
  CLOUD_NAME: extra?.cloudinaryCloudName,
  API_KEY: extra?.cloudinaryApiKey,
  UPLOAD_PRESET: extra?.cloudinaryUploadPreset,
  UPLOAD_URL: `https://api.cloudinary.com/v1_1/${extra?.cloudinaryCloudName}/image/upload`,
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