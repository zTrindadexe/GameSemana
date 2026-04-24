function getSegundaFeira(data: Date): Date {
  const d = new Date(data);
  const diaSemana = d.getDay();
  const diff = diaSemana === 0 ? -6 : 1 - diaSemana;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDomingo(segunda: Date): Date {
  const d = new Date(segunda);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getInicioSemanaAtual(): string {
  return getSegundaFeira(new Date()).toISOString();
}

export function getFimSemanaAtual(): string {
  return getDomingo(getSegundaFeira(new Date())).toISOString();
}

export function getInicioSemanaAnterior(): string {
  const segunda = getSegundaFeira(new Date());
  segunda.setDate(segunda.getDate() - 7);
  return segunda.toISOString();
}

export function getFimSemanaAnterior(): string {
  const segunda = getSegundaFeira(new Date());
  const fimAnterior = new Date(segunda);
  fimAnterior.setDate(fimAnterior.getDate() - 1);
  fimAnterior.setHours(23, 59, 59, 999);
  return fimAnterior.toISOString();
}

export function isDateInCurrentWeek(dateIso: string): boolean {
  const inicio = getInicioSemanaAtual();
  const fim = getFimSemanaAtual();
  return dateIso >= inicio && dateIso <= fim;
}

export function formatarData(dateIso: string): string {
  const d = new Date(dateIso);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getLabelSemana(dateIso: string): string {
  const inicio = new Date(dateIso);
  const fim = new Date(dateIso);
  fim.setDate(fim.getDate() + 6);
  return `${inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} – ${fim.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
}
