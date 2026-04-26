/**
 * Formatação da moeda e para o dia.
 * @param {Object} valor - Dados brutos da moeda
 */

export const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(valor || 0);
};
export const hoje = () => new Date().toISOString().split('T')[0];