import React, { useState, useEffect, useRef } from 'react';
import {
  FaMapMarkerAlt, FaStar, FaUserFriends, FaArrowRight,
  FaChevronLeft, FaChevronRight, FaTimes,
  FaCalendarCheck, FaCalendarTimes,
} from 'react-icons/fa';
import { acomodacaoService } from '@services/acomodacaoService';
import { supabase } from '@lib/supabase';
import { normalizarAcomodacaoCard } from '@utils/normalizadores';
import { hoje } from '@utils/formatters';
import { useCarrossel } from '@hooks/useCarrossel';
import { useDisponibilidade } from '@hooks/useDisponibilidade';
import './Acomodacoes.css';

const HOJE = hoje();

// ─── Modal de foto ────────────────────────────────────────────────────────────
const PhotoModal = ({ fotos, nome, initialIndex, onClose }) => {
  const [idx, setIdx] = useState(initialIndex);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handle = (e) => {
      if (e.key === 'Escape')     onCloseRef.current();
      if (e.key === 'ArrowLeft')  setIdx(i => (i - 1 + fotos.length) % fotos.length);
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % fotos.length);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [fotos.length]);

  const prev = () => setIdx(i => (i - 1 + fotos.length) % fotos.length);
  const next = () => setIdx(i => (i + 1) % fotos.length);

  return (
    <div className="photo-modal-overlay" onClick={onClose}>
      <button className="photo-modal-close" onClick={onClose}><FaTimes /></button>
      <div className="photo-modal" onClick={e => e.stopPropagation()}>
        <img src={fotos[idx]} alt={`${nome} — foto ${idx + 1}`} />
        {fotos.length > 1 && (
          <>
            <button className="photo-modal-nav left" onClick={prev}><FaChevronLeft /></button>
            <button className="photo-modal-nav right" onClick={next}><FaChevronRight /></button>
          </>
        )}
      </div>
      <div className="photo-modal-counter">{idx + 1} / {fotos.length}</div>
    </div>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────
const AcomodacaoCard = ({ item, onIrParaReserva, onOpenModal }) => {
  const { idx, setIdx, prev, next, usarDots } = useCarrossel(item.fotos);
  const { checkin, checkout, consultando, resultado, handleCheckin, handleCheckout, verificar } = useDisponibilidade(item);

  return (
    <div className="accom-card">

      {/* ── Carrossel ── */}
      <div
        className="accom-card-image"
        onClick={() => onOpenModal(item.fotos, item.nome, idx)}
        title="Clique para ampliar"
      >
        <img src={item.fotos[idx]} alt={item.nome} loading="lazy" />
        <span className={`accom-badge accom-badge-${item.statusRaw}`}>{item.badge}</span>

        {item.fotos.length > 1 && (
          <>
            <button className="carousel-btn left" onClick={e => { e.stopPropagation(); prev(); }} aria-label="Foto anterior">
              <FaChevronLeft />
            </button>
            <button className="carousel-btn right" onClick={e => { e.stopPropagation(); next(); }} aria-label="Próxima foto">
              <FaChevronRight />
            </button>
          </>
        )}

        {usarDots && (
          <div className="carousel-dots">
            {item.fotos.map((_, i) => (
              <button
                key={i}
                className={`carousel-dot${i === idx ? ' active' : ''}`}
                onClick={e => { e.stopPropagation(); setIdx(i); }}
                aria-label={`Foto ${i + 1}`}
              />
            ))}
          </div>
        )}

        {!usarDots && item.fotos.length > 1 && (
          <div className="carousel-counter-badge">{idx + 1}/{item.fotos.length}</div>
        )}

        <div className="accom-expand-hint">
          <FaChevronRight style={{ transform: 'rotate(-45deg)' }} />
        </div>
      </div>

      {/* ── Corpo ── */}
      <div className="accom-card-body">
        <div className="accom-meta">
          <span className="accom-location"><FaMapMarkerAlt /> {item.localizacao}</span>
          <span className="accom-rating"><FaStar /> {item.avaliacao}</span>
        </div>
        <h3 className="accom-name">{item.nome}</h3>
        <p className="accom-desc">{item.descricao}</p>

        {/* ── Disponibilidade ── */}
        <div className="accom-availability">
          <p className="accom-avail-label">Verificar disponibilidade</p>
          <div className="accom-dates">
            <div className="accom-date-field">
              <label>Check-in</label>
              <input type="date" value={checkin} min={HOJE} onChange={handleCheckin} />
            </div>
            <div className="accom-date-field">
              <label>Check-out</label>
              <input type="date" value={checkout} min={checkin || HOJE} onChange={handleCheckout} />
            </div>
          </div>
          <button
            className="accom-check-btn"
            onClick={verificar}
            disabled={!checkin || !checkout || consultando}
          >
            {consultando ? 'Verificando…' : 'Verificar'}
          </button>

          {resultado && !resultado.erro && (
            <div className={`accom-result ${resultado.disponivel ? 'ok' : 'nok'}`}>
              {resultado.disponivel ? (
                <>
                  <div className="accom-result-header">
                    <FaCalendarCheck className="accom-result-icon" />
                    <span>
                      Disponível
                      {item.quantidade > 1 && ` · ${resultado.disponiveis} de ${item.quantidade} unidades`}
                      {' · '}{resultado.noites} {resultado.noites === 1 ? 'noite' : 'noites'}
                    </span>
                  </div>
                  {resultado.valorTotal != null && (
                    <div className="accom-result-price">
                      <span className="accom-result-label">Total estimado</span>
                      <span className="accom-result-total">
                        R$ {resultado.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <button className="accom-cta accom-cta-reservar" onClick={() => onIrParaReserva(item.id)}>
                    Reservar agora <FaArrowRight />
                  </button>
                </>
              ) : (
                <div className="accom-result-header">
                  <FaCalendarTimes className="accom-result-icon" />
                  <span>Indisponível para este período</span>
                </div>
              )}
            </div>
          )}

          {resultado?.erro && (
            <p className="accom-result-erro">Não foi possível verificar. Tente novamente.</p>
          )}
        </div>

        <div className="accom-footer">
          <span className="accom-guests"><FaUserFriends /> {item.hospedes}</span>
          <button className="accom-cta" onClick={() => onIrParaReserva(item.id)}>
            Ver Detalhes <FaArrowRight />
          </button>
        </div>
      </div>

    </div>
  );
};

// ─── Seção principal ──────────────────────────────────────────────────────────
const Acomodacoes = () => {
  const [acomodacoes, setAcomodacoes] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [erro, setErro]               = useState(null);
  const [modal, setModal]             = useState(null);

  const irParaReserva = async (idAcomodacao) => {
    const { data } = await supabase.auth.getSession();
    const base = data?.session?.user ? '/dashboard?page=reservar' : '/login';
    const sep  = base.includes('?') ? '&' : '?';
    window.location.href = `${base}${sep}acomodacao=${encodeURIComponent(String(idAcomodacao))}`;
  };

  useEffect(() => {
    let cancelado = false;
    acomodacaoService.listarTodasComFotos()
      .then(dados => { if (!cancelado && dados?.length > 0) setAcomodacoes(dados.map(normalizarAcomodacaoCard)); })
      .catch(() => { if (!cancelado) setErro('Erro ao exibir as acomodações.'); })
      .finally(() => { if (!cancelado) setLoading(false); });
    return () => { cancelado = true; };
  }, []);

  return (
    <section id="accommodation" className="accommodation-section">
      <div className="section-header">
        <h2 className="section-title">Nossas Acomodações</h2>
      </div>

      {loading ? (
        <div className="accom-loading">
          <div className="accom-loading-spinner" />
          <p>Carregando acomodações…</p>
        </div>
      ) : (
        <>
          {erro && <p className="accom-notice">{erro}</p>}
          <div className="accommodation-grid">
            {acomodacoes.map(item => (
              <AcomodacaoCard
                key={item.id}
                item={item}
                onIrParaReserva={irParaReserva}
                onOpenModal={(fotos, nome, idx) => setModal({ fotos, nome, idx })}
              />
            ))}
          </div>
        </>
      )}

      {modal && (
        <PhotoModal
          fotos={modal.fotos}
          nome={modal.nome}
          initialIndex={modal.idx}
          onClose={() => setModal(null)}
        />
      )}
    </section>
  );
};

export default Acomodacoes;
