// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://api.avtopapa.ru',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  }
};

// Contact information
export const CONTACT_INFO = {
  PHONE: '+7 (999) 123-45-67',
  PHONE_SECONDARY: '+7 (999) 876-54-32',
  EMAIL: 'info@avtopapa.ru',
  ADDRESS: 'Санкт-Петербург, Московский пр., 52',
  CITY: 'Санкт-Петербург',
};

// Working hours
export const WORKING_HOURS = {
  WEEKDAYS: {
    START: '09:00',
    END: '19:00'
  },
  SATURDAY: {
    START: '09:00',
    END: '19:00'
  },
  SUNDAY: {
    START: '10:00',
    END: '18:00'
  }
};

// Services list
export const SERVICES = [
  {
    id: 1,
    icon: '🔧',
    title: 'Техническое обслуживание',
    description: 'Регулярное ТО, замена масла, фильтров и расходников согласно регламенту производителя'
  },
  {
    id: 2,
    icon: '🚙',
    title: 'Ремонт кузова',
    description: 'Кузовной ремонт, покраска, восстановление геометрии и защита от коррозии'
  },
  {
    id: 3,
    icon: '⚙️',
    title: 'Ремонт двигателя',
    description: 'Диагностика и ремонт двигателя любой сложности с использованием оригинальных запчастей'
  },
  {
    id: 4,
    icon: '🛞',
    title: 'Шины и подвеска',
    description: 'Балансировка колес, ремонт и диагностика подвески, установка шин'
  },
  {
    id: 5,
    icon: '💻',
    title: 'Компьютерная диагностика',
    description: 'Полная диагностика всех систем автомобиля с использованием современного оборудования'
  },
  {
    id: 6,
    icon: '🔌',
    title: 'Электрооборудование',
    description: 'Ремонт электросистем, аккумуляторов, светотехники и стартеров'
  }
];

// Booking time slots
export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00'
];

// Car brands list
export const CAR_BRANDS = [
  'Лада', 'Hyundai', 'KIA', 'BMW', 'Mercedes-Benz', 'Toyota',
  'Honda', 'Volkswagen', 'Audi', 'Mazda', 'Nissan', 'Ford',
  'Chevrolet', 'Renault', 'Peugeot', 'Citroën', 'Volvo', 'Другое'
];

// Social media links
export const SOCIAL_LINKS = {
  VK: 'https://vk.com/avtopapa',
  INSTAGRAM: 'https://www.instagram.com/avtopapa',
  FACEBOOK: 'https://www.facebook.com/avtopapa'
};
