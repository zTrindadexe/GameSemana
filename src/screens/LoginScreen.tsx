import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/Navigation';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login } = useAuth();

  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async () => {
    if (!nome.trim() || !senha) {
      Alert.alert('Atenção', 'Preencha nome e senha.');
      return;
    }
    setCarregando(true);
    try {
      await login(nome.trim(), senha);
    } catch (e: any) {
      Alert.alert(
        'Acesso negado',
        'Usuário ou senha incorretos.\nSolicite ao administrador o seu cadastro.'
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topo}>
        <Text style={styles.logo}>🎮</Text>
        <Text style={styles.appNome}>Joga Essa</Text>
        <Text style={styles.subtitulo}>Votação semanal de jogos</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.titulo}>Entrar</Text>

        <Text style={styles.label}>Nome de usuário</Text>
        <TextInput
          style={styles.input}
          placeholder="Seu nome"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="none"
          editable={!carregando}
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Sua senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          editable={!carregando}
        />

        <PrimaryButton
          title="Entrar"
          onPress={handleLogin}
          loading={carregando}
          style={styles.botao}
        />

        <TouchableOpacity
          style={styles.linkCadastro}
          onPress={() => navigation.navigate('Register')}
          disabled={carregando}
        >
          <Text style={styles.linkCadastroText}>
            Não tem conta? Cadastre-se
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    padding: 24,
  },
  topo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 56,
    marginBottom: 8,
  },
  appNome: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  subtitulo: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
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
    marginBottom: 20,
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
  linkCadastro: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkCadastroText: {
    color: '#6c63ff',
    fontSize: 14,
    fontWeight: '600',
  },
});
