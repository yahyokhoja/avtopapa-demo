import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from '../utils/analytics';
import { useAuth } from '../context/AuthContext';
import { usePortalData } from '../context/PortalDataContext';
import { useSiteContent } from '../context/SiteContentContext';
import { formatPhoneNumber, normalizePhoneNumber, validatePhoneNumber } from '../utils/validators';
import './BookingCalendar.css';

const toIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const addDays = (date: Date, days: number) => {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
};
const formatRuDateShort = (isoDate: string) => {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('ru-RU', { weekday: 'short', day: '2-digit', month: '2-digit' });
};
const formatRuDateLong = (isoDate: string) => {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('ru-RU', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
};

const BookingCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createBooking, getBusySlotsByDate } = usePortalData();
  const { siteContent } = useSiteContent();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+7');
  const [carModel, setCarModel] = useState('');
  const [problem, setProblem] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [viewDateIso, setViewDateIso] = useState(toIsoDate(new Date()));

  const timeSlots = siteContent.booking.timeSlots.length > 0
    ? siteContent.booking.timeSlots
    : ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];
  const todayIso = toIsoDate(new Date());
  const busySlotsForViewDate = new Set(getBusySlotsByDate(viewDateIso));

  const isSlotInPast = (date: string, time: string) => {
    if (date < todayIso) {
      return true;
    }
    if (date > todayIso) {
      return false;
    }
    const now = new Date();
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes <= minutesNow + 30;
  };

  useEffect(() => {
    if (!user) {
      return;
    }
    setName(user.name || '');
    setPhone(user.phone || '+7');
  }, [user]);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!user) {
      setMessage(siteContent.booking.needAuthText);
      navigate('/auth');
      return;
    }

    if (name.trim().length < 2) {
      setError('Введите имя (минимум 2 символа)');
      return;
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    if (!validatePhoneNumber(normalizedPhone)) {
      setError('Введите корректный номер телефона');
      return;
    }

    if (carModel.trim().length < 2) {
      setError('Введите модель автомобиля');
      return;
    }

    if (problem.trim().length < 5) {
      setError('Опишите причину обращения (минимум 5 символов)');
      return;
    }

    if (!selectedDate || !selectedTime) {
      setError('Выберите свободный слот в календаре занятости');
      return;
    }

    if (selectedDate && selectedTime) {
      const result = createBooking({
        userId: user.id,
        userName: name.trim(),
        userPhone: formatPhoneNumber(normalizedPhone),
        userEmail: user.email,
        carBrand: '-',
        carModel: carModel.trim(),
        year: '-',
        problem: problem.trim(),
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
      setCarModel('');
      setProblem('');
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
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
              <label htmlFor="booking-name">Имя</label>
              <input
                id="booking-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="booking-phone">Телефон</label>
              <input
                id="booking-phone"
                value={phone}
                onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                placeholder="+7 (999) 123-45-67"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="booking-car-model">Модель автомобиля</label>
              <input
                id="booking-car-model"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                placeholder="Например: X5, CLA, CR-V"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="booking-problem">Причина обращения</label>
              <textarea
                id="booking-problem"
                rows={3}
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Опишите проблему"
                required
              />
            </div>
            <div className="form-group">
              <label>{siteContent.booking.dateLabel}</label>
              <div className="selected-slot-pill">
                {selectedDate && selectedTime
                  ? `${formatRuDateShort(selectedDate)} ${selectedTime}`
                  : 'Слот не выбран'}
              </div>
              <small>Выберите свободное время в календаре справа</small>
            </div>

            <button type="submit" className="btn btn-secondary">{siteContent.booking.submitText}</button>
          </form>

          <div className="booking-occupancy-card">
            <div className="booking-calendar-toolbar">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  const current = new Date(`${viewDateIso}T00:00:00`);
                  const previousDay = toIsoDate(addDays(current, -1));
                  if (previousDay >= todayIso) {
                    setViewDateIso(previousDay);
                  }
                }}
                disabled={viewDateIso <= todayIso}
              >
                ← День
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setViewDateIso(todayIso)}
              >
                Сегодня
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  const current = new Date(`${viewDateIso}T00:00:00`);
                  setViewDateIso(toIsoDate(addDays(current, 1)));
                }}
              >
                День →
              </button>
            </div>
            <div className="booking-day-title">{formatRuDateLong(viewDateIso)}</div>
            <div className="booking-day-slots">
              {timeSlots.map((time) => {
                const busy = busySlotsForViewDate.has(time);
                const past = isSlotInPast(viewDateIso, time);
                const isSelected = selectedDate === viewDateIso && selectedTime === time;
                const available = !busy && !past;
                const className = available
                  ? isSelected
                    ? 'slot-btn selected'
                    : 'slot-btn free'
                  : busy
                    ? 'slot-btn busy'
                    : 'slot-btn past';

                return (
                  <button
                    key={`${viewDateIso}_${time}`}
                    type="button"
                    className={className}
                    disabled={!available}
                    onClick={() => {
                      setSelectedDate(viewDateIso);
                      setSelectedTime(time);
                      setMessage(`Выбран слот: ${formatRuDateShort(viewDateIso)} ${time}`);
                    }}
                  >
                    <span>{time}</span>
                    <span>{busy ? 'Занято' : past ? 'Прошло' : isSelected ? 'Выбрано' : 'Свободно'}</span>
                  </button>
                );
              })}
            </div>
          </div>

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
