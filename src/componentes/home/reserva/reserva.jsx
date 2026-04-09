import { useEffect, useMemo, useState } from 'react';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaImage, FaUserFriends } from 'react-icons/fa';
import { acomodacaoService } from '../../../services/acomodacaoService';
import { reservaService } from '../../../services/reservaService';
import { perfilService } from '../../../services/perfilService';
import { supabase } from '../../../lib/supabase';
import './reserva.css';

const normalizarAcomodacao = (item) => {
  const fotosGaleria = (item.galeria_fotos || [])
    .map((foto) => foto?.url_imagem)
    .filter(Boolean);

  const fotos = item.url_capa
    ? [item.url_capa, ...fotosGaleria.filter((url) => url !== item.url_capa)]
    : fotosGaleria;

  return {
    id: item.id,
    nome: item.nome || 'Acomodação',
    descricao: item.descricao || 'Sem descrição disponível no momento.',
    precoDiaria: Number(item.preco_diaria || 0),
    capacidadePessoas: item.capacidade_pessoas || 1,
    status: item.status || 'disponivel',
    fotos,
  };
};

const formatarMoeda = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

const hoje = () => new Date().toISOString().split('T')[0];

const calcularNoites = (checkin, checkout) => {
  if (!checkin || !checkout) return 0;
  const inicio = new Date(checkin);
  const fim = new Date(checkout);
  const diff = fim.getTime() - inicio.getTime();
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
};

const resolverRole = (...roles) => {
  const normalizadas = roles
    .map((r) => (r || '').toString().toLowerCase())
    .filter(Boolean);
  if (normalizadas.some((r) => r === 'admin' || r === 'administrador')) return 'admin';
  if (normalizadas.some((r) => r === 'cliente')) return 'cliente';
  return normalizadas[0] || '';
};

