const STATUS_LABELS = {
  disponivel:   'Disponível',
  manutencao:   'Manutenção',
  indisponivel: 'Indisponível',
};

const formatarStatus = (valor) => {
  if (!valor) return 'Disponível';
  return STATUS_LABELS[String(valor).toLowerCase()] ?? valor;
};

/** Normaliza acomodação para os cards da home (carrossel, disponibilidade, badge). */
export const normalizarAcomodacaoCard = (item) => {
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