// Environment configuration
export const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  apiUrl: process.env.REACT_APP_API_URL || 'https://api.avtopapa.ru',
  appName: 'Автопапа',
};

export default ENV;
