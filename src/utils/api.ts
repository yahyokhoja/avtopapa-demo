// API service utilities

import { API_CONFIG } from '../config/constants';
import { BookingRequest, ServiceRequest, ApiResponse } from '../types';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  /**
   * Generic fetch method
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...API_CONFIG.HEADERS,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Submit booking request
   */
  async submitBooking(booking: BookingRequest): Promise<ApiResponse<any>> {
    return this.request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    });
  }

  /**
   * Submit service request
   */
  async submitServiceRequest(request: ServiceRequest): Promise<ApiResponse<any>> {
    return this.request('/api/service-requests', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get available time slots for a specific date
   */
  async getAvailableSlots(date: string): Promise<string[]> {
    return this.request(`/api/bookings/available-slots?date=${date}`);
  }

  /**
   * Send contact message
   */
  async sendContactMessage(data: any): Promise<ApiResponse<any>> {
    return this.request('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export default new ApiService();
