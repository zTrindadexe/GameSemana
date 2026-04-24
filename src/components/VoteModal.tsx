import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  visible: boolean;
  titulo: string;
  nomeUsuario: string;
  onConfirm: (motivo?: string) => Promise<void>;
  onCancel: () => void;
};

export function VoteModal({ visible, titulo, nomeUsuario, onConfirm, onCancel }: Props) {
  const [motivo, setMotivo] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleConfirm = async () => {
    setSalvando(true);
    try {
      await onConfirm(motivo.trim() || undefined);
      setMotivo('');
    } finally {
      setSalvando(false);
    }
  };

  const handleCancel = () => {
    setMotivo('');
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.card}>
              <Text style={styles.label}>Votar em</Text>
              <Text style={styles.jogo} numberOfLines={2}>{titulo}</Text>

              <View style={styles.usuarioRow}>
                <Text style={styles.usuarioLabel}>Votando como</Text>
                <Text style={styles.usuarioNome}>{nomeUsuario}</Text>
              </View>

              <Text style={styles.label}>Motivo (opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Por que quer jogar?"
                value={motivo}
                onChangeText={setMotivo}
                multiline
                numberOfLines={2}
                editable={!salvando}
                autoFocus
              />

              <View style={styles.acoes}>
                <PrimaryButton
                  title="Cancelar"
                  onPress={handleCancel}
                  variant="secondary"
                  style={styles.botao}
                  disabled={salvando}
                />
                <PrimaryButton
                  title="Votar"
                  onPress={handleConfirm}
                  loading={salvando}
                  style={styles.botao}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  label: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  jogo: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 16,
  },
  usuarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  usuarioLabel: {
    fontSize: 13,
    color: '#888',
  },
  usuarioNome: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6c63ff',
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
    marginTop: 4,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  acoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  botao: {
    flex: 1,
  },
});
