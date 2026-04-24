import { getDatabase } from './database';
import { IndicacaoJogo, Jogador } from '../types/IndicacaoJogo';
import {
  getInicioSemanaAtual,
  getFimSemanaAtual,
  getInicioSemanaAnterior,
  getFimSemanaAnterior,
} from '../utils/dateUtils';
import { parseJogadores, stringifyJogadores } from '../utils/jsonUtils';

function rowToIndicacao(row: any): IndicacaoJogo {
  return {
    id: row.id,
    titulo: row.titulo,
    genero: row.genero ?? 'Não informado',
    votos: row.votos ?? 0,
    observacao: row.observacao ?? undefined,
    jogadoresJson: row.jogadores_json ?? '[]',
    imagemUri: row.imagem_uri ?? undefined,
    destaque: row.destaque === 1,
    origem: row.origem ?? 'manual',
    cheapSharkGameId: row.cheap_shark_game_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createIndicacao(
  dados: Omit<IndicacaoJogo, 'id'>
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO indicacoes_jogos
      (titulo, genero, votos, observacao, jogadores_json, imagem_uri, destaque, origem, cheap_shark_game_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      dados.titulo,
      dados.genero,
      dados.votos,
      dados.observacao ?? null,
      dados.jogadoresJson,
      dados.imagemUri ?? null,
      dados.destaque ? 1 : 0,
      dados.origem,
      dados.cheapSharkGameId ?? null,
      dados.createdAt,
      dados.updatedAt,
    ]
  );
  return result.lastInsertRowId;
}

export async function getIndicacoesSemanaAtual(): Promise<IndicacaoJogo[]> {
  const db = await getDatabase();
  const inicio = getInicioSemanaAtual();
  const fim = getFimSemanaAtual();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM indicacoes_jogos
     WHERE created_at >= ? AND created_at <= ?
     ORDER BY destaque DESC, votos DESC, created_at ASC`,
    [inicio, fim]
  );
  return rows.map(rowToIndicacao);
}

export async function getIndicacaoById(id: number): Promise<IndicacaoJogo | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM indicacoes_jogos WHERE id = ?',
    [id]
  );
  return row ? rowToIndicacao(row) : null;
}

export async function updateIndicacao(
  id: number,
  dados: Pick<IndicacaoJogo, 'titulo' | 'genero' | 'observacao' | 'imagemUri'>
): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE indicacoes_jogos
     SET titulo = ?,
         genero = ?,
         observacao = ?,
         imagem_uri = ?,
         updated_at = ?
     WHERE id = ?`,
    [
      dados.titulo,
      dados.genero,
      dados.observacao ?? null,
      dados.imagemUri ?? null,
      now,
      id,
    ]
  );
}

export async function deleteIndicacao(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM indicacoes_jogos WHERE id = ?', [id]);
}

export async function searchIndicacoesLocais(
  termo: string
): Promise<IndicacaoJogo[]> {
  const db = await getDatabase();
  const inicio = getInicioSemanaAtual();
  const fim = getFimSemanaAtual();
  const like = `%${termo}%`;
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM indicacoes_jogos
     WHERE created_at >= ? AND created_at <= ?
       AND (titulo LIKE ? OR genero LIKE ?)
     ORDER BY destaque DESC, votos DESC`,
    [inicio, fim, like, like]
  );
  return rows.map(rowToIndicacao);
}

export async function votarEmIndicacao(
  id: number,
  jogador: Jogador
): Promise<void> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>(
    'SELECT jogadores_json, votos FROM indicacoes_jogos WHERE id = ?',
    [id]
  );
  if (!row) return;

  const jogadores = parseJogadores(row.jogadores_json);
  const jaVotou = jogadores.some(
    (j) => j.nome.toLowerCase() === jogador.nome.toLowerCase()
  );
  if (jaVotou) throw new Error('Você já votou neste jogo.');

  jogadores.push(jogador);
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE indicacoes_jogos
     SET votos = votos + 1,
         jogadores_json = ?,
         updated_at = ?
     WHERE id = ?`,
    [stringifyJogadores(jogadores), now, id]
  );
}

export async function getJogoMaisVotadoSemanaAnterior(): Promise<IndicacaoJogo | null> {
  const db = await getDatabase();
  const inicio = getInicioSemanaAnterior();
  const fim = getFimSemanaAnterior();
  const row = await db.getFirstAsync<any>(
    `SELECT * FROM indicacoes_jogos
     WHERE created_at >= ? AND created_at <= ?
     ORDER BY votos DESC, created_at ASC
     LIMIT 1`,
    [inicio, fim]
  );
  return row ? rowToIndicacao(row) : null;
}

export async function existeIndicacaoNaSemanaAtual(): Promise<boolean> {
  const db = await getDatabase();
  const inicio = getInicioSemanaAtual();
  const fim = getFimSemanaAtual();
  const row = await db.getFirstAsync<any>(
    `SELECT COUNT(*) as total FROM indicacoes_jogos
     WHERE created_at >= ? AND created_at <= ?`,
    [inicio, fim]
  );
  return (row?.total ?? 0) > 0;
}

export async function criarDestaqueDaSemanaAtual(
  base: IndicacaoJogo
): Promise<void> {
  const now = new Date().toISOString();
  await createIndicacao({
    titulo: base.titulo,
    genero: base.genero,
    votos: 0,
    observacao: undefined,
    jogadoresJson: '[]',
    imagemUri: base.imagemUri,
    destaque: true,
    origem: base.origem,
    cheapSharkGameId: base.cheapSharkGameId,
    createdAt: now,
    updatedAt: now,
  });
}

export async function getHistoricoIndicacoes(): Promise<IndicacaoJogo[]> {
  const db = await getDatabase();
  const inicio = getInicioSemanaAtual();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM indicacoes_jogos
     WHERE created_at < ?
     ORDER BY created_at DESC`,
    [inicio]
  );
  return rows.map(rowToIndicacao);
}

export type CampeaoSemanal = {
  semanaInicio: string;
  campeao: IndicacaoJogo;
  totalIndicacoes: number;
};

export async function getHistoricoSemanal(): Promise<CampeaoSemanal[]> {
  const todos = await getHistoricoIndicacoes();
  if (todos.length === 0) return [];

  const porSemana = new Map<string, IndicacaoJogo[]>();
  for (const ind of todos) {
    const d = new Date(ind.createdAt);
    const dia = d.getDay();
    const diff = dia === 0 ? -6 : 1 - dia;
    const segunda = new Date(d);
    segunda.setDate(segunda.getDate() + diff);
    segunda.setHours(0, 0, 0, 0);
    const chave = segunda.toISOString();
    if (!porSemana.has(chave)) porSemana.set(chave, []);
    porSemana.get(chave)!.push(ind);
  }

  return Array.from(porSemana.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([semanaInicio, indicacoes]) => {
      const campeao = indicacoes.reduce((melhor, atual) =>
        atual.votos > melhor.votos ? atual : melhor
      );
      return { semanaInicio, campeao, totalIndicacoes: indicacoes.length };
    });
}
