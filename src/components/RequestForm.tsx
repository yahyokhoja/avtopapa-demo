import React, { useState } from 'react';
import './RequestForm.css';

interface FormData {
  name: string;
  email: string;
  phone: string;
  carBrand: string;
  carModel: string;
  year: string;
  problem: string;
}

const RequestForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    carBrand: '',
    carModel: '',
    year: '',
    problem: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      carBrand: '',
      carModel: '',
      year: '',
      problem: ''
    });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const carBrands = [
    'Лада', 'Hyundai', 'KIA', 'BMW', 'Mercedes-Benz', 'Toyota', 
    'Honda', 'Volkswagen', 'Audi', 'Mazda', 'Nissan', 'Ford', 
    'Chevrolet', 'Renault', 'Peugeot', 'Citroën', 'Volvo', 'Другое'
  ];

  return (
    <section className="request-form-section">
      <div className="container">
        <div className="section-header">
          <h2>Оставить заявку</h2>
          <p>Заполните форму ниже, и мы свяжемся с вами в ближайшее время</p>
        </div>

        {submitted && (
          <div className="success-message">
            ✓ Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в течение 1 часа.
          </div>
        )}

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
              />
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
              />
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
              />
            </div>
            <div className="form-group">
              <label htmlFor="carBrand">Марка автомобиля *</label>
              <select
                id="carBrand"
                name="carBrand"
                value={formData.carBrand}
                onChange={handleChange}
                required
              >
                <option value="">-- Выберите марку --</option>
                {carBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
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
              />
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
            />
          </div>

          <button type="submit" className="btn btn-primary btn-large">Отправить заявку</button>
        </form>
      </div>
    </section>
  );
};

export default RequestForm;
