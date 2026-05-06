import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, StatusBar } from 'react-native';
import auth from '@react-native-firebase/auth';
import { onUserAuthenticated } from '../services/UserService';
import StorageAPI from '../services/LocalStorageService';
import SaveControlService from '../services/SaveControlService';
import { useNetInfo } from '@react-native-community/netinfo';

export default function CadastroScreen({ onSuccess, onBackToLogin, onCancel }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const netInfo = useNetInfo();
  const isConnected = netInfo.isConnected ?? true;

  const handleCadastro = async () => {
    if (!email || !password || !nome) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Senhas incompatíveis', 'As senhas digitadas não coincidem.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Senha fraca', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      // 0. Carregar tarefas do guest ANTES de autenticar
      const tarefasGuest = await StorageAPI.CarregarTarefas() || {};

      // 1. Criar usuário no Firebase Authentication
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      // 2. Atualizar o perfil com o nome
      await userCredential.user.updateProfile({ displayName: nome });
      
      // 3. Criar documento no Firestore
      await onUserAuthenticated(userCredential.user);
      
      // 4. Migrar tarefas de guest para a nova conta
      if (Object.keys(tarefasGuest).length > 0) {
        await StorageAPI.SalvarTarefas(tarefasGuest);
        await SaveControlService.TrySalvar();
      }
      
      Alert.alert('Sucesso', 'Conta criada com sucesso! Bem-vindo ao SmartAgenda.');
      onSuccess();
    } catch (err) {
      let mensagem = 'Ocorreu um erro ao criar a conta.';
      if (err.code === 'auth/email-already-in-use') {
        mensagem = 'Este e-mail já está cadastrado em outra conta.';
      } else if (err.code === 'auth/invalid-email') {
        mensagem = 'Formato de e-mail inválido.';
      }
      Alert.alert('Erro no Cadastro', mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <Text style={styles.title}>Criar Conta</Text>
      <Text style={styles.subtitle}>Junte-se ao SmartAgenda</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          placeholderTextColor="#888888"
          value={nome}
          onChangeText={setNome}
        />

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
          placeholder="Senha (mínimo 6 caracteres)"
          placeholderTextColor="#888888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirmar senha"
          placeholderTextColor="#888888"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {loading ? (
          <ActivityIndicator size="large" color="#9F7CFA" style={{ marginVertical: 20 }} />
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={handleCadastro} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Cadastrar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onBackToLogin} style={styles.linkContainer} activeOpacity={0.7}>
          <Text style={styles.linkText}>
            Já tem uma conta? <Text style={styles.linkTextBold}>Faça login</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {!isConnected && (
        <View style={styles.overlayBlur}>
          <View style={styles.offlineBox}>
            <Text style={styles.offlineTitle}>Sem Conexão</Text>
            <Text style={styles.offlineText}>
              O cadastro requer internet para funcionar. Conecte-se à rede para criar sua conta.
            </Text>
            {onCancel && (
              <TouchableOpacity style={styles.offlineButton} onPress={onCancel} activeOpacity={0.8}>
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
    backgroundColor: '#121212'
  },
  title: {
    fontSize: 32,
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
  },
  overlayBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  offlineBox: {
    backgroundColor: '#1E1E1E',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 30,
    borderWidth: 2,
    borderColor: '#9F7CFA',
  },
  offlineTitle: {
    color: '#9F7CFA',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  offlineButton: {
    backgroundColor: '#9F7CFA',
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