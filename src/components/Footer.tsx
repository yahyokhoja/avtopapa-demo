import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>О компании</h3>
            <p>Профессиональный автосервис "Автопапа" предлагает полный спектр услуг по обслуживанию и ремонту автомобилей в Санкт-Петербурге.</p>
          </div>

          <div className="footer-section">
            <h3>Быстрые ссылки</h3>
            <ul>
              <li><a href="#services">Услуги</a></li>
              <li><a href="#booking">Запись на обслуживание</a></li>
              <li><a href="#contacts">Контакты</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Контакты</h3>
            <ul>
              <li><a href="tel:+79991234567">+7 (999) 123-45-67</a></li>
              <li><a href="mailto:info@avtopapa.ru">info@avtopapa.ru</a></li>
              <li>Санкт-Петербург</li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Мы в соцсетях</h3>
            <div className="social-links">
              <a href="https://vk.com/avtopapa" target="_blank" rel="noopener noreferrer">VK</a>
              <a href="https://max.ru/avtopapa" target="_blank" rel="noopener noreferrer">Max</a>
              <a href="https://t.me/avtopapa" target="_blank" rel="noopener noreferrer">Telegram</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Автопапа - Автосервис в Санкт-Петербурге. Все права защищены.</p>
          <p className="footer-credits">Разработано с ❤️ для автолюбителей</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
