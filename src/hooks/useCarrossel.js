import { useState } from 'react';

export const useCarrossel = (fotos) => {
  const [idx, setIdx] = useState(0);
  const total = fotos.length;
  const prev  = () => setIdx(i => (i - 1 + total) % total);
  const next  = () => setIdx(i => (i + 1) % total);
  const usarDots = total > 1 && total <= 7;
  return { idx, setIdx, prev, next, usarDots };
};
