import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, StatusBar } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function LoginScreen({ onSuccess, onCadastro }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <Text style={styles.title}>SmartAgenda</Text>
      <Text style={styles.subtitle}>Faça login para continuar</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#888888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#888888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {loading ? (
          <ActivityIndicator size="large" color="#9F7CFA" style={{ marginVertical: 20 }} />
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Entrar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onCadastro} style={styles.linkContainer} activeOpacity={0.7}>
          <Text style={styles.linkText}>
            Não tem uma conta? <Text style={styles.linkTextBold}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#121212'
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#A59EC0',
    textAlign: 'center',
    marginBottom: 40,
    marginTop: 8,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#9F7CFA',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#9F7CFA',
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
    color: '#A59EC0',
    fontSize: 15,
  },
  linkTextBold: {
    color: '#9F7CFA',
    fontWeight: 'bold',
  }
});