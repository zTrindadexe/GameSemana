export type CheapSharkGameResponse = {
  gameID: string;
  steamAppID: string | null;
  cheapest: string;
  cheapestDealID: string;
  external: string;
  internalName: string;
  thumb: string;
};

export type GameApiResult = {
  cheapSharkGameId: string;
  titulo: string;
  imagemUri?: string;
  precoReferencia?: string;
};
