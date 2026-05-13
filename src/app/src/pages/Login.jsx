import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, StatusBar } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNetInfo } from '@react-native-community/netinfo';
import { useTheme } from '../theme/ThemeContext';

export default function LoginScreen({ onSuccess, onCadastro, onBack }) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const netInfo = useNetInfo();
  const isConnected = netInfo.isConnected ?? true;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Aviso', 'Os campos e-mail e senha são obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
      onSuccess();
    } catch (err) {
      Alert.alert('Erro de Autenticação', 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.type === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />

      <Text style={[styles.title, { color: theme.colors.text }]}>SmartAgenda</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Faça login para continuar</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
          placeholder="E-mail"
          placeholderTextColor={theme.colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
          placeholder="Senha"
          placeholderTextColor={theme.colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginVertical: 20 }} />
        ) : (
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Entrar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onCadastro} style={styles.linkContainer} activeOpacity={0.7}>
          <Text style={[styles.linkText, { color: theme.colors.textSecondary }]}>
            Não tem uma conta? <Text style={[styles.linkTextBold, { color: theme.colors.primary }]}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>

        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.linkContainer} activeOpacity={0.7}>
            <Text style={[styles.linkText, { marginTop: -10, color: theme.colors.textSecondary }]}>Voltar sem fazer login</Text>
          </TouchableOpacity>
        )}
      </View>

      {!isConnected && (
        <View style={styles.overlayBlur}>
          <View style={[styles.offlineBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}>
            <Text style={[styles.offlineTitle, { color: theme.colors.primary }]}>Sem Conexão</Text>
            <Text style={[styles.offlineText, { color: theme.colors.text }]}>
              O login requer internet para funcionar. Conecte-se à rede para acessar sua conta.
            </Text>
            {onBack && (
              <TouchableOpacity style={[styles.offlineButton, { backgroundColor: theme.colors.primary }]} onPress={onBack} activeOpacity={0.8}>
                <Text style={styles.offlineButtonText}>Voltar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    marginTop: 8,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    marginTop: 24,
    alignItems: 'center',
    padding: 10,
  },
  linkText: {
    fontSize: 15,
  },
  linkTextBold: {
    fontWeight: 'bold',
  },
  overlayBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  offlineBox: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 30,
    borderWidth: 2,
  },
  offlineTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  offlineText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  offlineButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  offlineButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});