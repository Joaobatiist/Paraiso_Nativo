
export const calcularDiariaPorHospedes = (hospedes, precoDiaria) => {
  // Converter para números
  hospedes = Number(hospedes) || 1;
  precoDiaria = Number(precoDiaria) || 0;
  
  // Proteção
  if (!hospedes || !precoDiaria) return 0;
  
  if (hospedes <= 2) return precoDiaria;
  return precoDiaria + (hospedes - 2) * 50;
};

export const calcularNoites = (checkin, checkout) => {
  if (!checkin || !checkout) return 0;
  const inicio = new Date(checkin);
  const fim = new Date(checkout);
  const diff = fim.getTime() - inicio.getTime();
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
};