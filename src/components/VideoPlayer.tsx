import React from 'react';
import { useSiteContent } from '../context/SiteContentContext';
import { getYouTubeEmbedUrl } from '../utils/media';
import './VideoPlayer.css';

const VideoPlayer: React.FC = () => {
  const { siteContent } = useSiteContent();
  const videoUrl = siteContent.media.videoUrl.trim();
  const youtubeEmbedUrl = getYouTubeEmbedUrl(videoUrl);

  if (!videoUrl) {
    return null;
  }

  return (
    <section className="video-player" id="video">
      <div className="container">
        <div className="section-header">
          <h2>Видео о сервисе</h2>
          <p>Посмотрите, как проходит обслуживание в Автопапа</p>
        </div>
        <div className="video-player-frame">
          {youtubeEmbedUrl ? (
            <iframe
              src={youtubeEmbedUrl}
              title="Видео о сервисе"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <video controls preload="metadata" playsInline>
              <source src={videoUrl} type="video/mp4" />
              Ваш браузер не поддерживает встроенное видео.
            </video>
          )}
        </div>
      </div>
    </section>
  );
};

export default VideoPlayer;
