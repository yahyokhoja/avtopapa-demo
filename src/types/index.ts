// Type definitions for the application

export interface Service {
  id: number;
  icon: string;
  title: string;
  description: string;
}

export interface BookingRequest {
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
}

export interface ServiceRequest {
  name: string;
  email: string;
  phone: string;
  carBrand: string;
  carModel?: string;
  year?: string;
  problem: string;
}

export interface Contact {
  id: number;
  icon: string;
  title: string;
  content: string | JSX.Element;
}

export interface WorkingHours {
  START: string;
  END: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  carBrand: string;
  carModel: string;
  year: string;
  problem: string;
  date: string;
  time: string;
  status: 'new' | 'in_progress' | 'done' | 'cancelled';
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  car: string;
  rating: number;
  text: string;
  createdAt: string;
}
