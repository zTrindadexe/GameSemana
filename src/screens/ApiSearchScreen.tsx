import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/Navigation';
import { GameApiResult } from '../types/GameApiResult';
import { searchGames } from '../services/gameApiService';
import { createIndicacao } from '../database/indicacaoJogoRepository';
import { PrimaryButton } from '../components/PrimaryButton';
import { EmptyState } from '../components/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ApiSearch'>;

export function ApiSearchScreen() {
  const navigation = useNavigation<Nav>();
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<GameApiResult[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [buscou, setBuscou] = useState(false);

  const handleBuscar = async () => {
    if (!busca.trim()) return;
    setBuscando(true);
    setBuscou(false);
    try {
      const res = await searchGames(busca.trim());
      setResultados(res);
      setBuscou(true);
    } finally {
      setBuscando(false);
    }
  };

  const handleImportar = (jogo: GameApiResult) => {
    Alert.prompt(
      'Seu nome',
      `Quer votar em "${jogo.titulo}" ao importar?`,
      [
        {
          text: 'Importar sem votar',
          onPress: () => importar(jogo, ''),
        },
        {
          text: 'Votar',
          onPress: (nome) => importar(jogo, nome ?? ''),
        },
      ],
      'plain-text'
    );
  };

  const importar = async (jogo: GameApiResult, nomeJogador: string) => {
    const temJogador = nomeJogador.trim().length > 0;
    const now = new Date().toISOString();
    try {
      await createIndicacao({
        titulo: jogo.titulo,
        genero: 'Não informado',
        votos: temJogador ? 1 : 0,
        observacao: undefined,
        jogadoresJson: temJogador
          ? JSON.stringify([{ nome: nomeJogador.trim() }])
          : '[]',
        imagemUri: jogo.imagemUri,
        destaque: false,
        origem: 'api',
        cheapSharkGameId: jogo.cheapSharkGameId,
        createdAt: now,
        updatedAt: now,
      });
      Alert.alert(
        'Importado!',
        `"${jogo.titulo}" foi adicionado à votação da semana.`,
        [{ text: 'Ver indicações', onPress: () => navigation.navigate('Home') }]
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível importar o jogo.');
    }
  };

  const renderItem = ({ item }: { item: GameApiResult }) => (
    <View style={styles.card}>
      {item.imagemUri ? (
        <Image
          source={{ uri: item.imagemUri }}
          style={styles.thumb}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.thumb, styles.semThumb]}>
          <Text style={styles.semThumbIcon}>🎮</Text>
        </View>
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitulo} numberOfLines={2}>
          {item.titulo}
        </Text>
        {item.precoReferencia && (
          <Text style={styles.cardPreco}>
            A partir de R$ {parseFloat(item.precoReferencia).toFixed(2).replace('.', ',')}
          </Text>
        )}
        <TouchableOpacity
          style={styles.botaoImportar}
          onPress={() => handleImportar(item)}
        >
          <Text style={styles.botaoImportarText}>+ Indicar para votação</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.barraBusca}>
        <TextInput
          style={styles.input}
          placeholder="Nome do jogo..."
          placeholderTextColor="#aaa"
          value={busca}
          onChangeText={setBusca}
          onSubmitEditing={handleBuscar}
          returnKeyType="search"
        />
        <PrimaryButton
          title="Buscar"
          onPress={handleBuscar}
          loading={buscando}
          style={styles.botaoBuscar}
        />
      </View>

      <Text style={styles.aviso}>
        Resultados fornecidos pela CheapShark (jogos digitais em oferta).
      </Text>

      {buscando && (
        <ActivityIndicator
          size="large"
          color="#6c63ff"
          style={styles.spinner}
        />
      )}

      {!buscando && buscou && resultados.length === 0 && (
        <EmptyState
          mensagem="Nenhum jogo encontrado.\nTente outro termo ou verifique sua conexão."
          emoji="🔍"
        />
      )}

      {!buscando && !buscou && (
        <EmptyState
          mensagem="Digite o nome de um jogo e toque em Buscar."
          emoji="🕹️"
        />
      )}

      <FlatList
        data={resultados}
        keyExtractor={(item) => item.cheapSharkGameId}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f8' },
  barraBusca: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1a1a2e',
  },
  botaoBuscar: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  aviso: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#eef',
  },
  spinner: { marginTop: 40 },
  lista: { padding: 12, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  thumb: {
    width: 90,
    height: 90,
  },
  semThumb: {
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  semThumbIcon: { fontSize: 32 },
  cardInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  cardPreco: { fontSize: 12, color: '#4caf50', fontWeight: '600' },
  botaoImportar: {
    marginTop: 8,
    backgroundColor: '#6c63ff',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  botaoImportarText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
