import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { trackEvent } from '../utils/analytics';
import { useAuth } from '../context/AuthContext';
import { useSiteContent } from '../context/SiteContentContext';
import './Header.css';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { siteContent } = useSiteContent();
  const isHomePage = location.pathname === '/';
  const phoneHref = `tel:${siteContent.header.phone.replace(/[^\d+]/g, '')}`;

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
            <Link className="logo" to="/" onClick={closeMenu}>{siteContent.header.logoText}</Link>
            
            <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
              <span></span>
              <span></span>
              <span></span>
            </button>

            <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
              <li>
                <Link to="/" onClick={closeMenu}>
                  {siteContent.header.homeLabel}
                </Link>
              </li>
              {isHomePage && <li><a href="#services" onClick={closeMenu}>{siteContent.header.servicesLabel}</a></li>}
              {isHomePage && <li><a href="#booking" onClick={closeMenu}>{siteContent.header.bookingLabel}</a></li>}
              {isHomePage && <li><a href="#contacts" onClick={closeMenu}>{siteContent.header.contactsLabel}</a></li>}
              {!user && (
                <li>
                  <Link to="/auth" onClick={closeMenu}>
                    {siteContent.header.loginLabel}
                  </Link>
                </li>
              )}
              {user && (
                <li>
                  <Link to="/cabinet" onClick={closeMenu}>
                    {siteContent.header.cabinetLabel}
                  </Link>
                </li>
              )}
              {isAdmin && (
                <li>
                  <Link to="/admin" onClick={closeMenu}>
                    {siteContent.header.adminLabel}
                  </Link>
                </li>
              )}
              {user && (
                <li>
                  <button
                    type="button"
                    className="logout-link"
                    onClick={() => {
                      closeMenu();
                      logout();
                    }}
                  >
                    {siteContent.header.logoutLabel}
                  </button>
                </li>
              )}
              <li className="nav-phone">
                <a
                  href={phoneHref}
                  onClick={() => {
                    closeMenu();
                    trackEvent('phone_click', { source: 'header' });
                  }}
                >
                  {siteContent.header.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
