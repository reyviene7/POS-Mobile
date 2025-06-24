require('dotenv').config();

module.exports = {
  expo: {
    name: 'EggCited',
    slug: 'pos-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: 'https://res.cloudinary.com/dzwjjpvdb/image/upload/v1750444683/EggCited/q0bpsuj3u1t6xmmobxvk.jpg',
    scheme: 'posmobile',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: 'https://res.cloudinary.com/dzwjjpvdb/image/upload/v1750444683/EggCited/q0bpsuj3u1t6xmmobxvk.jpg',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: 'com.reyviene7.posmobile',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: 'https://res.cloudinary.com/dzwjjpvdb/image/upload/v1750444683/EggCited/q0bpsuj3u1t6xmmobxvk.jpg',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: 'https://res.cloudinary.com/dzwjjpvdb/image/upload/v1750444683/EggCited/q0bpsuj3u1t6xmmobxvk.jpg',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '80ca0597-91d3-4a4c-ae0b-8fbc1be8b388',
      },
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8080',
      apiTimeout: parseInt(process.env.API_TIMEOUT || '10000', 10),
      
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
      cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
      cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
    },
    owner: 'reyviene7',
  },
};