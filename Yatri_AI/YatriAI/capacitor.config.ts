import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yatri.ai',
  appName: 'YatriAI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // For development, uncomment to use local server:
    // url: 'http://localhost:5173',
    // cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
};

export default config;





