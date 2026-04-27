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

export const forcaSenha = (senha) => {
  if (!senha) return { nivel: 0, texto: '', cor: '' };
  let pontos = 0;
  if (senha.length >= 6)  pontos++;
  if (senha.length >= 10) pontos++;
  if (/[A-Z]/.test(senha)) pontos++;
  if (/[0-9]/.test(senha)) pontos++;
  if (/[^A-Za-z0-9]/.test(senha)) pontos++;
  if (pontos <= 1) return { nivel: 1, texto: 'Fraca',  cor: '#ef4444' };
  if (pontos <= 3) return { nivel: 2, texto: 'Média',  cor: '#f59e0b' };
  return               { nivel: 3, texto: 'Forte',  cor: '#10b981' };
};