import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import { supabase } from '../../../lib/supabase';
import './Hero.css';

const Hero = () => {
  const handleReservaClick = async (event) => {
    event.preventDefault();
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
      window.location.href = '/dashboard?page=reservar';
      return;
    }
    window.location.href = '/login';
  };

  return (
    <section id="home" className="hero-section">
      <div className="hero-bg" />
      <div className="hero-overlay" />
      <div className="hero-content">
        <span className="hero-eyebrow">Bem-vindo ao</span>
        <h1 className="hero-title">Paraíso Nativo</h1>
        <p className="hero-subtitle">
          Seu refugio de tranquilidade e conforto. Luxo rústico, privacidade
          <br />e hospitalidade genuína.
        </p>
        <a href="/login" className="hero-cta" onClick={handleReservaClick}>
          <FaCalendarAlt /> Reservar Agora
        </a>
      </div>
      <div className="hero-scroll">
        <div className="scroll-line" />
      </div>
    </section>
  );
};

export default Hero;
