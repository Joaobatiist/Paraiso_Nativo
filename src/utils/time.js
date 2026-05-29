const toTimestamp = (value) => {
  if (!value) return Number.POSITIVE_INFINITY;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
};

export const ordenarReservasPorData = (reservas = []) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const inicioHoje = hoje.getTime();

  return [...reservas].sort((a, b) => {
    const checkinA = toTimestamp(a.data_checkin);
    const checkinB = toTimestamp(b.data_checkin);
    const aEhFutura = checkinA >= inicioHoje;
    const bEhFutura = checkinB >= inicioHoje;

    if (aEhFutura !== bEhFutura) {
      return aEhFutura ? -1 : 1;
    }

    if (checkinA !== checkinB) {
      return aEhFutura ? checkinA - checkinB : checkinB - checkinA;
    }

    const criadoA = toTimestamp(a.criado_em);
    const criadoB = toTimestamp(b.criado_em);
    return criadoA - criadoB;
  });
};