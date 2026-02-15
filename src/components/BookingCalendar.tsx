import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from '../utils/analytics';
import { useAuth } from '../context/AuthContext';
import { usePortalData } from '../context/PortalDataContext';
import { useSiteContent } from '../context/SiteContentContext';
import './BookingCalendar.css';

const BookingCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createBooking, getBusySlotsByDate } = usePortalData();
  const { siteContent } = useSiteContent();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [message, setMessage] = useState('');

  const timeSlots = siteContent.booking.timeSlots.length > 0
    ? siteContent.booking.timeSlots
    : ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];

  const getAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 0; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getAvailableTimeSlots = () => {
    if (!selectedDate) {
      return timeSlots;
    }
    const busySlots = getBusySlotsByDate(selectedDate);
    const today = new Date();
    const currentDateIso = today.toISOString().split('T')[0];
    if (selectedDate !== currentDateIso) {
      return timeSlots.filter((slot) => !busySlots.includes(slot));
    }

    const minutesNow = today.getHours() * 60 + today.getMinutes();
    const freeSlots = timeSlots.filter((slot) => {
      const [hours, minutes] = slot.split(':').map(Number);
      return hours * 60 + minutes > minutesNow + 30;
    });
    return freeSlots.filter((slot) => !busySlots.includes(slot));
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!user) {
      setMessage(siteContent.booking.needAuthText);
      navigate('/auth');
      return;
    }

    if (selectedDate && selectedTime) {
      const result = createBooking({
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        userEmail: user.email,
        carBrand: '-',
        carModel: '-',
        year: '-',
        problem: 'Запись через календарь',
        date: selectedDate,
        time: selectedTime
      });

      if (!result.ok) {
        setMessage(result.error || 'Не удалось создать запись');
        return;
      }

      const readableDate = new Date(selectedDate).toLocaleDateString('ru-RU');
      setMessage(`Запись подтверждена на ${readableDate} в ${selectedTime}.`);
      trackEvent('booking_slot_selected', { date: selectedDate, time: selectedTime });
      setSelectedDate('');
      setSelectedTime('');
    }
  };

  return (
    <section className="booking-calendar" id="booking">
      <div className="container">
        <div className="section-header">
          <h2>{siteContent.booking.title}</h2>
          <p>{siteContent.booking.subtitle}</p>
        </div>

        <div className="booking-content">
          <form onSubmit={handleBooking} className="booking-form">
            {message && <p>{message}</p>}
            <div className="form-group">
              <label htmlFor="date">{siteContent.booking.dateLabel}</label>
              <select
                id="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime('');
                }}
                required
              >
                <option value="">-- Выберите дату --</option>
                {getAvailableDates().map(date => (
                  <option key={date.toISOString()} value={date.toISOString().split('T')[0]}>
                    {date.toLocaleDateString('ru-RU', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="time">{siteContent.booking.timeLabel}</label>
              <select
                id="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                required
              >
                <option value="">-- Выберите время --</option>
                {getAvailableTimeSlots().map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-secondary">{siteContent.booking.submitText}</button>
          </form>

          <div className="booking-benefits">
            <h3>{siteContent.booking.benefitsTitle}</h3>
            <ul>
              {siteContent.booking.benefits.map((benefit) => (
                <li key={benefit}>✓ {benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingCalendar;
