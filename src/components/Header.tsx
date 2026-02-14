import React, { useState } from 'react';
import './Header.css';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <div className="logo">🚗 Автопапа</div>
            
            <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
              <span></span>
              <span></span>
              <span></span>
            </button>

            <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
              <li><a href="#services" onClick={closeMenu}>Услуги</a></li>
              <li><a href="#booking" onClick={closeMenu}>Запись</a></li>
              <li><a href="#contacts" onClick={closeMenu}>Контакты</a></li>
              <li className="nav-phone">
                <a href="tel:+79214028303" onClick={closeMenu}>+7 921-402-83-03</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
