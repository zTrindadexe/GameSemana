import { Jogador } from '../types/IndicacaoJogo';

export function parseJogadores(json: string): Jogador[] {
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) return parsed as Jogador[];
    return [];
  } catch {
    return [];
  }
}

export function stringifyJogadores(jogadores: Jogador[]): string {
  return JSON.stringify(jogadores);
}
