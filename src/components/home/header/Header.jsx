import { useState, useEffect } from 'react';
import './Header.css';
import { FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';
import { supabase } from '@lib/supabase';

const Header = () => {
  const [isTop, setIsTop] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const homeSection = document.getElementById('home');
      if (homeSection) {
        const homeSectionBottom = homeSection.offsetTop + homeSection.offsetHeight;
        setIsTop(window.scrollY <= homeSectionBottom - window.innerHeight / 3);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const footer = document.querySelector('.footer');
    if (!footer) return;
    const observer = new IntersectionObserver(
      (entries) => setIsFooterVisible(entries[0].isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(footer);
    return () => observer.unobserve(footer);
  }, []);

  // Fecha o menu ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLinkClick = async (e) => {
    const href = e.currentTarget.getAttribute('href');
    setMenuOpen(false);

    if (!href) return;

    if (href === '/reserva') {
      e.preventDefault();
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        window.location.href = '/dashboard?page=reservar';
        return;
      }
      window.location.href = '/login';
      return;
    }

    if (!href.startsWith('#')) return;

    e.preventDefault();
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const offset = window.innerWidth < 768 ? -30 : -20;
      const offsetPosition =
        targetElement.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      return;
    }

    window.location.href = `/${href}`;
  };

  return (
    <>
      {/* Backdrop para fechar o menu no mobile */}
      {menuOpen && (
        <div className="nav-backdrop" onClick={() => setMenuOpen(false)} />
      )}

      <header
        className={`header-container ${isTop ? 'header-top' : 'header-bottom'} ${
          isFooterVisible ? 'header-hidden' : ''
        }`}
      >
        {/* Logo */}
        <div className="header-logo">
          <img src="/logo.png" alt="Paraíso Nativo" className="logo-img" />
          <span className="logo">Paraíso Nativo</span>
        </div>

        {/* Nav */}
        <nav className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
          <button
            className="nav-close-btn"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
          >
            <FaTimes />
          </button>
          <a href="#home" onClick={handleLinkClick}>Início</a>
          <a href="#accommodation" onClick={handleLinkClick}>Acomodações</a>
          <a href="#about" onClick={handleLinkClick}>Nossa Essência</a>
          <a href="/reserva" onClick={handleLinkClick}>Reservas</a>
          <a href="#contact" onClick={handleLinkClick}>Contato</a>
        </nav>

        {/* Ações: login + hamburger */}
        <div className="header-actions">
          <a href="/login" className="login-btn" title="Entrar na sua conta">
            <FaUserCircle />
            <span className="login-btn-text">Login</span>
          </a>
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu"
          >
            <FaBars />
          </button>
        </div>
      </header>
    </>
  );
};

export default Header;
