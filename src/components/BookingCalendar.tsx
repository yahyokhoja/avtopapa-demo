import React, { useState } from 'react';
import './BookingCalendar.css';

const BookingCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
  ];

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && selectedTime) {
      alert(`Запись подтверждена на ${selectedDate} в ${selectedTime}`);
      setSelectedDate('');
      setSelectedTime('');
    }
  };

  return (
    <section className="booking-calendar" id="booking">
      <div className="container">
        <div className="section-header">
          <h2>Запись на обслуживание</h2>
          <p>Выберите удобную дату и время</p>
        </div>

        <div className="booking-content">
          <form onSubmit={handleBooking} className="booking-form">
            <div className="form-group">
              <label htmlFor="date">Выберите дату:</label>
              <select
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              >
                <option value="">-- Выберите дату --</option>
                {getAvailableDates().map(date => (
                  <option key={date.toISOString()} value={date.toLocaleDateString('ru-RU')}>
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
              <label htmlFor="time">Выберите время:</label>
              <select
                id="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                required
              >
                <option value="">-- Выберите время --</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-secondary">Подтвердить запись</button>
          </form>

          <div className="booking-benefits">
            <h3>Преимущества записи через сайт</h3>
            <ul>
              <li>✓ Быстрая и удобная запись</li>
              <li>✓ Нет очередей</li>
              <li>✓ Гарантированное время</li>
              <li>✓ Напоминание по SMS</li>
              <li>✓ Скидка 10% на первое посещение</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingCalendar;
