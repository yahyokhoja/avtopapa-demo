import React from 'react';
import { useSiteContent } from '../context/SiteContentContext';
import './VKWidget.css';

const VKWidget: React.FC = () => {
  const { siteContent } = useSiteContent();

  return (
    <section className="vk-widget-section">
      <div className="container">
        <div className="section-header">
          <h2>{siteContent.vk.title}</h2>
          <p>{siteContent.vk.subtitle}</p>
        </div>

        <div className="vk-widget-container">
          <div className="vk-widget-placeholder">
            <div className="vk-icon">👥</div>
            <h3>{siteContent.vk.communityTitle}</h3>
            <p>{siteContent.vk.communityTextOne}</p>
            <p>{siteContent.vk.communityTextTwo}</p>
            <a href={siteContent.vk.profileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              {siteContent.vk.buttonText}
            </a>
          </div>

          {/* 
            VK Widget can be embedded here using VK API
            Example:
            <div id="vk_groups"></div>
            <script type="text/javascript">
              VK.Widgets.Group("vk_groups", {mode: 0, width: "auto"}, 123456789);
            </script>
          */}
        </div>
      </div>
    </section>
  );
};

export default VKWidget;
