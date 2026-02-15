export interface TelegramLeadPayload {
  name: string;
  email: string;
  phone: string;
  carBrand: string;
  carModel: string;
  year: string;
  problem: string;
  preferredDate: string;
  preferredTime: string;
}

const BOT_TOKEN = process.env.REACT_APP_TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.REACT_APP_TELEGRAM_CHAT_ID;

const buildLeadMessage = (payload: TelegramLeadPayload) => {
  return [
    'Новая заявка с сайта Автопапа',
    '',
    `Имя: ${payload.name}`,
    `Телефон: ${payload.phone}`,
    `Email: ${payload.email}`,
    `Авто: ${payload.carBrand} ${payload.carModel || '-'}`,
    `Год: ${payload.year || '-'}`,
    `Проблема: ${payload.problem}`,
    `Желаемая дата: ${payload.preferredDate || '-'}`,
    `Желаемое время: ${payload.preferredTime || '-'}`
  ].join('\n');
};

export const isTelegramConfigured = () => Boolean(BOT_TOKEN && CHAT_ID);

export const sendLeadToTelegram = async (payload: TelegramLeadPayload) => {
  if (!BOT_TOKEN || !CHAT_ID) {
    throw new Error('Telegram integration is not configured');
  }

  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: buildLeadMessage(payload)
    })
  });

  if (!response.ok) {
    throw new Error('Failed to send message to Telegram');
  }
};
