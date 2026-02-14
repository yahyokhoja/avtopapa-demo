import React from 'react';
import './VKWidget.css';

const VKWidget: React.FC = () => {
  return (
    <section className="vk-widget-section">
      <div className="container">
        <div className="section-header">
          <h2>Следите за нами в ВКонтакте</h2>
          <p>Новости, акции и советы по уходу за автомобилем</p>
        </div>

        <div className="vk-widget-container">
          <div className="vk-widget-placeholder">
            <div className="vk-icon">👥</div>
            <h3>Сообщество Автопапа ВКонтакте</h3>
            <p>Присоединяйтесь к нашему сообществу</p>
            <p>Получайте эксклюзивные предложения и новости</p>
            <a href="https://vk.com/avtopapa" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              Открыть профиль ВКонтакте
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
