import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/Navigation';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { cadastrar } = useAuth();

  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleCadastrar = async () => {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Informe um nome de usuário.');
      return;
    }
    if (nome.trim().length < 3) {
      Alert.alert('Atenção', 'O nome deve ter ao menos 3 caracteres.');
      return;
    }
    if (!senha) {
      Alert.alert('Atenção', 'Informe uma senha.');
      return;
    }
    if (senha.length < 4) {
      Alert.alert('Atenção', 'A senha deve ter ao menos 4 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }

    setCarregando(true);
    try {
      await cadastrar(nome.trim(), senha);
    } catch (e: any) {
      if (e.message === 'USUARIO_JA_EXISTE') {
        Alert.alert('Nome indisponível', 'Já existe um usuário com esse nome. Escolha outro.');
      } else {
        Alert.alert('Erro', 'Não foi possível criar a conta. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.topo}>
          <Text style={styles.logo}>🎮</Text>
          <Text style={styles.appNome}>Joga Essa</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.titulo}>Criar conta</Text>
          <Text style={styles.descricao}>
            Crie sua conta para participar da votação semanal.
          </Text>

          <Text style={styles.label}>Nome de usuário</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Leonardo"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
            editable={!carregando}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 4 caracteres"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            editable={!carregando}
          />

          <Text style={styles.label}>Confirmar senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Repita a senha"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry
            editable={!carregando}
          />

          <PrimaryButton
            title="Cadastrar"
            onPress={handleCadastrar}
            loading={carregando}
            style={styles.botao}
          />

          <PrimaryButton
            title="Já tenho conta"
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={styles.botaoVoltar}
            disabled={carregando}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  topo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 48,
    marginBottom: 6,
  },
  appNome: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  descricao: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f4f4f8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  botao: {
    marginTop: 24,
  },
  botaoVoltar: {
    marginTop: 10,
  },
});
