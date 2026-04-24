import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/Navigation';
import {
  CampeaoSemanal,
  getHistoricoSemanal,
} from '../database/indicacaoJogoRepository';
import { parseJogadores } from '../utils/jsonUtils';
import { EmptyState } from '../components/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList, 'History'>;

function formatarSemana(isoInicio: string): string {
  const inicio = new Date(isoInicio);
  const fim = new Date(isoInicio);
  fim.setDate(fim.getDate() + 6);

  const mesInicio = inicio.toLocaleDateString('pt-BR', { month: 'short' });
  const mesFim = fim.toLocaleDateString('pt-BR', { month: 'short' });

  const diaInicio = inicio.getDate().toString().padStart(2, '0');
  const diaFim = fim.getDate().toString().padStart(2, '0');

  if (mesInicio === mesFim) {
    return `${diaInicio} – ${diaFim} de ${mesInicio.replace('.', '')}`;
  }
  return `${diaInicio} ${mesInicio.replace('.', '')} – ${diaFim} ${mesFim.replace('.', '')}`;
}

function formatarAno(isoInicio: string): string {
  return new Date(isoInicio).getFullYear().toString();
}

export function HistoryScreen() {
  const navigation = useNavigation<Nav>();
  const [semanas, setSemanas] = useState<CampeaoSemanal[]>([]);
  const [carregando, setCarregando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setCarregando(true);
      getHistoricoSemanal()
        .then(setSemanas)
        .finally(() => setCarregando(false));
    }, [])
  );

  if (!carregando && semanas.length === 0) {
    return (
      <EmptyState
        mensagem={'Nenhum histórico ainda.\nO campeão de cada semana aparecerá aqui.'}
        emoji="📅"
      />
    );
  }

  let anoAtual = '';

  const renderItem = ({ item }: { item: CampeaoSemanal }) => {
    const ano = formatarAno(item.semanaInicio);
    const mostrarAno = ano !== anoAtual;
    if (mostrarAno) anoAtual = ano;

    const jogadores = parseJogadores(item.campeao.jogadoresJson);

    return (
      <>
        {mostrarAno && (
          <View style={styles.anoSeparador}>
            <View style={styles.anoLinha} />
            <Text style={styles.anoTexto}>{ano}</Text>
            <View style={styles.anoLinha} />
          </View>
        )}

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('IndicacaoDetails', { id: item.campeao.id })
          }
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.trofeu}>🏆</Text>
            <View style={styles.headerTexto}>
              <Text style={styles.semanaLabel}>
                Semana de {formatarSemana(item.semanaInicio)}
              </Text>
              <Text style={styles.totalLabel}>
                {item.totalIndicacoes}{' '}
                {item.totalIndicacoes === 1 ? 'indicação' : 'indicações'} nessa semana
              </Text>
            </View>
          </View>

          <View style={styles.jogoRow}>
            {item.campeao.imagemUri ? (
              <Image
                source={{ uri: item.campeao.imagemUri }}
                style={styles.imagem}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.imagem, styles.semImagem]}>
                <Text style={styles.semImagemIcon}>🎮</Text>
              </View>
            )}

            <View style={styles.jogoInfo}>
              <Text style={styles.jogoTitulo} numberOfLines={2}>
                {item.campeao.titulo}
              </Text>
              <Text style={styles.jogoGenero}>{item.campeao.genero}</Text>
              <View style={styles.votosRow}>
                <Text style={styles.votosNumero}>{item.campeao.votos}</Text>
                <Text style={styles.votosLabel}>
                  {item.campeao.votos === 1 ? 'voto' : 'votos'}
                </Text>
              </View>
            </View>
          </View>

          {jogadores.length > 0 && (
            <View style={styles.jogadoresContainer}>
              <Text style={styles.jogadoresTitulo}>Quem votou</Text>
              <Text style={styles.jogadoresLista} numberOfLines={2}>
                {jogadores.map((j) => j.nome).join('  ·  ')}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </>
    );
  };

  return (
    <FlatList
      style={styles.container}
      data={semanas}
      keyExtractor={(item) => item.semanaInicio}
      renderItem={renderItem}
      contentContainerStyle={styles.content}
      onRefresh={() => {
        setCarregando(true);
        getHistoricoSemanal()
          .then(setSemanas)
          .finally(() => setCarregando(false));
      }}
      refreshing={carregando}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f8' },
  content: { padding: 16, paddingBottom: 40 },

  anoSeparador: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  anoLinha: {
    flex: 1,
    height: 1,
    backgroundColor: '#d0d0e0',
  },
  anoTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6c63ff',
    letterSpacing: 2,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  trofeu: { fontSize: 20 },
  headerTexto: { flex: 1 },
  semanaLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  totalLabel: {
    color: '#aaa',
    fontSize: 11,
    marginTop: 1,
  },

  jogoRow: {
    flexDirection: 'row',
    padding: 14,
    gap: 14,
    alignItems: 'center',
  },
  imagem: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  semImagem: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  semImagemIcon: { fontSize: 28 },
  jogoInfo: { flex: 1 },
  jogoTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 3,
  },
  jogoGenero: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  votosRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  votosNumero: {
    fontSize: 26,
    fontWeight: '900',
    color: '#6c63ff',
  },
  votosLabel: {
    fontSize: 13,
    color: '#6c63ff',
  },

  jogadoresContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  jogadoresTitulo: {
    fontSize: 11,
    fontWeight: '700',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  jogadoresLista: {
    fontSize: 13,
    color: '#555',
  },
});
