import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Booking, Review } from '../types';
import {
  createBookingEntity,
  createReviewEntity,
  getBookings,
  getReviews,
  initializeStorage,
  saveBookings,
  saveReviews
} from '../utils/storage';

interface CreateBookingPayload {
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
}

interface CreateReviewPayload {
  userId: string;
  userName: string;
  car: string;
  rating: number;
  text: string;
}

interface PortalDataContextValue {
  bookings: Booking[];
  reviews: Review[];
  createBooking: (payload: CreateBookingPayload) => { ok: boolean; error?: string };
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  getBusySlotsByDate: (date: string) => string[];
  createReview: (payload: CreateReviewPayload) => { ok: boolean; error?: string };
  updateReview: (reviewId: string, updates: Partial<Pick<Review, 'car' | 'rating' | 'text'>>) => { ok: boolean; error?: string };
  deleteReview: (reviewId: string) => void;
}

const PortalDataContext = createContext<PortalDataContextValue | undefined>(undefined);

export const PortalDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    initializeStorage();
    setBookings(getBookings());
    setReviews(getReviews());
  }, []);

  const createBooking: PortalDataContextValue['createBooking'] = (payload) => {
    const busySlots = bookings
      .filter((item) => item.date === payload.date && item.status !== 'cancelled')
      .map((item) => item.time);

    if (busySlots.includes(payload.time)) {
      return { ok: false, error: 'Это время уже занято, выберите другой слот' };
    }

    const nextBooking = createBookingEntity(payload);
    const nextBookings = [...bookings, nextBooking].sort((a, b) => {
      const left = `${a.date}T${a.time}`;
      const right = `${b.date}T${b.time}`;
      return left.localeCompare(right);
    });
    setBookings(nextBookings);
    saveBookings(nextBookings);
    return { ok: true };
  };

  const updateBookingStatus: PortalDataContextValue['updateBookingStatus'] = (bookingId, status) => {
    const nextBookings = bookings.map((item) => (item.id === bookingId ? { ...item, status } : item));
    setBookings(nextBookings);
    saveBookings(nextBookings);
  };

  const getBusySlotsByDate: PortalDataContextValue['getBusySlotsByDate'] = (date) => {
    return bookings
      .filter((item) => item.date === date && item.status !== 'cancelled')
      .map((item) => item.time)
      .sort((a, b) => a.localeCompare(b));
  };

  const createReview: PortalDataContextValue['createReview'] = (payload) => {
    if (!payload.text.trim() || payload.text.trim().length < 10) {
      return { ok: false, error: 'Минимум 10 символов в отзыве' };
    }

    const nextReview = createReviewEntity({
      ...payload,
      text: payload.text.trim()
    });
    const nextReviews = [nextReview, ...reviews];
    setReviews(nextReviews);
    saveReviews(nextReviews);
    return { ok: true };
  };

  const updateReview: PortalDataContextValue['updateReview'] = (reviewId, updates) => {
    const nextText = updates.text?.trim();
    if (nextText !== undefined && nextText.length < 10) {
      return { ok: false, error: 'Минимум 10 символов в отзыве' };
    }

    const nextReviews = reviews.map((item) => {
      if (item.id !== reviewId) {
        return item;
      }
      return {
        ...item,
        ...updates,
        ...(nextText !== undefined ? { text: nextText } : {})
      };
    });
    setReviews(nextReviews);
    saveReviews(nextReviews);
    return { ok: true };
  };

  const deleteReview: PortalDataContextValue['deleteReview'] = (reviewId) => {
    const nextReviews = reviews.filter((item) => item.id !== reviewId);
    setReviews(nextReviews);
    saveReviews(nextReviews);
  };

  const value = useMemo(
    () => ({
      bookings,
      reviews,
      createBooking,
      updateBookingStatus,
      getBusySlotsByDate,
      createReview,
      updateReview,
      deleteReview
    }),
    [bookings, reviews]
  );

  return <PortalDataContext.Provider value={value}>{children}</PortalDataContext.Provider>;
};

export const usePortalData = () => {
  const context = useContext(PortalDataContext);
  if (!context) {
    throw new Error('usePortalData must be used within PortalDataProvider');
  }
  return context;
};
