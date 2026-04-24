import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/Navigation';
import { IndicacaoJogo } from '../types/IndicacaoJogo';
import {
  getIndicacoesSemanaAtual,
  searchIndicacoesLocais,
  votarEmIndicacao,
} from '../database/indicacaoJogoRepository';
import { prepararSemanaAtual } from '../services/weeklyService';
import { GameCard } from '../components/GameCard';
import { EmptyState } from '../components/EmptyState';
import { VoteModal } from '../components/VoteModal';
import { useAuth } from '../context/AuthContext';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { usuario } = useAuth();
  const [indicacoes, setIndicacoes] = useState<IndicacaoJogo[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [indicacaoVotando, setIndicacaoVotando] = useState<IndicacaoJogo | null>(null);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    try {
      await prepararSemanaAtual();
      const dados = await getIndicacoesSemanaAtual();
      setIndicacoes(dados);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados])
  );

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (busca.trim().length > 0) {
        const resultado = await searchIndicacoesLocais(busca.trim());
        setIndicacoes(resultado);
      } else {
        const dados = await getIndicacoesSemanaAtual();
        setIndicacoes(dados);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [busca]);

  const handleConfirmarVoto = async (motivo?: string) => {
    if (!indicacaoVotando || !usuario) return;
    try {
      await votarEmIndicacao(indicacaoVotando.id, { nome: usuario.nome, motivo });
      setIndicacaoVotando(null);
      carregarDados();
    } catch (e: any) {
      setIndicacaoVotando(null);
      Alert.alert('Ops!', e.message ?? 'Erro ao votar.');
    }
  };

  const indicacoesOrdenadas = [...indicacoes].sort((a, b) => {
    if (a.destaque && !b.destaque) return -1;
    if (!a.destaque && b.destaque) return 1;
    return b.votos - a.votos;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.busca}
          placeholder="Buscar por título ou gênero..."
          placeholderTextColor="#aaa"
          value={busca}
          onChangeText={setBusca}
        />
        <View style={styles.acoesTopo}>
          <TouchableOpacity
            style={styles.botaoAcao}
            onPress={() => navigation.navigate('ApiSearch')}
          >
            <Text style={styles.botaoAcaoText}>🔍 Indicar jogo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botaoAcao, styles.botaoSecundario]}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={[styles.botaoAcaoText, styles.botaoSecundarioText]}>
              📅 Histórico
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {indicacoesOrdenadas.length === 0 && !carregando ? (
        <EmptyState
          mensagem={
            busca
              ? 'Nenhum jogo encontrado para essa busca.'
              : 'Nenhum jogo indicado esta semana.\nToque em "Indicar jogo" para buscar na API!'
          }
        />
      ) : (
        <FlatList
          data={indicacoesOrdenadas}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <GameCard
              indicacao={item}
              posicao={item.destaque ? undefined : index + 1}
              onPress={() =>
                navigation.navigate('IndicacaoDetails', { id: item.id })
              }
              onVotar={() => setIndicacaoVotando(item)}
            />
          )}
          contentContainerStyle={styles.lista}
          onRefresh={carregarDados}
          refreshing={carregando}
        />
      )}

      <VoteModal
        visible={indicacaoVotando !== null}
        titulo={indicacaoVotando?.titulo ?? ''}
        nomeUsuario={usuario?.nome ?? ''}
        onConfirm={handleConfirmarVoto}
        onCancel={() => setIndicacaoVotando(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  header: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  busca: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1a1a2e',
    marginBottom: 10,
  },
  acoesTopo: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  botaoAcao: {
    backgroundColor: '#6c63ff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  botaoSecundario: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#6c63ff',
  },
  botaoAcaoText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  botaoSecundarioText: {
    color: '#6c63ff',
  },
  lista: {
    paddingTop: 8,
    paddingBottom: 24,
  },
});
