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

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [indicacoes, setIndicacoes] = useState<IndicacaoJogo[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(false);

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

  const handleVotar = (item: IndicacaoJogo) => {
    let nomeJogador = '';
    let motivoJogador = '';

    Alert.prompt(
      'Votar em ' + item.titulo,
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
            nomeJogador = nome.trim();
            Alert.prompt(
              'Motivo (opcional)',
              'Por que quer jogar ' + item.titulo + '?',
              [
                {
                  text: 'Votar',
                  onPress: async (motivo) => {
                    motivoJogador = motivo?.trim() ?? '';
                    try {
                      await votarEmIndicacao(item.id, {
                        nome: nomeJogador,
                        motivo: motivoJogador || undefined,
                      });
                      carregarDados();
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
            onPress={() => navigation.navigate('IndicacaoForm')}
          >
            <Text style={styles.botaoAcaoText}>+ Indicar jogo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botaoAcao, styles.botaoSecundario]}
            onPress={() => navigation.navigate('ApiSearch')}
          >
            <Text style={[styles.botaoAcaoText, styles.botaoSecundarioText]}>
              🔍 Buscar na API
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botaoAcao, styles.botaoSecundario]}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={[styles.botaoAcaoText, styles.botaoSecundarioText]}>
              📋 Histórico
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {indicacoesOrdenadas.length === 0 && !carregando ? (
        <EmptyState
          mensagem={
            busca
              ? 'Nenhum jogo encontrado para essa busca.'
              : 'Nenhum jogo indicado esta semana.\nToque em "+ Indicar jogo" para começar!'
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
              onVotar={() => handleVotar(item)}
            />
          )}
          contentContainerStyle={styles.lista}
          onRefresh={carregarDados}
          refreshing={carregando}
        />
      )}
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
