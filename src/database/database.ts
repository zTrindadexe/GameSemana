import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('jogaessa.db');
    await initDatabase(db);
  }
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS indicacoes_jogos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      genero TEXT DEFAULT 'Não informado',
      votos INTEGER DEFAULT 0,
      observacao TEXT,
      jogadores_json TEXT DEFAULT '[]',
      imagem_uri TEXT,
      destaque INTEGER DEFAULT 0,
      origem TEXT DEFAULT 'manual',
      cheap_shark_game_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}
