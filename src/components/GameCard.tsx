import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { IndicacaoJogo } from '../types/IndicacaoJogo';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  indicacao: IndicacaoJogo;
  posicao?: number;
  onPress: () => void;
  onVotar: () => void;
};

export function GameCard({ indicacao, posicao, onPress, onVotar }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {indicacao.destaque && (
        <View style={styles.destaqueBanner}>
          <Text style={styles.destaqueText}>🔥 Destaque da semana anterior</Text>
        </View>
      )}

      <View style={styles.row}>
        {posicao !== undefined && (
          <Text style={styles.posicao}>#{posicao}</Text>
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

        <View style={styles.info}>
          <Text style={styles.titulo} numberOfLines={2}>
            {indicacao.titulo}
          </Text>
          <Text style={styles.genero}>{indicacao.genero}</Text>
          <Text style={styles.votos}>
            {indicacao.votos} {indicacao.votos === 1 ? 'voto' : 'votos'}
          </Text>
        </View>
      </View>

      <View style={styles.acoes}>
        <PrimaryButton
          title="Ver detalhes"
          onPress={onPress}
          variant="secondary"
          style={styles.botao}
        />
        <PrimaryButton
          title="Votar"
          onPress={onVotar}
          style={styles.botao}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  destaqueBanner: {
    backgroundColor: '#fff3e0',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  destaqueText: {
    fontSize: 12,
    color: '#e65100',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  posicao: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6c63ff',
    width: 30,
  },
  imagem: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 12,
  },
  semImagem: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  semImagemIcon: {
    fontSize: 28,
  },
  info: {
    flex: 1,
  },
  titulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  genero: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  votos: {
    fontSize: 13,
    color: '#6c63ff',
    fontWeight: '600',
  },
  acoes: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  botao: {
    flex: 1,
    paddingVertical: 9,
  },
});
