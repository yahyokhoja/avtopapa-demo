import React from 'react';
import { trackEvent } from '../utils/analytics';
import { useSiteContent } from '../context/SiteContentContext';
import './Contacts.css';

interface Contact {
  id: number;
  icon: string;
  title: string;
  content: React.ReactNode;
}

const Contacts: React.FC = () => {
  const { siteContent } = useSiteContent();
  const serviceAddress = siteContent.contacts.mapAddress;
  const encodedAddress = encodeURIComponent(siteContent.contacts.mapQueryAddress);
  const yandexMapEmbedUrl = `https://yandex.ru/map-widget/v1/?text=${encodedAddress}&z=16`;
  const yandexRouteUrl = `https://yandex.ru/maps/?text=${encodedAddress}&rtt=auto`;
  const phoneToHref = (value: string) => `tel:${value.replace(/[^\d+]/g, '')}`;

  const contacts: Contact[] = [
    {
      id: 1,
      icon: '📍',
      title: siteContent.contacts.addressTitle,
      content: siteContent.contacts.addressText
    },
    {
      id: 2,
      icon: '📞',
      title: siteContent.contacts.phoneTitle,
      content: (
        <>
          {siteContent.contacts.phones.map((phone, index) => (
            <React.Fragment key={phone}>
              <a href={phoneToHref(phone)} onClick={() => trackEvent('phone_click', { source: 'contacts' })}>{phone}</a>
              {index < siteContent.contacts.phones.length - 1 && <br />}
            </React.Fragment>
          ))}
        </>
      )
    },
    {
      id: 3,
      icon: '✉️',
      title: siteContent.contacts.emailTitle,
      content: <a href={`mailto:${siteContent.contacts.email}`} onClick={() => trackEvent('email_click', { source: 'contacts' })}>{siteContent.contacts.email}</a>
    },
    {
      id: 4,
      icon: '⏰',
      title: siteContent.contacts.workHoursTitle,
      content: (
        <>
          {siteContent.contacts.workHoursLines.map((line, index) => (
            <React.Fragment key={line}>
              {line}
              {index < siteContent.contacts.workHoursLines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </>
      )
    }
  ];

  return (
    <section className="contacts" id="contacts">
      <div className="container">
        <div className="section-header">
          <h2>{siteContent.contacts.title}</h2>
          <p>{siteContent.contacts.subtitle}</p>
        </div>

        <div className="contacts-grid">
          {contacts.map(contact => (
            <div key={contact.id} className="contact-item">
              <div className="contact-icon">{contact.icon}</div>
              <h3>{contact.title}</h3>
              <p>{contact.content}</p>
            </div>
          ))}
        </div>

        <div className="map-section">
          <h3>{siteContent.contacts.mapTitle}</h3>
          <div className="map-card">
            <iframe
              className="map-frame"
              src={yandexMapEmbedUrl}
              title="Карта автосервиса Avtopapa"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <p className="map-address">{serviceAddress}</p>
            <a
              className="route-button"
              href={yandexRouteUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('route_click', { provider: 'yandex' })}
            >
              {siteContent.contacts.routeButtonText}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacts;
