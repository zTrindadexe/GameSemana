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
  ScrollView,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/Navigation';
import { GameApiResult } from '../types/GameApiResult';
import { searchGames } from '../services/gameApiService';
import { createIndicacao } from '../database/indicacaoJogoRepository';
import { PrimaryButton } from '../components/PrimaryButton';
import { EmptyState } from '../components/EmptyState';
import { VoteModal } from '../components/VoteModal';
import { useAuth } from '../context/AuthContext';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ApiSearch'>;

type EstadoBusca = 'idle' | 'buscando' | 'resultado' | 'erro_chave' | 'erro_rede' | 'vazio';

export function ApiSearchScreen() {
  const navigation = useNavigation<Nav>();
  const { usuario } = useAuth();
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<GameApiResult[]>([]);
  const [estado, setEstado] = useState<EstadoBusca>('idle');
  const [jogoSelecionado, setJogoSelecionado] = useState<GameApiResult | null>(null);

  const handleBuscar = async () => {
    if (!busca.trim()) return;
    setEstado('buscando');
    setResultados([]);
    try {
      const res = await searchGames(busca.trim());
      setResultados(res);
      setEstado(res.length > 0 ? 'resultado' : 'vazio');
    } catch (e: any) {
      if (e.message === 'CHAVE_NAO_CONFIGURADA') {
        setEstado('erro_chave');
      } else {
        setEstado('erro_rede');
      }
    }
  };

  const handleConfirmarImport = async (motivo?: string) => {
    if (!jogoSelecionado) return;
    const jogo = jogoSelecionado;
    const now = new Date().toISOString();
    const nomeUsuario = usuario?.nome ?? 'Anônimo';
    setJogoSelecionado(null);
    try {
      await createIndicacao({
        titulo: jogo.titulo,
        genero: jogo.genero,
        votos: 1,
        observacao: undefined,
        jogadoresJson: JSON.stringify([{ nome: nomeUsuario, motivo: motivo || undefined }]),
        imagemUri: jogo.imagemUri,
        destaque: false,
        origem: 'api',
        cheapSharkGameId: jogo.externalId,
        createdAt: now,
        updatedAt: now,
      });
      Alert.alert(
        'Indicado!',
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
        <Image source={{ uri: item.imagemUri }} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={[styles.thumb, styles.semThumb]}>
          <Text style={styles.semThumbIcon}>🎮</Text>
        </View>
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitulo} numberOfLines={2}>{item.titulo}</Text>
        <Text style={styles.cardGenero} numberOfLines={1}>{item.genero}</Text>
        <TouchableOpacity style={styles.botaoImportar} onPress={() => setJogoSelecionado(item)}>
          <Text style={styles.botaoImportarText}>+ Indicar para votação</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderConteudo = () => {
    if (estado === 'buscando') {
      return <ActivityIndicator size="large" color="#6c63ff" style={styles.spinner} />;
    }

    if (estado === 'erro_chave') {
      return (
        <ScrollView contentContainerStyle={styles.erroContainer}>
          <Text style={styles.erroIcon}>🔑</Text>
          <Text style={styles.erroTitulo}>Chave da API não configurada</Text>
          <Text style={styles.erroDescricao}>
            Para usar a busca de jogos, você precisa de uma chave gratuita da RAWG.
          </Text>
          <View style={styles.passos}>
            <Text style={styles.passoTitulo}>Como configurar:</Text>
            <Text style={styles.passo}>1. Acesse rawg.io/apidocs e crie uma conta gratuita</Text>
            <Text style={styles.passo}>2. Copie sua API Key</Text>
            <Text style={styles.passo}>3. Abra o arquivo:</Text>
            <Text style={styles.codigo}>src/config/apiConfig.ts</Text>
            <Text style={styles.passo}>4. Substitua 'SUA_CHAVE_AQUI' pela sua chave</Text>
          </View>
          <TouchableOpacity
            style={styles.botaoLink}
            onPress={() => Linking.openURL('https://rawg.io/apidocs')}
          >
            <Text style={styles.botaoLinkText}>Abrir rawg.io/apidocs</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    if (estado === 'erro_rede') {
      return (
        <EmptyState
          mensagem={'Erro ao conectar com a API.\nVerifique sua conexão e tente novamente.'}
          emoji="📡"
        />
      );
    }

    if (estado === 'vazio') {
      return (
        <EmptyState
          mensagem="Nenhum jogo encontrado para esse termo.\nTente um nome diferente."
          emoji="🔍"
        />
      );
    }

    if (estado === 'idle') {
      return (
        <EmptyState
          mensagem="Digite o nome de um jogo e toque em Buscar."
          emoji="🕹️"
        />
      );
    }

    return null;
  };

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
          loading={estado === 'buscando'}
          style={styles.botaoBuscar}
        />
      </View>

      <Text style={styles.aviso}>Catálogo fornecido pela RAWG — mais de 500 mil jogos.</Text>

      {estado === 'resultado' ? (
        <FlatList
          data={resultados}
          keyExtractor={(item) => item.externalId}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
        />
      ) : (
        renderConteudo()
      )}

      <VoteModal
        visible={jogoSelecionado !== null}
        titulo={jogoSelecionado?.titulo ?? ''}
        nomeUsuario={usuario?.nome ?? ''}
        onConfirm={handleConfirmarImport}
        onCancel={() => setJogoSelecionado(null)}
        labelTitulo="Indicar jogo"
        labelUsuario="Indicando como"
        labelBotaoConfirmar="Indicar"
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
  thumb: { width: 90, height: 90 },
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
    marginBottom: 2,
  },
  cardGenero: { fontSize: 12, color: '#888', marginBottom: 4 },
  botaoImportar: {
    marginTop: 6,
    backgroundColor: '#6c63ff',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  botaoImportarText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  erroContainer: {
    padding: 28,
    alignItems: 'center',
  },
  erroIcon: { fontSize: 48, marginBottom: 12 },
  erroTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 8,
    textAlign: 'center',
  },
  erroDescricao: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 21,
  },
  passos: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  passoTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 10,
  },
  passo: {
    fontSize: 13,
    color: '#444',
    marginBottom: 6,
    lineHeight: 20,
  },
  codigo: {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 6,
    color: '#6c63ff',
    marginBottom: 6,
  },
  botaoLink: {
    backgroundColor: '#6c63ff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  botaoLinkText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
