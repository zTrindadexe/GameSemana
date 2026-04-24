export type Jogador = {
  nome: string;
  motivo?: string;
};

export type IndicacaoJogo = {
  id: number;
  titulo: string;
  genero: string;
  votos: number;
  observacao?: string;
  jogadoresJson: string;
  imagemUri?: string;
  destaque: boolean;
  origem: 'manual' | 'api';
  cheapSharkGameId?: string;
  createdAt: string;
  updatedAt: string;
};
