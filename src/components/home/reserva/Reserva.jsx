import { useEffect, useMemo, useState } from 'react';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaImage, FaUserFriends } from 'react-icons/fa';
import { FaCircleExclamation } from 'react-icons/fa6';
import { acomodacaoService } from '@services/acomodacaoService';
import { reservaService } from '@services/reservaService';
import { perfilService } from '@services/perfilService';
import { calcularReservaService } from '@services/calcularReservaService';
import { pacotePromoService } from '@services/pacotePromoService';
import { useAuth } from '@hooks/useAuth';
import { normalizarAcomodacao } from '@utils/normalizadores';
import { calcularNoites, calcularDiariaPorHospedes } from '@utils/calculadores';
import { formatarMoeda, hoje, formatarData } from '@utils/formatters';
import { validarReservaHome, perfilCamposFaltando } from '@utils/validators';
import {
  mascaraTelefone,
  mascaraCPF,
  mascaraCEP,
  apenasLetras,
  apenasLetrasNumeros
} from '@utils/masks';
import './Reserva.css';

const CAMPOS_PERFIL = [
  { campo: 'nome',      label: 'Nome completo', type: 'text',  placeholder: 'Seu nome',        obrigatorio: true  },
  { campo: 'email',     label: 'E-mail',        type: 'email', placeholder: 'seu@email.com',   obrigatorio: false },
  { campo: 'documento', label: 'CPF ou CNPJ',   type: 'text',  placeholder: '000.000.000-00',  obrigatorio: true, inputMode: 'numeric' },
  { campo: 'telefone',  label: 'Telefone',      type: 'text',  placeholder: '(00) 00000-0000', obrigatorio: true, inputMode: 'numeric' },
  { campo: 'cep',       label: 'CEP',           type: 'text',  placeholder: '00000-000',       obrigatorio: false, inputMode: 'numeric' },
  { campo: 'rua',       label: 'Rua',           type: 'text',  placeholder: 'Rua',             obrigatorio: false },
  { campo: 'bairro',    label: 'Bairro',        type: 'text',  placeholder: 'Bairro',          obrigatorio: false },
  { campo: 'cidade',    label: 'Cidade',        type: 'text',  placeholder: 'Cidade',          obrigatorio: false },
  { campo: 'estado',    label: 'Estado',        type: 'text',  placeholder: 'UF',              obrigatorio: false, maxLength: 2 },
];

