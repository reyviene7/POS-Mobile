require('dotenv').config();

module.exports = {
  expo: {
    name: 'EggCited',
    slug: 'pos-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: 'https://res.cloudinary.com/dzwjjpvdb/image/upload/v1750444683/EggCited/q0bpsuj3u1t6xmmobxvk.jpg',
    scheme: 'posmobile',
    jsEngine: "jsc",
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.reyviene7.posmobile',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: 'https://res.cloudinary.com/dzwjjpvdb/image/upload/v1750444683/EggCited/q0bpsuj3u1t6xmmobxvk.jpg',
        backgroundColor: '#FEDD56',
      },
      jsEngine: "jsc",
      edgeToEdgeEnabled: true,
      package: 'com.reyviene7.posmobile',
      permissions: [
        'BLUETOOTH',
        'BLUETOOTH_ADMIN',
        'BLUETOOTH_CONNECT',
        'BLUETOOTH_SCAN',
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION' 
      ]
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
          image: 'https://res.cloudinary.com/dzwjjpvdb/image/upload/v1750505959/EggCited/ixxau4ellammx0drebgo.png',
          resizeMode: 'contain',    
          backgroundColor: '#FEDD56',
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
      apiBaseUrl: process.env.API_BASE_URL ?? 'https://theposwizard.com/api',
      apiTimeout: parseInt(process.env.API_TIMEOUT ?? '10000', 10),
      
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
      cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
      cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
    },
    owner: 'reyviene7',
  },
};