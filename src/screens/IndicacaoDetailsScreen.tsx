import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/Navigation';
import { IndicacaoJogo, Jogador } from '../types/IndicacaoJogo';
import {
  getIndicacaoById,
  deleteIndicacao,
  votarEmIndicacao,
} from '../database/indicacaoJogoRepository';
import { parseJogadores } from '../utils/jsonUtils';
import { formatarData } from '../utils/dateUtils';
import { PrimaryButton } from '../components/PrimaryButton';

type Nav = NativeStackNavigationProp<RootStackParamList, 'IndicacaoDetails'>;
type Route = RouteProp<RootStackParamList, 'IndicacaoDetails'>;

export function IndicacaoDetailsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { id } = route.params;

  const [indicacao, setIndicacao] = useState<IndicacaoJogo | null>(null);

  useFocusEffect(
    useCallback(() => {
      getIndicacaoById(id).then(setIndicacao);
    }, [id])
  );

  const handleVotar = () => {
    if (!indicacao) return;

    Alert.prompt(
      'Votar em ' + indicacao.titulo,
      'Qual é o seu nome?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Próximo',
          onPress: (nome) => {
            if (!nome?.trim()) {
              Alert.alert('Nome obrigatório', 'Informe seu nome para votar.');
              return;
            }
            Alert.prompt(
              'Motivo (opcional)',
              'Por que quer jogar?',
              [
                {
                  text: 'Votar',
                  onPress: async (motivo) => {
                    try {
                      await votarEmIndicacao(id, {
                        nome: nome.trim(),
                        motivo: motivo?.trim() || undefined,
                      });
                      const atualizado = await getIndicacaoById(id);
                      setIndicacao(atualizado);
                    } catch (e: any) {
                      Alert.alert('Ops!', e.message ?? 'Erro ao votar.');
                    }
                  },
                },
              ],
              'plain-text'
            );
          },
        },
      ],
      'plain-text'
    );
  };

  const handleExcluir = () => {
    Alert.alert(
      'Excluir indicação',
      `Tem certeza que deseja excluir "${indicacao?.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deleteIndicacao(id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!indicacao) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  const jogadores: Jogador[] = parseJogadores(indicacao.jogadoresJson);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {indicacao.destaque && (
        <View style={styles.destaqueBanner}>
          <Text style={styles.destaqueText}>🔥 Destaque da semana anterior</Text>
        </View>
      )}

      {indicacao.imagemUri ? (
        <Image
          source={{ uri: indicacao.imagemUri }}
          style={styles.imagem}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.imagem, styles.semImagem]}>
          <Text style={styles.semImagemIcon}>🎮</Text>
        </View>
      )}

      <Text style={styles.titulo}>{indicacao.titulo}</Text>
      <Text style={styles.genero}>{indicacao.genero}</Text>

      <View style={styles.votosContainer}>
        <Text style={styles.votosNumero}>{indicacao.votos}</Text>
        <Text style={styles.votosLabel}>{indicacao.votos === 1 ? 'voto' : 'votos'}</Text>
      </View>

      {indicacao.observacao ? (
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Observação</Text>
          <Text style={styles.secaoTexto}>{indicacao.observacao}</Text>
        </View>
      ) : null}

      <View style={styles.secao}>
        <Text style={styles.secaoTitulo}>
          Quem quer jogar ({jogadores.length})
        </Text>
        {jogadores.length === 0 ? (
          <Text style={styles.semJogadores}>Ninguém votou ainda. Seja o primeiro!</Text>
        ) : (
          jogadores.map((j, i) => (
            <View key={i} style={styles.jogadorCard}>
              <Text style={styles.jogadorNome}>👤 {j.nome}</Text>
              {j.motivo ? (
                <Text style={styles.jogadorMotivo}>{j.motivo}</Text>
              ) : null}
            </View>
          ))
        )}
      </View>

      <View style={styles.secao}>
        <Text style={styles.secaoTitulo}>Informações</Text>
        <Text style={styles.infoLinha}>
          Origem: <Text style={styles.infoValor}>{indicacao.origem === 'api' ? 'Busca na API' : 'Manual'}</Text>
        </Text>
        <Text style={styles.infoLinha}>
          Criado em: <Text style={styles.infoValor}>{formatarData(indicacao.createdAt)}</Text>
        </Text>
        {indicacao.cheapSharkGameId && (
          <Text style={styles.infoLinha}>
            ID CheapShark: <Text style={styles.infoValor}>{indicacao.cheapSharkGameId}</Text>
          </Text>
        )}
      </View>

      <View style={styles.acoes}>
        <PrimaryButton
          title="Votar"
          onPress={handleVotar}
          style={styles.botao}
        />
        <PrimaryButton
          title="Editar"
          onPress={() => navigation.navigate('IndicacaoForm', { id })}
          variant="secondary"
          style={styles.botao}
        />
        <PrimaryButton
          title="Excluir"
          onPress={handleExcluir}
          variant="danger"
          style={styles.botao}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f8' },
  content: { padding: 20, paddingBottom: 40 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#888', fontSize: 16 },
  destaqueBanner: {
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  destaqueText: { fontSize: 13, color: '#e65100', fontWeight: '600' },
  imagem: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    marginBottom: 16,
  },
  semImagem: {
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  semImagemIcon: { fontSize: 56 },
  titulo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  genero: { fontSize: 15, color: '#666', marginBottom: 16 },
  votosContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 20,
  },
  votosNumero: { fontSize: 40, fontWeight: '900', color: '#6c63ff' },
  votosLabel: { fontSize: 18, color: '#6c63ff' },
  secao: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  secaoTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  secaoTexto: { fontSize: 15, color: '#333', lineHeight: 22 },
  semJogadores: { fontSize: 14, color: '#aaa', fontStyle: 'italic' },
  jogadorCard: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  jogadorNome: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  jogadorMotivo: { fontSize: 13, color: '#666', marginTop: 2 },
  infoLinha: { fontSize: 14, color: '#555', marginBottom: 4 },
  infoValor: { color: '#1a1a2e', fontWeight: '600' },
  acoes: { flexDirection: 'column', gap: 10, marginTop: 8 },
  botao: { width: '100%' },
});
