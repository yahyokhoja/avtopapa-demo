import React, { useEffect, useState } from 'react';
import { useSiteContent } from '../context/SiteContentContext';
import { EditableService } from '../types/siteContent';
import './Services.css';

const Services: React.FC = () => {
  const { siteContent } = useSiteContent();
  const [selectedService, setSelectedService] = useState<EditableService | null>(null);

  const closePriceModal = () => setSelectedService(null);

  useEffect(() => {
    if (!selectedService) {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePriceModal();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [selectedService]);

  return (
    <section className="services" id="services">
      <div className="container">
        <div className="section-header">
          <h2>{siteContent.services.title}</h2>
          <p>{siteContent.services.subtitle}</p>
        </div>
        <div className="services-grid">
          {siteContent.services.items.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <button
                type="button"
                className="service-link"
                onClick={() => setSelectedService(service)}
                aria-haspopup="dialog"
                aria-controls="service-price-modal"
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
              id="service-price-modal"
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
