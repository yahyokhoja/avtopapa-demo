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
