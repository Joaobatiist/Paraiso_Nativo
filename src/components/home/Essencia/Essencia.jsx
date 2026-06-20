import React from 'react';
import { FaHome, FaFeatherAlt, FaPaw, FaUmbrellaBeach,FaTree, FaWhatsapp } from 'react-icons/fa';
import './Essencia.css';

const pilares = [
  {
    id: 1,
    icone: FaFeatherAlt,
    label: 'Paz e sossego',
    descricao: 'Um refúgio longe do barulho para renovar as energias',
  },
  {
    id:2,
    icone: FaUmbrellaBeach,
    label: 'A 500m do mar',
    descricao: 'Caminhe até a praia de Subaúma em poucos minutos',
  },
  {
    id: 3,
    icone: FaPaw,
    label: 'Pet friendly',
    descricao: 'Seu melhor amigo é bem-vindo aqui também',
  },
  {
    id:4, 
    icone: FaHome,
    label: 'Seu lar na praia',
    descricao: 'Apartamentos completos com cozinha, sala e suíte para toda a família',
  },
  {
  id: 5,
  icone: FaTree,
  label: 'Natureza preservada',
  descricao: 'Rodeado pela exuberância da Linha Verde baiana',
},
{
  id: 6,
  icone: FaWhatsapp,
  label: 'Reserva simples',
  descricao: 'Fale direto pelo WhatsApp e garanta sua estadia em minutos',
}
];

const mosaico = [
  {
    id: 1,
    src: '/FAROL.jpg',
    alt: 'Bangalô rústico de madeira',
    className: 'mosaic-img-tall',
  },
  {
    id: 2,
    src: '/pedras.jpg',
    alt: 'Jardim tropical',
    className: 'mosaic-img-short',
  },
  {
    id: 3,
    src: '/lagoa.jpg',
    alt: 'Detalhes de luxo',
    className: 'mosaic-img-short',
  },
];

const Essencia = () => (
  <section id="about" className="essence-section">
    <div className="essence-shape-top" />

    <div className="essence-inner">
      {/* Texto + pilares */}
      <div className="essence-text-col">
        <span className="section-label light">Nossa história</span>
        <h2 className="section-title light">Nossa Essência</h2>
        <p className="essence-body">
          O Paraíso Nativo nasceu de um sonho de família: criar um lar para cada hóspede se sinta em casa. 
          Localizada na praia de Subaúma, a 500 metros do mar e a apenas 100km de Salvador, nossa pousada é um convite para desacelerar.
        </p>
        

        <div className="essence-pillars">
          {pilares.map(({ id, icone: Icon, label, descricao }) => (
            <div key={id} className="pillar">
              <Icon className="pillar-icon" />
              <span className="pillar-label">{label}</span>
              <p className="pillar-desc">{descricao}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mosaico de imagens */}
      <div className="essence-mosaic">
        {mosaico.map(({ id, src, alt, className }) => (
          <div key={id} className={`mosaic-img ${className}`}>
            <img src={src} alt={alt} loading="lazy" />
          </div>
        ))}
      </div>
    </div>

    <div className="essence-shape-bottom" />
  </section>
);

export default Essencia;
