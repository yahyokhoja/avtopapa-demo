import React, { useMemo, useState } from 'react';
import { useSiteContent } from '../context/SiteContentContext';
import { getYouTubeEmbedUrl } from '../utils/media';
import './Hero.css';

const Hero: React.FC = () => {
  const { siteContent } = useSiteContent();
  const photos = useMemo(() => siteContent.media.photos.filter(Boolean), [siteContent.media.photos]);
  const videoUrl = siteContent.media.videoUrl.trim();
  const youtubeEmbedUrl = useMemo(() => getYouTubeEmbedUrl(videoUrl), [videoUrl]);
  const [openedMedia, setOpenedMedia] = useState<'photo' | 'video' | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const closeMediaModal = () => {
    setOpenedMedia(null);
  };

  const openPhotoModal = () => {
    setActivePhotoIndex(0);
    setOpenedMedia('photo');
  };

  const showPrevPhoto = () => {
    setActivePhotoIndex((prev) => {
      if (photos.length === 0) {
        return 0;
      }
      return prev === 0 ? photos.length - 1 : prev - 1;
    });
  };

  const showNextPhoto = () => {
    setActivePhotoIndex((prev) => {
      if (photos.length === 0) {
        return 0;
      }
      return prev === photos.length - 1 ? 0 : prev + 1;
    });
  };

  return (
    <section className="hero" id="hero">
      <div className="container">
        <div className="hero-content">
          <h1>{siteContent.hero.title}</h1>
          <p className="hero-subtitle">{siteContent.hero.subtitle}</p>
          <p className="hero-description">{siteContent.hero.description}</p>
          <div className="hero-media-actions" aria-label="Быстрый доступ к медиа">
            <button className="hero-media-btn" type="button" onClick={openPhotoModal} aria-label="Открыть фото">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Zm2 0v12h12V6H6Zm2 9 3-4 2.5 3 1.5-2 3 4H8Zm2-5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
              </svg>
              Фото
            </button>
            <button
              className="hero-media-btn"
              type="button"
              onClick={() => setOpenedMedia('video')}
              aria-label="Открыть видео"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2l4-2v14l-4-2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Zm2 0v14h8V5H6Zm5 3.8v5.4l4.3-2.7L11 8.8Z" />
              </svg>
              Видео
            </button>
          </div>
        </div>
      </div>
      {openedMedia && (
        <div className="hero-media-modal" role="dialog" aria-modal="true" onClick={closeMediaModal}>
          <div className="hero-media-modal-content" onClick={(event) => event.stopPropagation()}>
            <button className="hero-media-close" type="button" onClick={closeMediaModal} aria-label="Закрыть">
              Закрыть
            </button>
            {openedMedia === 'video' && videoUrl && (
              <div className="hero-media-video">
                {youtubeEmbedUrl ? (
                  <iframe
                    src={youtubeEmbedUrl}
                    title="Видео сервиса"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : (
                  <video controls autoPlay preload="metadata" playsInline>
                    <source src={videoUrl} type="video/mp4" />
                    Ваш браузер не поддерживает встроенное видео.
                  </video>
                )}
              </div>
            )}
            {openedMedia === 'video' && !videoUrl && <p>Видео пока не добавлено.</p>}
            {openedMedia === 'photo' && photos.length > 0 && (
              <div className="hero-media-photo">
                <img src={photos[activePhotoIndex]} alt={`Фото сервиса ${activePhotoIndex + 1}`} />
                {photos.length > 1 && (
                  <div className="hero-media-nav">
                    <button className="hero-media-nav-btn" type="button" onClick={showPrevPhoto}>
                      Назад
                    </button>
                    <span>
                      {activePhotoIndex + 1} / {photos.length}
                    </span>
                    <button className="hero-media-nav-btn" type="button" onClick={showNextPhoto}>
                      Далее
                    </button>
                  </div>
                )}
              </div>
            )}
            {openedMedia === 'photo' && photos.length === 0 && <p>Фото пока не добавлены.</p>}
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
