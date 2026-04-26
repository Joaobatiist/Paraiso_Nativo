import React from 'react';
import { FaLeaf, FaWater, FaStar } from 'react-icons/fa';
import './Essencia.css';

const pilares = [
  {
    id: 1,
    icone: FaLeaf,
    label: 'Eco-friendly',
    descricao: 'Construção sustentável em harmonia com a natureza',
  },
  {
    id: 2,
    icone: FaWater,
    label: 'Perto do mar',
    descricao: 'Acorde com o som suave das ondas todos os dias',
  },
  {
    id: 3,
    icone: FaStar,
    label: '5 Estrelas',
    descricao: 'Serviço boutique de alto padrão e atenção ao detalhe',
  },
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
          Nascemos do desejo de criar um lugar onde a natureza e o conforto se
          encontram em harmonia perfeita. Cada detalhe do Paraíso Nativo foi
          pensado para que você desconecte do mundo e reconecte com o que
          realmente importa.
        </p>
        <p className="essence-body">
          Arquitetura ecológica, gastronomia local e hospitalidade genuína se
          unem para oferecer uma experiência única e inesquecível.
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
