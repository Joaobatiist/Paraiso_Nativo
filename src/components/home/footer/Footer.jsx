import React from 'react';
import './Footer.css';
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaRoute } from 'react-icons/fa';

const whatsappContacts = [
  { label: 'WhatsApp principal', phone: '5571999222524', display: '(71) 99922-2524' },
  { label: 'WhatsApp reservas', phone: '5575998250840', display: '(75) 99825-0840' },
];

const navLinks = [
  { label: 'Início', href: '#home' },
  { label: 'Acomodações', href: '#accommodation' },
  { label: 'Nossa Essência', href: '#about' },
  { label: 'Reservas', href: '/reserva' },
  { label: 'Contato', href: '#contact' },
];

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">

        <div className="footer-col footer-brand">
          <h3>Paraíso Nativo</h3>
          <p>
            Um lar na praia de Subaúma para cada hóspede se sentir em casa.
            Natureza preservada, pet friendly e a 500m do mar.
          </p>
        </div>

        <div className="footer-col">
          <h4>Links rápidos</h4>
          <ul className="footer-nav">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contato</h4>
          <div className="footer-contacts">
            {whatsappContacts.map((c) => (
              <a
                key={c.phone}
                href={`https://wa.me/${c.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-link"
              >
                <FaWhatsapp className="footer-icon whatsapp" />
                <span>{c.display}</span>
              </a>
            ))}
            <a href="mailto:paraisonativo@gmail.com" className="footer-contact-link">
              <FaEnvelope className="footer-icon" />
              <span>paraisonativo@gmail.com</span>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Localização</h4>
          <div className="footer-location">
            <div className="footer-location-item">
              <FaMapMarkerAlt className="footer-icon" />
              <span>Praia de Subaúma, BA</span>
            </div>
            <div className="footer-location-item">
              <FaRoute className="footer-icon" />
              <span>A 500m do mar</span>
            </div>
            <div className="footer-location-item">
              <FaRoute className="footer-icon" />
              <span>A 100km de Salvador</span>
            </div>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Paraíso Nativo. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
