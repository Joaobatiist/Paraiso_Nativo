import { pacotePromoService } from './pacotePromoService';

export const calcularReservaService = {
  // Calcular valor total da reserva considerando pacotes
  async calcularValorTotal(acomodacaoId, dataInicio, dataFim, valorDiaria) {
    try {
      // Buscar pacotes que se sobrepõem ao período
      const pacotes = await pacotePromoService.listarPorAcomodacaoEIntervalo(
        acomodacaoId,
        dataInicio,
        dataFim
      );
      
      // Normalizar datas (remover hora para comparação correta)
      const normalizarData = (dataStr) => {
        const d = new Date(dataStr + 'T00:00:00');
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      };

      const inicio = normalizarData(dataInicio);
      const fim = normalizarData(dataFim);
      
      // Calcular número de dias (não de noites)
      const dias = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24)) + 1;

      let valorTotal = 0;
      const detalhesArray = [];

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
          // Se está no pacote, dividir o valor do pacote pela quantidade de dias do pacote
          const pacInicio = normalizarData(pacoteAplicavel.data_inicial);
          const pacFim = normalizarData(pacoteAplicavel.data_final);
          const diasPacote = Math.ceil((pacFim - pacInicio) / (1000 * 60 * 60 * 24)) + 1;
          
          const valorDia = pacoteAplicavel.valor / diasPacote;
          valorTotal += valorDia;
          
          detalhesArray.push({
            data: diaString,
            eh_pacote: true,
            descricao: `Pacote: ${pacoteAplicavel.descricao}`,
            valor: parseFloat(valorDia.toFixed(2))
          });
        } else {
          // Se não está no pacote, usar valor da diária normal
          valorTotal += valorDiaria;
          
          detalhesArray.push({
            data: diaString,
            eh_pacote: false,
            descricao: 'Diária Normal',
            valor: parseFloat(valorDiaria.toFixed(2))
          });
        }
      }

      const resultado = {
        dias,
        valorDiaria: parseFloat(valorDiaria.toFixed(2)),
        pacotesAplicados: pacotes.length > 0,
        detalhes: detalhesArray,
        valorTotal: parseFloat(valorTotal.toFixed(2))
      };

      return resultado;
    } catch (error) {
      throw error;
    }
  }
};
