import React from 'react';
import './Footer.css';
import { FaGithub, FaLinkedin, FaEnvelope, FaHeart, FaWhatsapp } from 'react-icons/fa';

const whatsappContacts = [
  {
    label: 'WhatsApp principal',
    phone: '5571999222524',
  },
  {
    label: 'WhatsApp reservas',
    phone: '5575998250840',
  },
];

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <h3>Paraiso Nativo</h3>
          <p>Subauma, BA</p>
        </div>
        
        <div className="footer-right">
          {whatsappContacts.map((contact) => (
            <div className="footer-contact-item" key={contact.phone}>
              <a
                href={`https://wa.me/${contact.phone}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaWhatsapp className="contact-icon" />
                <span>{contact.label}</span>
              </a>
            </div>
          ))}
          <div className="footer-contact-item">
            <a href="mailto:joaovpbo@outlook.com">
              <FaEnvelope className="contact-icon" />
              <span>joaovpbo@outlook.com</span>
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Paraiso Nativo. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
