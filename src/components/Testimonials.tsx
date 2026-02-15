import React from 'react';
import { usePortalData } from '../context/PortalDataContext';
import { useSiteContent } from '../context/SiteContentContext';
import './Testimonials.css';

const Testimonials: React.FC = () => {
  const { reviews } = usePortalData();
  const { siteContent } = useSiteContent();

  return (
    <section className="testimonials" id="reviews" aria-labelledby="reviews-title">
      <div className="container">
        <div className="section-header">
          <h2 id="reviews-title">{siteContent.testimonials.title}</h2>
          <p>{siteContent.testimonials.subtitle}</p>
        </div>

        <div className="testimonials-grid">
          {reviews.map((item) => (
            <article key={item.id} className="testimonial-card">
              <div className="testimonial-head">
                <h3>{item.userName}</h3>
                <span>{item.car}</span>
              </div>
              <div className="testimonial-rating" aria-label={`Рейтинг ${item.rating} из 5`}>
                {'★'.repeat(item.rating)}
                {'☆'.repeat(5 - item.rating)}
              </div>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
