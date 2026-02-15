// Environment configuration
export const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  apiUrl: process.env.REACT_APP_API_URL || 'https://api.avtopapa.ru',
  appName: 'Автопапа',
  telegramBotToken: process.env.REACT_APP_TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.REACT_APP_TELEGRAM_CHAT_ID || '',
  yandexMetrikaId: process.env.REACT_APP_YANDEX_METRIKA_ID || '',
};

export default ENV;
