import axios from 'axios';
import { RAWG_API_KEY } from '../config/apiConfig';
import { RawgResponse, GameApiResult } from '../types/GameApiResult';

const BASE_URL = 'https://api.rawg.io/api';

export async function searchGames(query: string): Promise<GameApiResult[]> {
  if (!RAWG_API_KEY || RAWG_API_KEY === 'SUA_CHAVE_AQUI') {
    throw new Error('CHAVE_NAO_CONFIGURADA');
  }

  const response = await axios.get<RawgResponse>(`${BASE_URL}/games`, {
    params: {
      search: query,
      key: RAWG_API_KEY,
      page_size: 20,
      search_precise: true,
    },
    timeout: 10000,
  });

  if (!Array.isArray(response.data?.results)) return [];

  return response.data.results.map((item) => ({
    externalId: String(item.id),
    titulo: item.name,
    imagemUri: item.background_image ?? undefined,
    genero: item.genres?.map((g) => g.name).join(', ') || 'Não informado',
  }));
}
