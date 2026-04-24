import {
  existeIndicacaoNaSemanaAtual,
  getJogoMaisVotadoSemanaAnterior,
  criarDestaqueDaSemanaAtual,
} from '../database/indicacaoJogoRepository';

export async function prepararSemanaAtual(): Promise<void> {
  const jaExiste = await existeIndicacaoNaSemanaAtual();
  if (jaExiste) return;

  const maisVotado = await getJogoMaisVotadoSemanaAnterior();
  if (!maisVotado) return;

  await criarDestaqueDaSemanaAtual(maisVotado);
}
