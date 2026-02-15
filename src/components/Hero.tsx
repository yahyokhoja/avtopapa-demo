import React from 'react';
import { trackEvent } from '../utils/analytics';
import { useSiteContent } from '../context/SiteContentContext';
import './Hero.css';

const Hero: React.FC = () => {
  const { siteContent } = useSiteContent();

  return (
    <section className="hero" id="hero">
      <div className="container">
        <div className="hero-content">
          <h1>{siteContent.hero.title}</h1>
          <p className="hero-subtitle">{siteContent.hero.subtitle}</p>
          <p className="hero-description">{siteContent.hero.description}</p>
          <a
            className="btn btn-primary btn-lg"
            href="#booking"
            onClick={() => trackEvent('hero_cta_click', { target: 'booking' })}
          >
            {siteContent.hero.ctaText}
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
