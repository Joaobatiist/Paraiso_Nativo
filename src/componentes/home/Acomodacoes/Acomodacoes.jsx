import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaStar, FaUserFriends, FaArrowRight } from 'react-icons/fa';
import { acomodacaoService } from '../../../services/acomodacaoService';
import { supabase } from '../../../lib/supabase';
import acomodacoesFallback from './acomodacoesData';
import './Acomodacoes.css';

// Normaliza tanto dados vindos do Supabase quanto os dados estáticos de fallback
const normalizar = (item) => ({
  id:          item.id,
  nome:        item.nome,
  descricao:   item.descricao ?? '',
  imagem:      item.galeria_fotos?.[0]?.url_imagem ?? item.imagem ,
  badge:       item.status ?? item.badge ?? 'Disponível',
  avaliacao:   item.avaliacao ?? '5.0',
  localizacao: item.localizacao ?? 'Paraíso Nativo',
  hospedes:    item.capacidade_pessoas ? `${item.capacidade_pessoas} Hóspede${item.capacidade_pessoas > 1 ? 's' : ''}` : (item.hospedes ?? '2 Hóspedes'),
});

const Acomodacoes = () => {
  const [acomodacoes, setAcomodacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const irParaReserva = async (idAcomodacao) => {
    const { data } = await supabase.auth.getSession();
    const destinoBase = data?.session?.user ? '/dashboard?page=reservar' : '/login';
    const separador = destinoBase.includes('?') ? '&' : '?';
    const destino = `${destinoBase}${separador}acomodacao=${encodeURIComponent(String(idAcomodacao))}`;
    window.location.href = destino;
  };

  useEffect(() => {
    let cancelado = false;

    acomodacaoService.listarTodasComFotos()
      .then((dados) => {
        if (cancelado) return;
        if (dados && dados.length > 0) {
          setAcomodacoes(dados.map(normalizar));
        } else {
          // Supabase retornou vazio: usa fallback estático
          setAcomodacoes(acomodacoesFallback.map(normalizar));
        }
      })
      .catch(() => {
        if (cancelado) return;
        // Falha na conexão: usa fallback estático silenciosamente
        setAcomodacoes(acomodacoesFallback.map(normalizar));
        setErro('Exibindo dados de demonstração.');
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => { cancelado = true; };
  }, []);

  return (
    <section id="accommodation" className="accommodation-section">
      {loading ? (
        <div className="accom-loading">
          <div className="accom-loading-spinner" />
          <p>Carregando acomodações…</p>
        </div>
      ) : (
        <>
          {erro && <p className="accom-notice">{erro}</p>}
          <div className="accommodation-grid">
            {acomodacoes.map((item) => (
              <div key={item.id} className="accom-card">
                <div className="accom-card-image">
                  <img src={item.imagem} alt={item.nome} loading="lazy" />
                  <span className="accom-badge">{item.badge}</span>
                </div>
                <div className="accom-card-body">
                  <div className="accom-meta">
                    <span className="accom-location">
                      <FaMapMarkerAlt /> {item.localizacao}
                    </span>
                    <span className="accom-rating">
                      <FaStar /> {item.avaliacao}
                    </span>
                  </div>
                  <h3 className="accom-name">{item.nome}</h3>
                  <p className="accom-desc">{item.descricao}</p>
                  <div className="accom-footer">
                    <span className="accom-guests">
                      <FaUserFriends /> {item.hospedes}
                    </span>
                    <button className="accom-cta" onClick={() => irParaReserva(item.id)}>
                      Ver Detalhes <FaArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default Acomodacoes;
