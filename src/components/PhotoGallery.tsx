import React from 'react';
import { useSiteContent } from '../context/SiteContentContext';
import './PhotoGallery.css';

const PhotoGallery: React.FC = () => {
  const { siteContent } = useSiteContent();
  const photos = siteContent.media.photos.filter(Boolean);

  if (photos.length === 0) {
    return null;
  }

  return (
    <section className="photo-gallery" id="photos">
      <div className="container">
        <div className="section-header">
          <h2>Фото работ</h2>
          <p>Примеры обслуживания и ремонта в нашем сервисе</p>
        </div>
        <div className="photo-gallery-grid">
          {photos.map((photo, index) => (
            <figure key={`${photo.slice(0, 32)}-${index}`} className="photo-gallery-item">
              <img src={photo} alt={`Фото сервиса ${index + 1}`} loading="lazy" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhotoGallery;
