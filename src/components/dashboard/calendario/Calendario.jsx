import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { pacotePromoService } from '@services/pacotePromoService';
import { acomodacaoService } from '@services/acomodacaoService';
import './calendario.css';

export default function Calendario() {
  const [dataAtual, setDataAtual] = useState(new Date());
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [acomodacaoSelecionada, setAcomodacaoSelecionada] = useState('');
  const [acomodacoes, setAcomodacoes] = useState([]);
  const [pacotes, setPacotes] = useState([]);
  const [pacotesFiltrados, setPacotesFiltrados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  // Carregar pacotes e acomodações ao montar o componente
  useEffect(() => {
    carregarDados();
  }, []);

  // Filtrar pacotes quando acomodação muda
  useEffect(() => {
    if (acomodacaoSelecionada) {
      const filtrados = pacotes.filter(p => p.acomodacao_id === acomodacaoSelecionada);
      setPacotesFiltrados(filtrados);
    } else {
      setPacotesFiltrados([]);
    }
  }, [acomodacaoSelecionada, pacotes]);

  // Função para carregar pacotes e acomodações
  const carregarDados = async () => {
    try {
      setCarregando(true);
      setErro(null);
      
      // Carregar acomodações
      const acomodacoesDados = await acomodacaoService.listarTodasComFotos();
      setAcomodacoes(acomodacoesDados || []);
      
      // Carregar pacotes
      const pacotesDados = await pacotePromoService.listarTodos();
      setPacotes(pacotesDados || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setErro('Erro ao carregar dados. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  // Função para obter os dias do mês
  const getDiasDoMes = (data) => {
    return new Date(data.getFullYear(), data.getMonth() + 1, 0).getDate();
  };

  // Função para obter o primeiro dia da semana do mês
  const getPrimeiroDiaSemana = (data) => {
    return new Date(data.getFullYear(), data.getMonth(), 1).getDay();
  };

  // Função para navegar entre meses (avança 4 meses por vez)
  const navegarMes = (direcao) => {
    setDataAtual(prev => {
      const novaData = new Date(prev);
      novaData.setMonth(novaData.getMonth() + direcao * 4);
      return novaData;
    });
  };

  // Função para verificar se uma data está em um intervalo (em qualquer mês do intervalo)
  const estaNoIntervalo = (dia, mesRenderizado) => {
    if (!dataInicio || !dataFim) return false;
    
    const data = new Date(mesRenderizado.getFullYear(), mesRenderizado.getMonth(), dia);
    const inicio = new Date(Math.min(dataInicio.getTime(), dataFim.getTime()));
    const fim = new Date(Math.max(dataInicio.getTime(), dataFim.getTime()));
    
    // Destaca em qualquer mês que tenha datas do intervalo
    return data >= inicio && data <= fim;
  };

  // Função para verificar se a data é início ou fim (apenas no mês selecionado)
  const ehDataSelecionada = (dia, mesRenderizado) => {
    const data = new Date(mesRenderizado.getFullYear(), mesRenderizado.getMonth(), dia);
    
    // Só destaca seleção se estiver no mês onde a seleção começou
    return (dataInicio && data.toDateString() === dataInicio.toDateString()) ||
           (dataFim && data.toDateString() === dataFim.toDateString());
  };

  // Função para selecionar data
  const selecionarData = (dia, mesRenderizado) => {
    const dataSelecionada = new Date(mesRenderizado.getFullYear(), mesRenderizado.getMonth(), dia);
    
    if (!dataInicio) {
      setDataInicio(dataSelecionada);
    } else if (!dataFim) {
      if (dataSelecionada.getTime() === dataInicio.getTime()) {
        setDataInicio(null);
      } else {
        setDataFim(dataSelecionada);
      }
    } else {
      setDataInicio(dataSelecionada);
      setDataFim(null);
    }
  };

  // Função para salvar pacote promocional no Supabase
  const salvarPacote = async () => {
    if (!acomodacaoSelecionada || !dataInicio || !dataFim || !valor || !descricao.trim()) {
      alert('Preencha todos os campos!');
      return;
    }

    try {
      setCarregando(true);
      setErro(null);

      const inicio = new Date(Math.min(dataInicio.getTime(), dataFim.getTime()));
      const fim = new Date(Math.max(dataInicio.getTime(), dataFim.getTime()));

      const novoPacote = {
        acomodacao_id: acomodacaoSelecionada,
        data_inicial: inicio.toISOString().split('T')[0],
        data_final: fim.toISOString().split('T')[0],
        valor: parseFloat(valor),
        descricao: descricao.trim()
      };

      // Enviar para o Supabase
      await pacotePromoService.criar(novoPacote);
      
      // Recarregar a lista de pacotes
      await carregarDados();
      resetarSelecao();
      alert('Pacote criado com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar pacote:', err);
      setErro('Erro ao salvar pacote. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  // Função para resetar seleção
  const resetarSelecao = () => {
    setDataInicio(null);
    setDataFim(null);
    setValor('');
    setDescricao('');
  };

  // Função para deletar pacote do Supabase
  const deletarPacote = async (id) => {
    try {
      setCarregando(true);
      setErro(null);

      // Deletar do Supabase
      await pacotePromoService.deletar(id);
      
      // Recarregar a lista de pacotes
      await carregarDados();
      alert('Pacote deletado com sucesso!');
    } catch (err) {
      console.error('Erro ao deletar pacote:', err);
      setErro('Erro ao deletar pacote. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  // Renderizar meses
  const renderizarMes = (offset) => {
    const data = new Date(dataAtual);
    data.setMonth(data.getMonth() + offset);

    const diasDoMes = getDiasDoMes(data);
    const primeiroDia = getPrimeiroDiaSemana(data);
    const diasArray = [];

    // Adicionar dias em branco antes do primeiro dia
    for (let i = 0; i < primeiroDia; i++) {
      diasArray.push(null);
    }

    // Adicionar todos os dias do mês
    for (let dia = 1; dia <= diasDoMes; dia++) {
      diasArray.push(dia);
    }

    const mesAtualizado = new Date(data);
    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                         'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    return (
      <div key={offset} className="calendario-mes">
        <h3>{nomesMeses[mesAtualizado.getMonth()]}</h3>
        <div className="calendario-header">
          <span>D</span>
          <span>S</span>
          <span>T</span>
          <span>Q</span>
          <span>Q</span>
          <span>S</span>
          <span>S</span>
        </div>
        <div className="calendario-dias">
          {diasArray.map((dia, idx) => (
            <div
              key={idx}
              className={`dia ${
                dia === null ? 'vazio' : ''
              } ${
                ehDataSelecionada(dia, data) ? 'selecionado' : ''
              } ${
                estaNoIntervalo(dia, data) ? 'intervalo' : ''
              }`}
              onClick={() => dia !== null && selecionarData(dia, data)}
            >
              {dia}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="calendario-container">
      {erro && (
        <div className="erro-mensagem">
          {erro}
        </div>
      )}

      <div className="calendario-wrapper">
        <div className="calendario-navegacao">
          <button onClick={() => navegarMes(-1)} className="btn-nav">
            <FaChevronLeft />
          </button>
          <span className="mes-ano">
            {dataAtual.getFullYear()}
          </span>
          <button onClick={() => navegarMes(1)} className="btn-nav">
            <FaChevronRight />
          </button>
        </div>

        <div className="calendario-meses">
          {[0, 1, 2, 3].map(offset => renderizarMes(offset))}
        </div>

        <div className="selecao-info">
          <div className="data-selecionada">
            <p>
              <strong>Data Início:</strong>{' '}
              {dataInicio ? dataInicio.toLocaleDateString('pt-BR') : 'Não selecionada'}
            </p>
            <p>
              <strong>Data Fim:</strong>{' '}
              {dataFim ? dataFim.toLocaleDateString('pt-BR') : 'Não selecionada'}
            </p>
          </div>
        </div>
      </div>

      <div className="direita-container">
        <div className="pacote-form">
          <h2>Criar Pacote Promocional</h2>
          
          <div className="form-group">
            <label>Acomodação</label>
            <select
              value={acomodacaoSelecionada}
              onChange={(e) => setAcomodacaoSelecionada(e.target.value)}
              disabled={carregando}
            >
              <option value="">Selecione uma acomodação</option>
              {acomodacoes.map(acom => (
                <option key={acom.id} value={acom.id}>
                  {acom.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Valor (R$)</label>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Ex: 250.00"
              step="0.01"
              min="0"
              disabled={!acomodacaoSelecionada || !dataInicio || !dataFim}
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Promoção de Páscoa"
              disabled={!acomodacaoSelecionada || !dataInicio || !dataFim}
            />
          </div>

          <div className="form-buttons">
            <button
              onClick={salvarPacote}
              className="btn-salvar"
              disabled={!acomodacaoSelecionada || !dataInicio || !dataFim || carregando}
            >
              {carregando ? 'Salvando...' : 'Salvar Pacote'}
            </button>
            <button
              onClick={resetarSelecao}
              className="btn-resetar"
              disabled={carregando}
            >
              Limpar Seleção
            </button>
          </div>
        </div>

        <div className="pacotes-lista">
          <h2>Pacotes Promocionais</h2>
          {carregando ? (
            <p className="carregando">Carregando pacotes...</p>
          ) : pacotes.length === 0 ? (
            <p className="sem-pacotes">Nenhum pacote criado ainda</p>
          ) : (
            <div className="pacotes-grid">
              {pacotes.map(pacote => (
                <div key={pacote.id} className="pacote-card">
                  <div className="pacote-header">
                    <div>
                      <h3>{pacote.descricao}</h3>
                      <p className="pacote-acomodacao">
                        {pacote.acomodacoes?.nome || 'Acomodação indisponível'}
                      </p>
                    </div>
                    <button
                      onClick={() => deletarPacote(pacote.id)}
                      className="btn-deletar"
                      disabled={carregando}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="pacote-info">
                    <p><strong>Período:</strong> {pacote.data_inicial} até {pacote.data_final}</p>
                    <p><strong>Valor:</strong> R$ {pacote.valor.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
