import React, { useState, useEffect, useRef } from 'react';
import {
  FaMapMarkerAlt, FaStar, FaUserFriends, FaArrowRight,
  FaChevronLeft, FaChevronRight, FaTimes,
  FaCalendarCheck, FaCalendarTimes,
} from 'react-icons/fa';
import { acomodacaoService } from '@services/acomodacaoService';
import { supabase } from '@lib/supabase';
import './Acomodacoes.css';

const STATUS_LABELS = {
  disponivel: 'Disponível',
  manutencao: 'Manutenção',
  indisponivel: 'Indisponível',
};

const formatarStatus = (valor) => {
  if (!valor) return 'Disponível';
  const chave = String(valor).toLowerCase();
  return STATUS_LABELS[chave] ?? valor;
};

const normalizar = (item) => {
  const fotos = item.galeria_fotos?.map(f => f.url_imagem).filter(Boolean) ?? [];
  if (fotos.length === 0 && item.imagem) fotos.push(item.imagem);
  return {
    id:          item.id,
    nome:        item.nome,
    descricao:   item.descricao ?? '',
    fotos,
    valorDiaria: Number(item.valor_diaria) || 0,
    quantidade:  Number(item.quantidade) || 1,
    badge:       formatarStatus(item.status ?? item.badge),
    statusRaw:   (item.status ?? 'disponivel').toLowerCase(),
    avaliacao:   item.avaliacao ?? '5.0',
    localizacao: item.localizacao ?? 'Paraíso Nativo',
    hospedes:    item.capacidade_pessoas
                 ? `${item.capacidade_pessoas} Hóspede${item.capacidade_pessoas > 1 ? 's' : ''}`
                 : (item.hospedes ?? '2 Hóspedes'),
  };
};

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

  return (
    <div className="photo-modal-overlay" onClick={onClose}>
      <button className="photo-modal-close" onClick={onClose}><FaTimes /></button>
      <div className="photo-modal" onClick={e => e.stopPropagation()}>
        <img src={fotos[idx]} alt={`${nome} — foto ${idx + 1}`} />
        {fotos.length > 1 && (
          <>
            <button
              className="photo-modal-nav left"
              onClick={() => setIdx(i => (i - 1 + fotos.length) % fotos.length)}
            >
              <FaChevronLeft />
            </button>
            <button
              className="photo-modal-nav right"
              onClick={() => setIdx(i => (i + 1) % fotos.length)}
            >
              <FaChevronRight />
            </button>
          </>
        )}
      </div>
      <div className="photo-modal-counter">{idx + 1} / {fotos.length}</div>
    </div>
  );
};

// ─── Card de acomodação ───────────────────────────────────────────────────────
const AcomodacaoCard = ({ item, onIrParaReserva, onOpenModal }) => {
  const { fotos } = item;
  const [fotoIdx, setFotoIdx]       = useState(0);
  const [checkin, setCheckin]       = useState('');
  const [checkout, setCheckout]     = useState('');
  const [consultando, setConsultando] = useState(false);
  const [resultado, setResultado]   = useState(null);

  const hoje = new Date().toISOString().split('T')[0];

  const prev = (e) => { e.stopPropagation(); setFotoIdx(i => (i - 1 + fotos.length) % fotos.length); };
  const next = (e) => { e.stopPropagation(); setFotoIdx(i => (i + 1) % fotos.length); };

  const handleCheckin = (e) => {
    const val = e.target.value;
    setCheckin(val);
    setResultado(null);
    if (checkout && val >= checkout) setCheckout('');
  };

  const verificar = async () => {
    if (!checkin || !checkout) return;
    setConsultando(true);
    setResultado(null);
    try {
      const EXPIRA_MIN = 20;
      const limite = new Date(Date.now() - EXPIRA_MIN * 60 * 1000).toISOString();

      const { data: conflito, error } = await supabase
        .from('reservas')
        .select('id')
        .eq('id_acomodacao', item.id)
        .not('status_reserva', 'eq', 'cancelada')
        .lte('data_checkin', checkout)
        .gte('data_checkout', checkin)
        .or(`status_reserva.neq.pendente,criado_em.gt.${limite}`);

      if (error) throw error;

      const disponiveis = item.quantidade - conflito.length;
      const disponivel  = disponiveis > 0;
      const noites      = Math.ceil((new Date(checkout) - new Date(checkin)) / 86_400_000);
      const valorTotal  = disponivel && item.valorDiaria > 0 ? noites * item.valorDiaria : null;

      setResultado({ disponivel, disponiveis, noites, valorTotal });
    } catch {
      setResultado({ erro: true });
    } finally {
      setConsultando(false);
    }
  };

  const usarDots = fotos.length > 1 && fotos.length <= 7;

  return (
    <div className="accom-card">
      {/* ── Carrossel ── */}
      <div
        className="accom-card-image"
        onClick={() => onOpenModal(fotos, item.nome, fotoIdx)}
        title="Clique para ampliar"
      >
        <img src={fotos[fotoIdx]} alt={item.nome} loading="lazy" />
        <span className={`accom-badge accom-badge-${item.statusRaw}`}>{item.badge}</span>

        {fotos.length > 1 && (
          <>
            <button className="carousel-btn left" onClick={prev} aria-label="Foto anterior">
              <FaChevronLeft />
            </button>
            <button className="carousel-btn right" onClick={next} aria-label="Próxima foto">
              <FaChevronRight />
            </button>
          </>
        )}

        {usarDots && (
          <div className="carousel-dots">
            {fotos.map((_, i) => (
              <button
                key={i}
                className={`carousel-dot${i === fotoIdx ? ' active' : ''}`}
                onClick={e => { e.stopPropagation(); setFotoIdx(i); }}
                aria-label={`Foto ${i + 1}`}
              />
            ))}
          </div>
        )}

        {!usarDots && fotos.length > 1 && (
          <div className="carousel-counter-badge">{fotoIdx + 1}/{fotos.length}</div>
        )}

        <div className="accom-expand-hint"><FaChevronRight style={{ transform: 'rotate(-45deg)' }} /></div>
      </div>

      {/* ── Corpo ── */}
      <div className="accom-card-body">
        <div className="accom-meta">
          <span className="accom-location"><FaMapMarkerAlt /> {item.localizacao}</span>
          <span className="accom-rating"><FaStar /> {item.avaliacao}</span>
        </div>
        <h3 className="accom-name">{item.nome}</h3>
        <p className="accom-desc">{item.descricao}</p>

        {/* ── Verificar disponibilidade ── */}
        <div className="accom-availability">
          <p className="accom-avail-label">Verificar disponibilidade</p>
          <div className="accom-dates">
            <div className="accom-date-field">
              <label>Check-in</label>
              <input type="date" value={checkin} min={hoje} onChange={handleCheckin} />
            </div>
            <div className="accom-date-field">
              <label>Check-out</label>
              <input
                type="date"
                value={checkout}
                min={checkin || hoje}
                onChange={e => { setCheckout(e.target.value); setResultado(null); }}
              />
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
      .then((dados) => {
        if (cancelado) return;
        if (dados?.length > 0) setAcomodacoes(dados.map(normalizar));
      })
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
            {acomodacoes.map((item) => (
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
