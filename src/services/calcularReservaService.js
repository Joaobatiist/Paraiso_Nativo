import { pacotePromoService } from './pacotePromoService';
import { calcularDiariaPorHospedes } from '@utils/calculadores';

export const calcularReservaService = {
  async calcularValorTotal(acomodacaoId, dataInicio, dataFim, valorDiaria, hospede) {
    try {
      // Buscar pacotes que se sobrepõem ao período
      const pacotes = await pacotePromoService.listarPorAcomodacaoEIntervalo(
        acomodacaoId,
        dataInicio,
        dataFim,
      );
      
      // Normalizar datas (remover hora para comparação correta)
      const normalizarData = (dataStr) => {
        const d = new Date(dataStr + 'T00:00:00');
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      };

      const inicio = normalizarData(dataInicio);
      const fim = normalizarData(dataFim);
      
      // Calcular número de dias do período selecionado.
      const dias = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24));

      if (dias <= 0) {
        throw new Error('Período de reserva inválido.');
      }

      const diariaPorHospedes = calcularDiariaPorHospedes(hospede, valorDiaria);

      let valorTotal = 0;
      const detalhesArray = [];
      const pacotesJaCobrado = new Set();

      // Iterar por cada dia da reserva
      for (let i = 0; i < dias; i++) {
        const diaAtual = new Date(inicio);
        diaAtual.setDate(diaAtual.getDate() + i);
        const diaString = diaAtual.toISOString().split('T')[0];

        // Verificar se este dia está em algum pacote
        const pacoteAplicavel = pacotes.find(p => {
          const pacInicio = normalizarData(p.data_inicial);
          const pacFim = normalizarData(p.data_final);
          
          // Comparar datas normalizadas
          const estaNoPeriodo = diaAtual >= pacInicio && diaAtual <= pacFim;
          return estaNoPeriodo;
        });

        if (pacoteAplicavel) {
          const valorPacote = Number(pacoteAplicavel.valor) || 0;
          const pacoteJaCobrado = pacotesJaCobrado.has(pacoteAplicavel.id);

          if (!pacoteJaCobrado) {
            valorTotal += valorPacote;
            pacotesJaCobrado.add(pacoteAplicavel.id);
          }
          
          detalhesArray.push({
            data: diaString,
            eh_pacote: true,
            descricao: `Pacote: ${pacoteAplicavel.descricao}`,
            valor: parseFloat((pacoteJaCobrado ? 0 : valorPacote).toFixed(2))
          });
        } else {
          // Se não está no pacote, usar valor da diária normal com acréscimo por hóspede extra.
          valorTotal += diariaPorHospedes;
          
          detalhesArray.push({
            data: diaString,
            eh_pacote: false,
            descricao: 'Diária Normal',
            valor: parseFloat(diariaPorHospedes.toFixed(2))
          });
        }
      }

      const resultado = {
        dias,
        valorDiaria: parseFloat(valorDiaria.toFixed(2)),
        pacotesAplicados: pacotesJaCobrado.size > 0,
        detalhes: detalhesArray,
        valorTotal: parseFloat(valorTotal.toFixed(2))
      };

      return resultado;
    } catch (error) {
      throw error;
    }
  }
};
