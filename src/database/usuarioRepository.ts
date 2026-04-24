import { getDatabase } from './database';
import { Usuario } from '../types/Usuario';

function rowToUsuario(row: any): Usuario {
  return {
    id: row.id,
    nome: row.nome,
    createdAt: row.created_at,
  };
}

export async function cadastrarUsuario(
  nome: string,
  senha: string
): Promise<void> {
  const db = await getDatabase();

  const existente = await db.getFirstAsync<any>(
    'SELECT id FROM usuarios WHERE LOWER(nome) = LOWER(?)',
    [nome]
  );
  if (existente) {
    throw new Error('USUARIO_JA_EXISTE');
  }

  const now = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO usuarios (nome, senha, created_at) VALUES (?, ?, ?)',
    [nome.trim(), senha, now]
  );
}

export async function loginUsuario(
  nome: string,
  senha: string
): Promise<Usuario> {
  const db = await getDatabase();

  const row = await db.getFirstAsync<any>(
    'SELECT * FROM usuarios WHERE LOWER(nome) = LOWER(?) AND senha = ?',
    [nome, senha]
  );

  if (!row) {
    throw new Error('CREDENCIAIS_INVALIDAS');
  }

  return rowToUsuario(row);
}
