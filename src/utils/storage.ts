import { Booking, Review, User } from '../types';
import { DEFAULT_SITE_CONTENT } from '../config/defaultSiteContent';
import { SiteContent } from '../types/siteContent';

const USERS_KEY = 'avtopapa_users';
const BOOKINGS_KEY = 'avtopapa_bookings';
const REVIEWS_KEY = 'avtopapa_reviews';
const SESSION_KEY = 'avtopapa_session_user_id';
const SITE_CONTENT_KEY = 'avtopapa_site_content';

const DEFAULT_SUPERUSER: User = {
  id: 'superuser-default',
  name: 'Суперпользователь',
  email: 'superadmin@avtopapa.local',
  phone: '+7 (999) 000-00-00',
  password: 'admin12345',
  role: 'admin',
  createdAt: new Date('2026-01-01T00:00:00.000Z').toISOString()
};

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'review-seed-1',
    userId: 'seed',
    userName: 'Александр',
    car: 'Skoda Octavia',
    rating: 5,
    text: 'Быстро нашли проблему по электрике и устранили за один день. Четко по смете.',
    createdAt: new Date('2025-12-10T10:00:00.000Z').toISOString()
  },
  {
    id: 'review-seed-2',
    userId: 'seed',
    userName: 'Екатерина',
    car: 'KIA Sportage',
    rating: 5,
    text: 'Делала ТО и диагностику подвески. Все объяснили, показали старые детали, сервисом довольна.',
    createdAt: new Date('2025-12-14T10:00:00.000Z').toISOString()
  },
  {
    id: 'review-seed-3',
    userId: 'seed',
    userName: 'Игорь',
    car: 'BMW 5',
    rating: 4,
    text: 'Кузовной ремонт сделали аккуратно, цвет попали идеально. По срокам уложились.',
    createdAt: new Date('2025-12-20T10:00:00.000Z').toISOString()
  }
];

const parse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const mergeWithDefaults = <T>(defaults: T, value: unknown): T => {
  if (Array.isArray(defaults)) {
    return (Array.isArray(value) ? value : defaults) as T;
  }

  if (defaults && typeof defaults === 'object') {
    const result: Record<string, unknown> = {};
    const defaultsRecord = defaults as Record<string, unknown>;
    const valueRecord = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

    Object.keys(defaultsRecord).forEach((key) => {
      result[key] = mergeWithDefaults(defaultsRecord[key], valueRecord[key]);
    });

    return result as T;
  }

  return (value !== undefined ? value : defaults) as T;
};

const setJson = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const initializeStorage = () => {
  const users = parse<User[]>(localStorage.getItem(USERS_KEY), []);
  if (!users.some((item) => item.email === DEFAULT_SUPERUSER.email)) {
    users.push(DEFAULT_SUPERUSER);
    setJson(USERS_KEY, users);
  }

  if (!localStorage.getItem(REVIEWS_KEY)) {
    setJson(REVIEWS_KEY, DEFAULT_REVIEWS);
  }

  if (!localStorage.getItem(BOOKINGS_KEY)) {
    setJson(BOOKINGS_KEY, [] as Booking[]);
  }

  if (!localStorage.getItem(SITE_CONTENT_KEY)) {
    setJson(SITE_CONTENT_KEY, DEFAULT_SITE_CONTENT);
  }
};

export const getUsers = (): User[] => {
  return parse<User[]>(localStorage.getItem(USERS_KEY), []);
};

export const saveUsers = (users: User[]) => {
  setJson(USERS_KEY, users);
};

export const getBookings = (): Booking[] => {
  return parse<Booking[]>(localStorage.getItem(BOOKINGS_KEY), []);
};

export const saveBookings = (bookings: Booking[]) => {
  setJson(BOOKINGS_KEY, bookings);
};

export const getReviews = (): Review[] => {
  return parse<Review[]>(localStorage.getItem(REVIEWS_KEY), []);
};

export const saveReviews = (reviews: Review[]) => {
  setJson(REVIEWS_KEY, reviews);
};

export const getSessionUserId = (): string | null => {
  return localStorage.getItem(SESSION_KEY);
};

export const setSessionUserId = (userId: string) => {
  localStorage.setItem(SESSION_KEY, userId);
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const createUserEntity = (input: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: User['role'];
}): User => {
  return {
    id: makeId(),
    name: input.name,
    email: input.email.toLowerCase(),
    phone: input.phone,
    password: input.password,
    role: input.role || 'user',
    createdAt: new Date().toISOString()
  };
};

export const createBookingEntity = (
  input: Omit<Booking, 'id' | 'createdAt' | 'status'> & { status?: Booking['status'] }
): Booking => {
  return {
    ...input,
    id: makeId(),
    status: input.status || 'new',
    createdAt: new Date().toISOString()
  };
};

export const createReviewEntity = (input: Omit<Review, 'id' | 'createdAt'>): Review => {
  return {
    ...input,
    id: makeId(),
    createdAt: new Date().toISOString()
  };
};

export const getSiteContent = (): SiteContent => {
  const raw = parse<unknown>(localStorage.getItem(SITE_CONTENT_KEY), DEFAULT_SITE_CONTENT);
  return mergeWithDefaults(DEFAULT_SITE_CONTENT, raw);
};

export const saveSiteContent = (siteContent: SiteContent) => {
  setJson(SITE_CONTENT_KEY, siteContent);
};

export const resetSiteContent = () => {
  setJson(SITE_CONTENT_KEY, DEFAULT_SITE_CONTENT);
};
