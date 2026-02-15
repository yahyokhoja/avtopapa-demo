import React from 'react';
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
        </div>
      </div>
    </section>
  );
};

export default Hero;
