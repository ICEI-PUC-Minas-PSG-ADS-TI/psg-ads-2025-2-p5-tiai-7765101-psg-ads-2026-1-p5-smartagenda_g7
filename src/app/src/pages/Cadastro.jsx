import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import { onUserAuthenticated } from '../services/UserService';

export default function CadastroPage({ onSuccess, onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    // Validações
    if (!email || !password || !nome) {
      Alert.alert('Aviso', 'Os campos e-mail, senha e nome são obrigatórios.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Aviso', 'As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Aviso', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      // 1. Criar usuário no Firebase Authentication
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      // 2. Atualizar o perfil com o nome
      await userCredential.user.updateProfile({
        displayName: nome
      });
      
      // 3. Criar documento no Firestore (usuário e coleção tarefas)
      await onUserAuthenticated(userCredential.user);
      
      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      onSuccess();
    } catch (err) {
      let mensagem = 'Erro ao criar conta.';
      if (err.code === 'auth/email-already-in-use') {
        mensagem = 'Este e-mail já está em uso.';
      } else if (err.code === 'auth/invalid-email') {
        mensagem = 'E-mail inválido.';
      } else if (err.code === 'auth/weak-password') {
        mensagem = 'Senha muito fraca. Use pelo menos 6 caracteres.';
      }
      Alert.alert('Erro', mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SmartAgenda - Criar Conta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome completo"
        placeholderTextColor="gray"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="gray"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha (mínimo 6 caracteres)"
        placeholderTextColor="gray"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar senha"
        placeholderTextColor="gray"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" color="#9F7CFA" />
      ) : (
        <Button title="Criar Conta" onPress={handleCadastro} color="#9F7CFA" />
      )}

      <TouchableOpacity onPress={onBackToLogin} style={styles.linkContainer}>
        <Text style={styles.linkText}>Já tem uma conta? Faça login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#121212'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white'
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    color: 'white',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#9F7CFA',
    fontSize: 14,
    textDecorationLine: 'underline',
  }
});