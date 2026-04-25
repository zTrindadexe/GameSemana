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
import { useAuth } from '../context/AuthContext';

type Nav = NativeStackNavigationProp<RootStackParamList, 'IndicacaoForm'>;
type Route = RouteProp<RootStackParamList, 'IndicacaoForm'>;

export function IndicacaoFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { usuario } = useAuth();
  const editandoId = route.params?.id;
  const ehEdicao = !!editandoId;

  const [titulo, setTitulo] = useState('');
  const [genero, setGenero] = useState('');
  const [observacao, setObservacao] = useState('');
  const [imagemUri, setImagemUri] = useState('');
  const [motivo, setMotivo] = useState('');
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

    if (!ehEdicao && !motivo.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o motivo da indicação.');
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
        const nomeUsuario = usuario?.nome ?? 'Anônimo';
        await createIndicacao({
          titulo: titulo.trim(),
          genero: 'Não informado',
          votos: 1,
          observacao: motivo.trim(),
          jogadoresJson: JSON.stringify([{ nome: nomeUsuario, motivo: motivo.trim() }]),
          imagemUri: undefined,
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

        {ehEdicao ? (
          <>
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
          </>
        ) : (
          <>
            <View style={styles.usuarioRow}>
              <Text style={styles.usuarioLabel}>Indicando como</Text>
              <Text style={styles.usuarioNome}>{usuario?.nome}</Text>
            </View>

            <Text style={styles.label}>Por que quer jogar? *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Conta um pouco sobre o jogo ou por que quer jogar..."
              value={motivo}
              onChangeText={setMotivo}
              multiline
              numberOfLines={3}
              editable={!salvando}
            />
          </>
        )}

        <PrimaryButton
          title={ehEdicao ? 'Salvar alterações' : 'Indicar offline'}
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
  usuarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    marginBottom: 4,
    backgroundColor: '#eeeeff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  usuarioLabel: {
    fontSize: 13,
    color: '#888',
  },
  usuarioNome: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6c63ff',
  },
  botaoSalvar: {
    marginTop: 28,
  },
});