const Reserva = () => {
  const [acomodacoes, setAcomodacoes] = useState([]);
  const [loadingAcomodacoes, setLoadingAcomodacoes] = useState(true);
  const { session, perfil, loading: loadingAuth } = useAuth();
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [acomodacaoSelecionadaId, setAcomodacaoSelecionadaId] = useState('');
  const [fotoAtivaIndex, setFotoAtivaIndex] = useState(0);
  const [form, setForm] = useState({ data_checkin: '', data_checkout: '', hospedes: 1 });
  const [perfilForm, setPerfilForm] = useState({
    nome: '', email: '', documento: '', telefone: '',
    cep: '', rua: '', bairro: '', cidade: '', estado: '',
  });
  const [salvando, setSalvando] = useState(false);
  const [valorEstimadoCalculado, setValorEstimadoCalculado] = useState(0);

  useEffect(() => {
    if (perfil) {
      setPerfilForm({
        nome:      perfil.nome      || session?.user?.user_metadata?.nome || '',
        email:     perfil.email     || session?.user?.email || '',
        documento: perfil.documento || '',
        telefone:  perfil.telefone  || '',
        cep:       perfil.cep       || '',
        rua:       perfil.rua       || '',
        bairro:    perfil.bairro    || '',
        cidade:    perfil.cidade    || '',
        estado:    perfil.estado    || '',
      });
    }
  }, [perfil, session?.user?.email]);

  const camposFaltando = perfilCamposFaltando(perfilForm);

  useEffect(() => {
    let cancelado = false;

    const carregar = async () => {
      if (loadingAuth) return;

      if (!session?.user?.id) {
        if (!cancelado) {
          setAcomodacoes([]);
          setAcomodacaoSelecionadaId('');
          setLoadingAcomodacoes(false);
        }
        return;
      }

      setLoadingAcomodacoes(true);
      try {
        const data = await acomodacaoService.listarTodasComFotos();
        if (cancelado) return;

        const lista = (data || []).map(normalizarAcomodacao);
        setAcomodacoes(lista);

        if (!lista.length) return;
        const params = new URLSearchParams(window.location.search);
        const preSelecionada = params.get('acomodacao');
        const existe = lista.some((item) => String(item.id) === String(preSelecionada));
        setAcomodacaoSelecionadaId(existe ? preSelecionada : lista[0].id);
      } catch (error) {
        console.error('Erro ao carregar acomodações:', error);
      } finally {
        if (!cancelado) setLoadingAcomodacoes(false);
      }
    };

    carregar();
    return () => { cancelado = true; };
  }, [session?.user?.id, loadingAuth]);

  const acomodacaoSelecionada = useMemo(
    () => acomodacoes.find((item) => item.id === acomodacaoSelecionadaId) || null,
    [acomodacoes, acomodacaoSelecionadaId]
  );

  useEffect(() => {
    const calcularValor = async () => {
      if (!acomodacaoSelecionada?.id || !form.data_checkin || !form.data_checkout) {
        setValorEstimadoCalculado(0);
        return;
      }
      try {
        const resultado = await calcularReservaService.calcularValorTotal(
          acomodacaoSelecionada.id,
          form.data_checkin,
          form.data_checkout,
          acomodacaoSelecionada.precoDiaria,
          form.hospedes
        );
        setValorEstimadoCalculado(resultado.valorTotal);
      } catch {
        const noites = calcularNoites(form.data_checkin, form.data_checkout);
        const valorDiaria = calcularDiariaPorHospedes(form.hospedes, acomodacaoSelecionada?.precoDiaria);
        setValorEstimadoCalculado(valorDiaria * noites);
      }
    };

    calcularValor();
  }, [acomodacaoSelecionada?.id, form.data_checkin, form.data_checkout, form.hospedes]);

  const noites = calcularNoites(form.data_checkin, form.data_checkout);
  const valorDiaria = calcularDiariaPorHospedes(form.hospedes, acomodacaoSelecionada?.precoDiaria);
  const valorEstimado = valorEstimadoCalculado > 0 ? valorEstimadoCalculado : valorDiaria * noites;

  const fotosSelecionadas = acomodacaoSelecionada?.fotos || [];

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
    let v = valor;
    if (campo === 'telefone') v = mascaraTelefone(valor);
    if (campo === 'documento') v = mascaraCPF(valor);
    if (campo === 'cep') v = mascaraCEP(valor);
    if (campo === 'nome') v = apenasLetras(valor);
    if (campo === 'estado') v = valor.toUpperCase().slice(0, 2);
    if (campo === 'cidade') v = apenasLetras(valor);
    if (campo === 'bairro') v = apenasLetrasNumeros(valor);
    if (campo === 'rua') v = apenasLetrasNumeros(valor);
    setPerfilForm((prev) => ({ ...prev, [campo]: v }));
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

    const { valido, erros } = validarReservaHome({ acomodacaoSelecionada, session, perfilForm, form });
    if (!valido) {
      setErro(Object.values(erros)[0]);
      return;
    }

    setSalvando(true);
    try {
      const pacotesEmConflito = await pacotePromoService.listarPorAcomodacaoEIntervalo(
        acomodacaoSelecionada.id,
        form.data_checkin,
        form.data_checkout
      );

      const pacotesComSobreposicaoParcial = pacotesEmConflito.filter((pacote) => {
        const dataInicialPacote = String(pacote.data_inicial).split('T')[0];
        const dataFinalPacote = String(pacote.data_final).split('T')[0];
        return !(form.data_checkin <= dataInicialPacote && form.data_checkout >= dataFinalPacote);
      });

      if (pacotesComSobreposicaoParcial.length > 0) {
        const datasConflito = pacotesComSobreposicaoParcial
          .map(p => `${formatarData(p.data_inicial)} a ${formatarData(p.data_final)}`)
          .join(', ');
        setErro(`As datas selecionadas precisam incluir o pacote completo. Período do pacote: ${datasConflito}.`);
        return;
      }

      await perfilService.salvarPerfilCliente(session.user.id, perfilForm);

      const novaReserva = await reservaService.criarNovaReserva({
        id_usuario: session.user.id,
        id_acomodacao: acomodacaoSelecionada.id,
        data_checkin: form.data_checkin,
        data_checkout: form.data_checkout,
        valor_total: valorEstimado,
        hospedes: Number(form.hospedes) || 1,
        status_reserva: 'pendente',
      });

      const urlPagamento = await reservaService.iniciarPagamento(novaReserva.id);
      window.location.href = urlPagamento;
    } catch (error) {
      const msg = error.message || '';
      if (msg.includes('impedir_conflito_reserva') || msg.includes('já está reservado')) {
        setErro('Você já tem uma reserva ativa para estas datas. Acesse "Minhas Reservas" no painel para concluir o pagamento ou cancelar.');
      } else {
        setErro(msg || 'Não foi possível finalizar a reserva agora.');
      }
    } finally {
      setSalvando(false);
    }
  };

  return (
    <section id="services" className="reserva-section">
      {loadingAuth ? (
        <div className="reserva-loading">Validando acesso...</div>
      ) : !session?.user?.id ? (
        <div className="reserva-auth-gate">
          <h3>Faça login para reservar</h3>
          <p>O acesso para reservas agora está concentrado em uma única tela de login.</p>
          <button type="button" className="reserva-submit" onClick={() => { window.location.href = '/login'; }}>
            Entrar ou cadastrar
          </button>
        </div>
      ) : loadingAcomodacoes ? (
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
                      {loadingAuth
                        ? 'Validando seu acesso...'
                        : session?.user?.id
                          ? `Reserva vinculada a: ${session.user.email || 'usuário autenticado'}`
                          : 'Faça login para reservar com sua conta de cliente.'}
                    </div>

                    {camposFaltando.length > 0 && (
                      <div className="reserva-perfil-aviso">
                        <FaCircleExclamation className="reserva-perfil-aviso-icone" />
                        <div>
                          <strong>Complete seus dados para reservar</strong>
                          <p>
                            Preencha os campos obrigatórios:{' '}
                            {camposFaltando.map(({ label }) => label).join(', ')}.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="reserva-perfil-grid">
                      {CAMPOS_PERFIL.map(({ campo, label, type, placeholder, obrigatorio, inputMode, maxLength }) => {
                        const faltando = obrigatorio && !perfilForm[campo]?.trim();
                        return (
                          <label key={campo}>
                            <span>
                              {label}
                              {faltando && <span className="campo-obrigatorio-tag">obrigatório</span>}
                            </span>
                            <input
                              type={type}
                              value={perfilForm[campo]}
                              onChange={(e) => handlePerfilChange(campo, campo === 'estado' ? e.target.value.toUpperCase() : e.target.value)}
                              placeholder={placeholder}
                              className={faltando ? 'campo-faltando' : ''}
                              inputMode={inputMode}
                              maxLength={maxLength}
                              required={obrigatorio}
                            />
                          </label>
                        );
                      })}
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
                          value={form.hospedes}
                          onChange={(e) => handleChange('hospedes', e.target.value)}
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
                      disabled={salvando || !session?.user?.id || acomodacaoSelecionada.status !== 'disponivel' || camposFaltando.length > 0}
                    >
                      {salvando
                        ? 'Processando...'
                        : acomodacaoSelecionada.status !== 'disponivel'
                        ? 'Acomodação indisponível'
                        : camposFaltando.length > 0
                        ? 'Preencha os dados obrigatórios'
                        : 'Reservar e pagar'}
                    </button>
                  </form>
                </>
              ) : (
                <p>Não há acomodações disponíveis no momento.</p>
              )}
            </div>
          </div>

          {!loadingAuth && erro && !acomodacaoSelecionada && <p className="reserva-feedback erro">{erro}</p>}
        </>
      )}
    </section>
  );
};

export default Reserva;
