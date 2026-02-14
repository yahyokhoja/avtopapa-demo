import React, { useState } from 'react';
import './Services.css';

interface Service {
  id: number;
  icon: string;
  title: string;
  description: string;
  prices: Array<{
    name: string;
    price: string;
  }>;
}

const SERVICES: Service[] = [
  {
    id: 1,
    icon: '🔧',
    title: 'Техническое обслуживание',
    description: 'Регулярное ТО, замена масла, фильтров и расходников согласно регламенту производителя',
    prices: [
      { name: 'Замена масла и фильтра', price: 'от 1 500 ₽' },
      { name: 'Замена воздушного фильтра', price: 'от 600 ₽' },
      { name: 'Комплексное ТО', price: 'от 4 500 ₽' }
    ]
  },
  {
    id: 2,
    icon: '🚙',
    title: 'Ремонт кузова',
    description: 'Кузовной ремонт, покраска, восстановление геометрии и защита от коррозии',
    prices: [
      { name: 'Локальная покраска детали', price: 'от 5 000 ₽' },
      { name: 'Удаление вмятин', price: 'от 3 000 ₽' },
      { name: 'Полировка кузова', price: 'от 4 000 ₽' }
    ]
  },
  {
    id: 3,
    icon: '⚙️',
    title: 'Ремонт двигателя',
    description: 'Диагностика и ремонт двигателя любой сложности с использованием оригинальных запчастей',
    prices: [
      { name: 'Компьютерная диагностика ДВС', price: 'от 2 000 ₽' },
      { name: 'Замена ГРМ', price: 'от 8 000 ₽' },
      { name: 'Капитальный ремонт двигателя', price: 'от 45 000 ₽' }
    ]
  },
  {
    id: 4,
    icon: '🛞',
    title: 'Шины и подвеска',
    description: 'Балансировка колес, ремонт и диагностика подвески, установка шин',
    prices: [
      { name: 'Шиномонтаж (комплект)', price: 'от 2 400 ₽' },
      { name: 'Балансировка колеса', price: 'от 400 ₽' },
      { name: 'Диагностика подвески', price: 'от 1 200 ₽' }
    ]
  },
  {
    id: 5,
    icon: '💻',
    title: 'Компьютерная диагностика',
    description: 'Полная диагностика всех систем автомобиля с использованием современного оборудования',
    prices: [
      { name: 'Считывание ошибок', price: 'от 1 000 ₽' },
      { name: 'Диагностика перед покупкой', price: 'от 3 500 ₽' },
      { name: 'Расширенная диагностика', price: 'от 2 500 ₽' }
    ]
  },
  {
    id: 6,
    icon: '🔌',
    title: 'Электрооборудование',
    description: 'Ремонт электросистем, аккумуляторов, светотехники и стартеров',
    prices: [
      { name: 'Проверка генератора', price: 'от 1 500 ₽' },
      { name: 'Ремонт стартера', price: 'от 3 500 ₽' },
      { name: 'Замена аккумулятора', price: 'от 1 000 ₽' }
    ]
  }
];

const Services: React.FC = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const closePriceModal = () => setSelectedService(null);

  return (
    <section className="services" id="services">
      <div className="container">
        <div className="section-header">
          <h2>Наши услуги</h2>
          <p>Полный спектр услуг для вашего автомобиля</p>
        </div>
        <div className="services-grid">
          {SERVICES.map(service => (
            <div key={service.id} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <button
                type="button"
                className="service-link"
                onClick={() => setSelectedService(service)}
              >
                Узнать больше →
              </button>
            </div>
          ))}
        </div>

        {selectedService && (
          <div className="price-modal-overlay" onClick={closePriceModal}>
            <div
              className="price-modal"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="price-modal-title"
            >
              <button
                type="button"
                className="price-modal-close"
                onClick={closePriceModal}
                aria-label="Закрыть прайс"
              >
                ×
              </button>
              <h3 id="price-modal-title">Прайс: {selectedService.title}</h3>
              <ul className="price-list">
                {selectedService.prices.map((item) => (
                  <li key={item.name}>
                    <span>{item.name}</span>
                    <strong>{item.price}</strong>
                  </li>
                ))}
              </ul>
              <a href="#booking" className="price-booking-link" onClick={closePriceModal}>
                Записаться на услугу
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;
