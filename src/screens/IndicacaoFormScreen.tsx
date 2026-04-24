import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/Navigation';
import {
  createIndicacao,
  getIndicacaoById,
  updateIndicacao,
} from '../database/indicacaoJogoRepository';
import { PrimaryButton } from '../components/PrimaryButton';

type Nav = NativeStackNavigationProp<RootStackParamList, 'IndicacaoForm'>;
type Route = RouteProp<RootStackParamList, 'IndicacaoForm'>;

export function IndicacaoFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const editandoId = route.params?.id;
  const ehEdicao = !!editandoId;

  const [titulo, setTitulo] = useState('');
  const [genero, setGenero] = useState('');
  const [observacao, setObservacao] = useState('');
  const [imagemUri, setImagemUri] = useState('');
  const [nomeJogador, setNomeJogador] = useState('');
  const [motivoJogador, setMotivoJogador] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (editandoId) {
      getIndicacaoById(editandoId).then((ind) => {
        if (ind) {
          setTitulo(ind.titulo);
          setGenero(ind.genero);
          setObservacao(ind.observacao ?? '');
          setImagemUri(ind.imagemUri ?? '');
        }
      });
    }
  }, [editandoId]);

  const handleSalvar = async () => {
    if (!titulo.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o título do jogo.');
      return;
    }

    setSalvando(true);
    try {
      const now = new Date().toISOString();

      if (ehEdicao) {
        await updateIndicacao(editandoId, {
          titulo: titulo.trim(),
          genero: genero.trim() || 'Não informado',
          observacao: observacao.trim() || undefined,
          imagemUri: imagemUri.trim() || undefined,
        });
        Alert.alert('Salvo!', 'Indicação atualizada com sucesso.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const temJogador = nomeJogador.trim().length > 0;
        const jogadores = temJogador
          ? JSON.stringify([
              {
                nome: nomeJogador.trim(),
                motivo: motivoJogador.trim() || undefined,
              },
            ])
          : '[]';

        await createIndicacao({
          titulo: titulo.trim(),
          genero: genero.trim() || 'Não informado',
          votos: temJogador ? 1 : 0,
          observacao: observacao.trim() || undefined,
          jogadoresJson: jogadores,
          imagemUri: imagemUri.trim() || undefined,
          destaque: false,
          origem: 'manual',
          cheapSharkGameId: undefined,
          createdAt: now,
          updatedAt: now,
        });

        Alert.alert('Indicado!', 'Jogo adicionado à votação da semana.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.label}>Título do jogo *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Forza Horizon 5"
          value={titulo}
          onChangeText={setTitulo}
          editable={!salvando}
        />

        <Text style={styles.label}>Gênero</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Corrida, FPS, RPG..."
          value={genero}
          onChangeText={setGenero}
          editable={!salvando}
        />

        <Text style={styles.label}>Observação</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Por que indicar este jogo?"
          value={observacao}
          onChangeText={setObservacao}
          multiline
          numberOfLines={3}
          editable={!salvando}
        />

        <Text style={styles.label}>URL da imagem (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://..."
          value={imagemUri}
          onChangeText={setImagemUri}
          autoCapitalize="none"
          keyboardType="url"
          editable={!salvando}
        />

        {!ehEdicao && (
          <>
            <Text style={styles.secao}>Seu voto inicial</Text>

            <Text style={styles.label}>Seu nome</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Leonardo"
              value={nomeJogador}
              onChangeText={setNomeJogador}
              editable={!salvando}
            />

            <Text style={styles.label}>Motivo (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Por que quer jogar este jogo?"
              value={motivoJogador}
              onChangeText={setMotivoJogador}
              multiline
              numberOfLines={2}
              editable={!salvando}
            />
          </>
        )}

        <PrimaryButton
          title={ehEdicao ? 'Salvar alterações' : 'Indicar jogo'}
          onPress={handleSalvar}
          loading={salvando}
          style={styles.botaoSalvar}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  secao: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    marginTop: 24,
    marginBottom: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  botaoSalvar: {
    marginTop: 28,
  },
});
