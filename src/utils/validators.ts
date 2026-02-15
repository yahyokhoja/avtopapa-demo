// String formatting and validation utilities

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const normalized = cleaned.startsWith('8') ? `7${cleaned.slice(1)}` : cleaned;
  if (normalized.length >= 11) {
    return `+7 (${normalized.slice(1, 4)}) ${normalized.slice(4, 7)}-${normalized.slice(7, 9)}-${normalized.slice(9, 11)}`;
  }

  const base = normalized.startsWith('7') ? normalized.slice(1) : normalized;
  let formatted = '+7';
  if (base.length > 0) {
    formatted += ` (${base.slice(0, 3)}`;
  }
  if (base.length >= 3) {
    formatted += ')';
  }
  if (base.length > 3) {
    formatted += ` ${base.slice(3, 6)}`;
  }
  if (base.length > 6) {
    formatted += `-${base.slice(6, 8)}`;
  }
  if (base.length > 8) {
    formatted += `-${base.slice(8, 10)}`;
  }
  return formatted;
};

export const normalizePhoneNumber = (phone: string): string =>
  phone.replace(/\D/g, '').replace(/^8/, '7');

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  const normalized = normalizePhoneNumber(phone);
  return /^7\d{10}$/.test(normalized);
};

export const validateYear = (year: string): boolean => {
  const yearNum = parseInt(year, 10);
  const currentYear = new Date().getFullYear();
  return yearNum >= 1900 && yearNum <= currentYear + 1;
};
