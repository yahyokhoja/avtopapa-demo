import React from 'react';
import './Contacts.css';

interface Contact {
  id: number;
  icon: string;
  title: string;
  content: string | JSX.Element;
}

const Contacts: React.FC = () => {
  const contacts: Contact[] = [
    {
      id: 1,
      icon: '📍',
      title: 'Адрес',
      content: '​Южная часть производственной зоны Горелово 1-й квартал, 1 этаж'
    },
    {
      id: 2,
      icon: '📞',
      title: 'Телефон',
      content: (
        <>
          <a href="tel:+79991234567">+7 (931) 102‒22‒22</a>
          <br />
          <a href="tel:+79214028303">+7 (921) 402-83-03</a>
        </>
      )
    },
    {
      id: 3,
      icon: '✉️',
      title: 'Email',
      content: <a href="mailto:info@avtopapa.ru">info@avtopapa.ru</a>
    },
    {
      id: 4,
      icon: '⏰',
      title: 'Время работы',
      content: (
        <>
          пн-сб: 09:00 - 19:00<br />
          вс: 10:00 - 18:00
        </>
      )
    }
  ];

  return (
    <section className="contacts" id="contacts">
      <div className="container">
        <div className="section-header">
          <h2>Контактная информация</h2>
          <p>Мы всегда рады помочь вам</p>
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
          <h3>Найти нас на карте</h3>
          <div className="map-placeholder">
            {/* You can replace this with an actual map component like Google Maps or Leaflet */}
            <p>📍 Карта будет добавлена позже</p>
            <p>Южная часть производственной зоны Горелово 1-й квартал, 11 
​Южная часть промзоны Горелово, Санкт-Петербург, Ломоносовский муниципальный район​198323</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacts;
