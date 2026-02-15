import React from 'react';
import { useSiteContent } from '../context/SiteContentContext';
import './TrustSection.css';

const TrustSection: React.FC = () => {
  const { siteContent } = useSiteContent();

  return (
    <section className="trust-section" aria-labelledby="trust-title">
      <div className="container">
        <div className="section-header">
          <h2 id="trust-title">{siteContent.trust.title}</h2>
          <p>{siteContent.trust.subtitle}</p>
        </div>
        <div className="trust-grid">
          {siteContent.trust.items.map((item) => (
            <article key={item.id} className="trust-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
