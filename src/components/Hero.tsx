import React from 'react';
import './Hero.css';

const Hero: React.FC = () => {
  return (
    <section className="hero" id="hero">
      <div className="container">
        <div className="hero-content">
          <h1>Добро пожаловать в Автопапу</h1>
          <p className="hero-subtitle">Профессиональный автосервис в Санкт-Петербурге</p>
          <p className="hero-description">Качественное обслуживание и ремонт автомобилей любых марок с гарантией</p>
          <button className="btn btn-primary btn-lg">Записаться на обслуживание</button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
