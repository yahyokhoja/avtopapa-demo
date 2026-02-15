import React from 'react';
import { trackEvent } from '../utils/analytics';
import { useSiteContent } from '../context/SiteContentContext';
import './Footer.css';

const Footer: React.FC = () => {
  const { siteContent } = useSiteContent();
  const currentYear = new Date().getFullYear();
  const contactPhone = siteContent.contacts.phones[0] || siteContent.header.phone;
  const phoneHref = `tel:${contactPhone.replace(/[^\d+]/g, '')}`;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>{siteContent.footer.companyTitle}</h3>
            <p>{siteContent.footer.companyDescription}</p>
          </div>

          <div className="footer-section">
            <h3>{siteContent.footer.quickLinksTitle}</h3>
            <ul>
              <li><a href="#services">{siteContent.footer.servicesLinkLabel}</a></li>
              <li><a href="#booking">{siteContent.footer.bookingLinkLabel}</a></li>
              <li><a href="#contacts">{siteContent.footer.contactsLinkLabel}</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>{siteContent.footer.contactsTitle}</h3>
            <ul>
              <li><a href={phoneHref}>{contactPhone}</a></li>
              <li><a href={`mailto:${siteContent.contacts.email}`}>{siteContent.contacts.email}</a></li>
              <li>{siteContent.footer.city}</li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>{siteContent.footer.socialTitle}</h3>
            <div className="social-links">
              {siteContent.footer.socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('social_click', { network: social.network })}
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} {siteContent.footer.bottomText}</p>
          <p className="footer-credits">{siteContent.footer.credits}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
