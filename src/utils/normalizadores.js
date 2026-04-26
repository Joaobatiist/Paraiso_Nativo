/**
 * Normaliza dados de acomodação da API para formato do componente
 * @param {Object} item - Dados brutos da acomodação
 * @returns {Object} Acomodação normalizada com fotos e valores formatados
 */

export const normalizarAcomodacao = (item) => {
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