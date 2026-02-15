import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RequestForm.css';
import { trackEvent } from '../utils/analytics';
import { formatPhoneNumber, normalizePhoneNumber, validateEmail, validatePhoneNumber, validateYear } from '../utils/validators';
import { isTelegramConfigured, sendLeadToTelegram } from '../utils/telegram';
import { useAuth } from '../context/AuthContext';
import { usePortalData } from '../context/PortalDataContext';
import { useSiteContent } from '../context/SiteContentContext';

interface FormData {
  name: string;
  email: string;
  phone: string;
  carBrand: string;
  carModel: string;
  year: string;
  problem: string;
  preferredDate: string;
  preferredTime: string;
}

const RequestForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createBooking, getBusySlotsByDate } = usePortalData();
  const { siteContent } = useSiteContent();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    carBrand: '',
    carModel: '',
    year: '',
    problem: '',
    preferredDate: '',
    preferredTime: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');

  const [submitted, setSubmitted] = useState(false);

  const getMinDate = () => new Date().toISOString().split('T')[0];

  const getAvailableTimes = () => {
    const baseSlots = siteContent.booking.timeSlots;
    if (!formData.preferredDate) return baseSlots;

    const today = new Date();
    const selected = new Date(formData.preferredDate);
    const isToday = today.toDateString() === selected.toDateString();
    const busySlots = getBusySlotsByDate(formData.preferredDate);

    if (!isToday) {
      return baseSlots.filter((slot) => !busySlots.includes(slot));
    }

    const minutesNow = today.getHours() * 60 + today.getMinutes();
    return baseSlots.filter((slot) => {
      const [hours, minutes] = slot.split(':').map(Number);
      return hours * 60 + minutes > minutesNow + 30 && !busySlots.includes(slot);
    });
  };

  const validateForm = (): boolean => {
    const nextErrors: Partial<Record<keyof FormData, string>> = {};
    const currentYear = new Date().getFullYear();
    const normalizedPhone = normalizePhoneNumber(formData.phone);

    if (formData.name.trim().length < 2) {
      nextErrors.name = 'Введите имя (минимум 2 символа)';
    }
    if (!validateEmail(formData.email)) {
      nextErrors.email = 'Введите корректный email';
    }
    if (!validatePhoneNumber(normalizedPhone)) {
      nextErrors.phone = 'Введите корректный номер телефона';
    }
    if (!formData.carBrand) {
      nextErrors.carBrand = 'Выберите марку автомобиля';
    }
    if (formData.year && !validateYear(formData.year)) {
      nextErrors.year = `Год должен быть в диапазоне 1900-${currentYear + 1}`;
    }
    if (formData.problem.trim().length < 10) {
      nextErrors.problem = 'Опишите проблему подробнее (минимум 10 символов)';
    }
    if (!formData.preferredDate) {
      nextErrors.preferredDate = 'Выберите дату';
    }
    if (!formData.preferredTime) {
      nextErrors.preferredTime = 'Выберите время';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const formattedValue = name === 'phone' ? formatPhoneNumber(value) : value;
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    if (!user) {
      setSubmitError(siteContent.requestForm.needAuthText);
      navigate('/auth');
      return;
    }

    setSubmitMessage('');
    setSubmitError('');
    setIsSubmitting(true);

    const payload = {
      ...formData,
      phone: formatPhoneNumber(normalizePhoneNumber(formData.phone))
    };

    try {
      if (isTelegramConfigured()) {
        await sendLeadToTelegram(payload);
      } else {
        console.info('Telegram not configured. Lead payload:', payload);
      }

      const bookingResult = createBooking({
        userId: user.id,
        userName: user.name,
        userPhone: payload.phone,
        userEmail: payload.email,
        carBrand: payload.carBrand,
        carModel: payload.carModel,
        year: payload.year,
        problem: payload.problem,
        date: payload.preferredDate,
        time: payload.preferredTime
      });

      if (!bookingResult.ok) {
        setSubmitError(bookingResult.error || 'Не удалось создать запись');
        setIsSubmitting(false);
        return;
      }

      trackEvent('form_submit', { source: 'request_form', brand: formData.carBrand });
      setSubmitted(true);
      setSubmitMessage(siteContent.requestForm.createdBookingText);
      setFormData({
        name: '',
        email: '',
        phone: '',
        carBrand: '',
        carModel: '',
        year: '',
        problem: '',
        preferredDate: '',
        preferredTime: ''
      });
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      setSubmitError(siteContent.requestForm.sendErrorText);
    } finally {
      setIsSubmitting(false);
    }
  };

  const carBrands = siteContent.requestForm.carBrands.length > 0
    ? siteContent.requestForm.carBrands
    : ['Лада', 'Hyundai', 'KIA', 'BMW', 'Mercedes-Benz', 'Toyota', 'Honda', 'Volkswagen', 'Audi', 'Mazda', 'Nissan', 'Ford', 'Chevrolet', 'Renault', 'Peugeot', 'Citroën', 'Volvo', 'Другое'];

  return (
    <section className="request-form-section">
      <div className="container">
        <div className="section-header">
          <h2>{siteContent.requestForm.title}</h2>
          <p>{siteContent.requestForm.subtitle}</p>
        </div>

        {submitted && (
          <div className="success-message">
            {siteContent.requestForm.submittedText}
          </div>
        )}
        {submitMessage && <div className="success-message">{submitMessage}</div>}
        {submitError && <div className="error-message">{submitError}</div>}

        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Имя *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ваше имя"
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Телефон *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+7 (999) 123-45-67"
                aria-invalid={Boolean(errors.phone)}
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="carBrand">Марка автомобиля *</label>
              <select
                id="carBrand"
                name="carBrand"
                value={formData.carBrand}
                onChange={handleChange}
                required
                aria-invalid={Boolean(errors.carBrand)}
              >
                <option value="">-- Выберите марку --</option>
                {carBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              {errors.carBrand && <span className="field-error">{errors.carBrand}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="carModel">Модель автомобиля</label>
              <input
                type="text"
                id="carModel"
                name="carModel"
                value={formData.carModel}
                onChange={handleChange}
                placeholder="Например: X5, CLA, CR-V"
              />
            </div>
            <div className="form-group">
              <label htmlFor="year">Год выпуска</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="2020"
                min="1990"
                max={new Date().getFullYear()}
                aria-invalid={Boolean(errors.year)}
              />
              {errors.year && <span className="field-error">{errors.year}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="preferredDate">Предпочтительная дата *</label>
              <input
                type="date"
                id="preferredDate"
                name="preferredDate"
                min={getMinDate()}
                value={formData.preferredDate}
                onChange={handleChange}
                required
                aria-invalid={Boolean(errors.preferredDate)}
              />
              {errors.preferredDate && <span className="field-error">{errors.preferredDate}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="preferredTime">Предпочтительное время *</label>
              <select
                id="preferredTime"
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
                required
                aria-invalid={Boolean(errors.preferredTime)}
              >
                <option value="">-- Выберите время --</option>
                {getAvailableTimes().map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              {errors.preferredTime && <span className="field-error">{errors.preferredTime}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="problem">Описание проблемы *</label>
            <textarea
              id="problem"
              name="problem"
              value={formData.problem}
              onChange={handleChange}
              required
              placeholder="Подробно опишите, что требует ремонт..."
              rows={5}
              aria-invalid={Boolean(errors.problem)}
            />
            {errors.problem && <span className="field-error">{errors.problem}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-large" disabled={isSubmitting}>
            {isSubmitting ? 'Отправляем...' : 'Отправить заявку'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default RequestForm;
