import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/Navigation';
import { IndicacaoJogo } from '../types/IndicacaoJogo';
import { getHistoricoIndicacoes } from '../database/indicacaoJogoRepository';
import { formatarData, getLabelSemana } from '../utils/dateUtils';
import { EmptyState } from '../components/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList, 'History'>;

function agruparPorSemana(
  indicacoes: IndicacaoJogo[]
): { semana: string; dados: IndicacaoJogo[] }[] {
  const mapa: Record<string, IndicacaoJogo[]> = {};

  for (const ind of indicacoes) {
    const data = new Date(ind.createdAt);
    const diaSemana = data.getDay();
    const diff = diaSemana === 0 ? -6 : 1 - diaSemana;
    const segunda = new Date(data);
    segunda.setDate(segunda.getDate() + diff);
    segunda.setHours(0, 0, 0, 0);
    const chave = segunda.toISOString();

    if (!mapa[chave]) mapa[chave] = [];
    mapa[chave].push(ind);
  }

  return Object.entries(mapa)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([chave, dados]) => ({
      semana: getLabelSemana(chave),
      dados: dados.sort((a, b) => b.votos - a.votos),
    }));
}

export function HistoryScreen() {
  const navigation = useNavigation<Nav>();
  const [grupos, setGrupos] = useState<{ semana: string; dados: IndicacaoJogo[] }[]>([]);
  const [carregando, setCarregando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setCarregando(true);
      getHistoricoIndicacoes()
        .then((dados) => setGrupos(agruparPorSemana(dados)))
        .finally(() => setCarregando(false));
    }, [])
  );

  if (!carregando && grupos.length === 0) {
    return (
      <EmptyState
        mensagem="Nenhum histórico ainda.\nAs semanas anteriores aparecerão aqui."
        emoji="📋"
      />
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={grupos}
      keyExtractor={(item) => item.semana}
      contentContainerStyle={styles.content}
      onRefresh={() => {
        setCarregando(true);
        getHistoricoIndicacoes()
          .then((dados) => setGrupos(agruparPorSemana(dados)))
          .finally(() => setCarregando(false));
      }}
      refreshing={carregando}
      renderItem={({ item: grupo }) => (
        <View style={styles.grupo}>
          <Text style={styles.semanaLabel}>📅 {grupo.semana}</Text>
          {grupo.dados.map((ind, idx) => (
            <TouchableOpacity
              key={ind.id}
              style={styles.itemCard}
              onPress={() =>
                navigation.navigate('IndicacaoDetails', { id: ind.id })
              }
            >
              <Text style={styles.itemPos}>#{idx + 1}</Text>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitulo} numberOfLines={1}>
                  {ind.titulo}
                </Text>
                <Text style={styles.itemMeta}>
                  {ind.genero} • {ind.votos} {ind.votos === 1 ? 'voto' : 'votos'} •{' '}
                  {formatarData(ind.createdAt)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f8' },
  content: { padding: 16, paddingBottom: 40 },
  grupo: {
    marginBottom: 20,
  },
  semanaLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6c63ff',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  itemPos: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6c63ff',
    width: 28,
  },
  itemInfo: { flex: 1 },
  itemTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  itemMeta: { fontSize: 12, color: '#888' },
});
