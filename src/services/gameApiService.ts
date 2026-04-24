import axios from 'axios';
import { CheapSharkGameResponse, GameApiResult } from '../types/GameApiResult';

const BASE_URL = 'https://www.cheapshark.com/api/1.0';

export async function searchGames(query: string): Promise<GameApiResult[]> {
  try {
    const response = await axios.get<CheapSharkGameResponse[]>(
      `${BASE_URL}/games`,
      {
        params: { title: query },
        timeout: 10000,
      }
    );

    if (!Array.isArray(response.data)) return [];

    return response.data.map((item) => ({
      cheapSharkGameId: item.gameID,
      titulo: item.external,
      imagemUri: item.thumb,
      precoReferencia: item.cheapest,
    }));
  } catch {
    return [];
  }
}