const Reserva = () => {
  const [acomodacoes, setAcomodacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [session, setSession] = useState(null);
  const [perfilAtual, setPerfilAtual] = useState(null);
  const [carregandoAuth, setCarregandoAuth] = useState(true);

  const [acomodacaoSelecionadaId, setAcomodacaoSelecionadaId] = useState('');
  const [fotoAtivaIndex, setFotoAtivaIndex] = useState(0);
  const [form, setForm] = useState({
    data_checkin: '',
    data_checkout: '',
    num_hospedes: '1',
  });
  const [perfilForm, setPerfilForm] = useState({
    nome: '',
    email: '',
    documento: '',
    telefone: '',
    cep: '',
    rua: '',
    bairro: '',
    cidade: '',
    estado: '',
  });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!ativo) return;
      setSession(data.session || null);
      setCarregandoAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, novaSession) => {
      setSession(novaSession || null);
    });

    return () => {
      ativo = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (carregandoAuth) return;
    if (!session?.user?.id) {
      window.location.href = '/login';
    }
  }, [carregandoAuth, session]);

  useEffect(() => {
    const carregarPerfil = async () => {
      if (!session?.user?.id) {
        setPerfilAtual(null);
        return;
      }

      try {
        const data = await perfilService.obterPerfilLogado(session.user.id);
        const perfil = data?.[0] || null;
        setPerfilAtual(perfil);
        setPerfilForm({
          nome: perfil?.nome || session.user.user_metadata?.nome || '',
          email: perfil?.email || session.user.email || '',
          documento: perfil?.documento || '',
          telefone: perfil?.telefone || '',
          cep: perfil?.cep || '',
          rua: perfil?.rua || '',
          bairro: perfil?.bairro || '',
          cidade: perfil?.cidade || '',
          estado: perfil?.estado || '',
        });
      } catch {
        setPerfilForm((prev) => ({
          ...prev,
          email: prev.email || session.user.email || '',
        }));
      }
    };

    carregarPerfil();
  }, [session]);

  useEffect(() => {
    let cancelado = false;

    const carregar = async () => {
      if (carregandoAuth) return;
      if (!session?.user?.id) {
        setAcomodacoes([]);
        setAcomodacaoSelecionadaId('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setErro('');
      try {
        const data = await acomodacaoService.listarTodasComFotos();
        if (cancelado) return;

        const lista = (data || []).map(normalizarAcomodacao);
        setAcomodacoes(lista);

        if (lista.length > 0) {
          const params = new URLSearchParams(window.location.search);
          const preSelecionada = params.get('acomodacao');
          const existePreSelecionada = lista.some((item) => String(item.id) === String(preSelecionada));
          setAcomodacaoSelecionadaId(existePreSelecionada ? preSelecionada : lista[0].id);
        }
      } catch (error) {
        if (!cancelado) {
          setErro('Não foi possível carregar as acomodações agora. Tente novamente em instantes.');
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    carregar();
    return () => {
      cancelado = true;
    };
  }, [session, carregandoAuth]);

  const acomodacaoSelecionada = useMemo(
    () => acomodacoes.find((item) => item.id === acomodacaoSelecionadaId) || null,
    [acomodacoes, acomodacaoSelecionadaId]
  );

  const fotosSelecionadas = acomodacaoSelecionada?.fotos || [];
  const noites = calcularNoites(form.data_checkin, form.data_checkout);

  const calcularDiariaPorHospedes = (hospedes, precoDiaria) => {
    const base = Number(precoDiaria || 0);
    const qtd = Number(hospedes) || 0;
    if (qtd <= 2) return base;
    return base + (qtd - 2) * 50;
  };

  const valorDiaria = calcularDiariaPorHospedes(
    form.num_hospedes,
    acomodacaoSelecionada?.precoDiaria
  );
  const valorEstimado = valorDiaria * noites;

  const handleSelecionarAcomodacao = (id) => {
    setAcomodacaoSelecionadaId(id);
    setFotoAtivaIndex(0);
    setSucesso('');
    setErro('');
  };

  const handleChange = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErro('');
    setSucesso('');
  };

  const handlePerfilChange = (campo, valor) => {
    setPerfilForm((prev) => ({ ...prev, [campo]: valor }));
    setErro('');
    setSucesso('');
  };


  const trocarFoto = (direcao) => {
    if (fotosSelecionadas.length <= 1) return;
    const novoIndex = (fotoAtivaIndex + direcao + fotosSelecionadas.length) % fotosSelecionadas.length;
    setFotoAtivaIndex(novoIndex);
  };

  const handleSubmit = async (evento) => {
    evento.preventDefault();
    setErro('');
    setSucesso('');

    if (!acomodacaoSelecionada) {
      setErro('Selecione uma acomodação para reservar.');
      return;
    }
    if (!session?.user?.id) {
      setErro('Você precisa estar logado para concluir a reserva.');
      return;
    }
    const roleAtual = resolverRole(perfilAtual?.role);
    if (roleAtual === 'admin') {
      setErro('Contas administrativas não podem criar reservas nesta tela.');
      return;
    }
    if (!perfilForm.nome.trim()) {
      setErro('Informe seu nome completo.');
      return;
    }
    if (!perfilForm.email.trim()) {
      setErro('Informe seu e-mail.');
      return;
    }
    if (!form.data_checkin || !form.data_checkout) {
      setErro('Selecione a data de check-in e de check-out.');
      return;
    }
    if (form.data_checkout <= form.data_checkin) {
      setErro('A data de check-out deve ser depois do check-in.');
      return;
    }
    if (Number(form.num_hospedes) > acomodacaoSelecionada.capacidadePessoas) {
      setErro(`Esta acomodação aceita até ${acomodacaoSelecionada.capacidadePessoas} hóspede(s).`);
      return;
    }

    setSalvando(true);
    try {
      await perfilService.salvarPerfilCliente(session.user.id, perfilForm);

      await reservaService.criarNovaReserva({
        id_usuario: session.user.id,
        id_acomodacao: acomodacaoSelecionada.id,
        data_checkin: form.data_checkin,
        data_checkout: form.data_checkout,
        valor_total: valorEstimado,
        status_reserva: 'pendente',
      });

      setSucesso('Reserva enviada com sucesso! Nossa equipe vai confirmar a disponibilidade.');
      setForm({
        data_checkin: '',
        data_checkout: '',
        num_hospedes: '1',
      });
    } catch (error) {
      setErro(error.message || 'Não foi possível finalizar a reserva agora.');
    } finally {
      setSalvando(false);
    }
  };
  return (
    <section id="services" className="reserva-section">
      {carregandoAuth ? (
        <div className="reserva-loading">Validando acesso...</div>
      ) : !session?.user?.id ? (
        <div className="reserva-auth-gate">
          <h3>Faça login para reservar</h3>
          <p>O acesso para reservas agora está concentrado em uma única tela de login.</p>
          <button
            type="button"
            className="reserva-submit"
            onClick={() => { window.location.href = '/login'; }}
          >
            Entrar ou cadastrar
          </button>
        </div>
      ) : loading ? (
        <div className="reserva-loading">Carregando acomodações...</div>
      ) : (
        <>
          <div className="reserva-layout">
          <div className="reserva-acomodacoes-lista" role="list">
            {acomodacoes.map((acomodacao) => {
              const ativa = acomodacao.id === acomodacaoSelecionadaId;
              const fotoCapa = acomodacao.fotos[0] || '';

              return (
                <button
                  key={acomodacao.id}
                  type="button"
                  className={`reserva-acomodacao-card ${ativa ? 'ativa' : ''}`}
                  onClick={() => handleSelecionarAcomodacao(acomodacao.id)}
                >
                  <div className="reserva-card-imagem-wrap">
                    {fotoCapa ? (
                      <img src={fotoCapa} alt={acomodacao.nome} className="reserva-card-imagem" />
                    ) : (
                      <div className="reserva-sem-foto"><FaImage /> Sem foto</div>
                    )}
                  </div>
                  <div className="reserva-card-info">
                    <h3>{acomodacao.nome}</h3>
                    <p>{formatarMoeda(acomodacao.precoDiaria)} / noite</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="reserva-detalhes">
            {acomodacaoSelecionada ? (
              <>
                <div className="reserva-galeria">
                  <div className="reserva-foto-principal-wrap">
                    {fotosSelecionadas.length > 0 ? (
                      <img
                        src={fotosSelecionadas[fotoAtivaIndex]}
                        alt={`${acomodacaoSelecionada.nome} - foto ${fotoAtivaIndex + 1}`}
                        className="reserva-foto-principal"
                      />
                    ) : (
                      <div className="reserva-foto-principal sem-foto"><FaImage /> Sem fotos cadastradas</div>
                    )}

                    {fotosSelecionadas.length > 1 && (
                      <>
                        <button type="button" className="reserva-nav-foto prev" onClick={() => trocarFoto(-1)} aria-label="Foto anterior">
                          <FaChevronLeft />
                        </button>
                        <button type="button" className="reserva-nav-foto next" onClick={() => trocarFoto(1)} aria-label="Próxima foto">
                          <FaChevronRight />
                        </button>
                      </>
                    )}
                  </div>

                  {fotosSelecionadas.length > 1 && (
                    <div className="reserva-thumbs">
                      {fotosSelecionadas.map((foto, index) => (
                        <button
                          type="button"
                          key={`${foto}-${index}`}
                          className={`reserva-thumb ${index === fotoAtivaIndex ? 'ativa' : ''}`}
                          onClick={() => setFotoAtivaIndex(index)}
                        >
                          <img src={foto} alt={`Miniatura ${index + 1}`} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="reserva-descricao">
                  <h3>{acomodacaoSelecionada.nome}</h3>
                  <p>{acomodacaoSelecionada.descricao}</p>
                  <div className="reserva-meta">
                    <span><FaUserFriends /> Até {acomodacaoSelecionada.capacidadePessoas} hóspede(s)</span>
                    <span>{formatarMoeda(acomodacaoSelecionada.precoDiaria)} por diária</span>
                  </div>
                </div>

                <form className="reserva-form" onSubmit={handleSubmit}>
                  <div className="reserva-auth-status">
                    {carregandoAuth
                      ? 'Validando seu acesso...'
                      : session?.user?.id
                        ? `Reserva vinculada a: ${session.user.email || 'usuário autenticado'}`
                        : 'Faça login para reservar com sua conta de cliente.'}
                  </div>

                  <div className="reserva-perfil-grid">
                    <label>
                      <span>Nome completo</span>
                      <input
                        type="text"
                        value={perfilForm.nome}
                        onChange={(e) => handlePerfilChange('nome', e.target.value)}
                        placeholder="Seu nome"
                        required
                      />
                    </label>

                    <label>
                      <span>E-mail</span>
                      <input
                        type="email"
                        value={perfilForm.email}
                        onChange={(e) => handlePerfilChange('email', e.target.value)}
                        placeholder="seu@email.com"
                        required
                      />
                    </label>

                    <label>
                      <span>Documento</span>
                      <input
                        type="text"
                        value={perfilForm.documento}
                        onChange={(e) => handlePerfilChange('documento', e.target.value)}
                        placeholder="CPF ou CNPJ"
                      />
                    </label>

                    <label>
                      <span>Telefone</span>
                      <input
                        type="text"
                        value={perfilForm.telefone}
                        onChange={(e) => handlePerfilChange('telefone', e.target.value)}
                        placeholder="(00) 00000-0000"
                      />
                    </label>

                    <label>
                      <span>CEP</span>
                      <input
                        type="text"
                        value={perfilForm.cep}
                        onChange={(e) => handlePerfilChange('cep', e.target.value)}
                        placeholder="00000-000"
                      />
                    </label>

                    <label>
                      <span>Rua</span>
                      <input
                        type="text"
                        value={perfilForm.rua}
                        onChange={(e) => handlePerfilChange('rua', e.target.value)}
                        placeholder="Rua"
                      />
                    </label>

                    <label>
                      <span>Bairro</span>
                      <input
                        type="text"
                        value={perfilForm.bairro}
                        onChange={(e) => handlePerfilChange('bairro', e.target.value)}
                        placeholder="Bairro"
                      />
                    </label>

                    <label>
                      <span>Cidade</span>
                      <input
                        type="text"
                        value={perfilForm.cidade}
                        onChange={(e) => handlePerfilChange('cidade', e.target.value)}
                        placeholder="Cidade"
                      />
                    </label>

                    <label>
                      <span>Estado</span>
                      <input
                        type="text"
                        maxLength={2}
                        value={perfilForm.estado}
                        onChange={(e) => handlePerfilChange('estado', e.target.value.toUpperCase())}
                        placeholder="UF"
                      />
                    </label>
                  </div>

                  <div className="reserva-form-grid">
                    <label>
                      <span><FaCalendarAlt /> Check-in</span>
                      <input
                        type="date"
                        min={hoje()}
                        value={form.data_checkin}
                        onChange={(e) => handleChange('data_checkin', e.target.value)}
                        required
                      />
                    </label>

                    <label>
                      <span><FaCalendarAlt /> Check-out</span>
                      <input
                        type="date"
                        min={form.data_checkin || hoje()}
                        value={form.data_checkout}
                        onChange={(e) => handleChange('data_checkout', e.target.value)}
                        required
                      />
                    </label>

                    <label>
                      <span><FaUserFriends /> Hóspedes</span>
                      <input
                        type="number"
                        min={1}
                        max={acomodacaoSelecionada.capacidadePessoas}
                        value={form.num_hospedes}
                        onChange={(e) => handleChange('num_hospedes', e.target.value)}
                      />
                    </label>
                  </div>

                  <div className="reserva-resumo">
                    <strong>{noites > 0 ? `${noites} noite(s)` : 'Selecione o período'}</strong>
                    <span>Total estimado: {formatarMoeda(valorEstimado)}</span>
                  </div>

                  {erro && <p className="reserva-feedback erro">{erro}</p>}
                  {sucesso && <p className="reserva-feedback sucesso">{sucesso}</p>}

                  <button
                    type="submit"
                    className="reserva-submit"
                    disabled={salvando || carregandoAuth || !session?.user?.id || acomodacaoSelecionada.status !== 'disponivel'}
                  >
                    {salvando ? 'Enviando...' : acomodacaoSelecionada.status !== 'disponivel' ? 'Acomodação indisponível' : 'Reservar período'}
                  </button>
                </form>
              </>
            ) : (
              <p>Não há acomodações disponíveis no momento.</p>
            )}
          </div>
          </div>

          {!loading && erro && !acomodacaoSelecionada && <p className="reserva-feedback erro">{erro}</p>}
        </>
      )}
    </section>
  );
};

export default Reserva;
