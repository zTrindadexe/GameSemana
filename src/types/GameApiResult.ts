export type RawgGame = {
  id: number;
  name: string;
  background_image: string | null;
  genres: { id: number; name: string }[];
  rating: number;
  released: string | null;
};

export type RawgResponse = {
  count: number;
  results: RawgGame[];
};

export type GameApiResult = {
  externalId: string;
  titulo: string;
  imagemUri?: string;
  genero: string;
};
