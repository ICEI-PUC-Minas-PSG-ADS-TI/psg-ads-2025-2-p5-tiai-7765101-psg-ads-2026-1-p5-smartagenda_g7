import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';

import { preloadModel } from './services/GENAIService';
import BasicGENAIPromptComponent from './components/BasicGENAIPromptComponent';
import LoginScreen from './pages/Login';
import ListaTarefas from './pages/ListaTarefas';
import CadastroScreen from './pages/Cadastro';
import StorageAPI from './services/LocalStorageService';
import { onUserAuthenticated } from './services/UserService';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [user, setUser] = useState(null);
  const [showCadastro, setShowCadastro] = useState(false);

  useEffect(() => {
    try {
      const subscriber = auth().onAuthStateChanged(async (authUser) => {
        setUser(authUser);

        if (authUser) {
          await onUserAuthenticated(authUser);
          await StorageAPI.Iniciar(); // Recarrega os dados locais apontando para o usuário logado
        }
      });
      return subscriber;
    } catch (err) {
      Alert.alert('Não foi possível se conectar ao Firebase', `Erro: ${err.message}`);
      return;
    }
  }, []);

  // Se está logado, mostra a lista de tarefas
  if (user) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.container}>
          <ListaTarefas />
        </View>
      </SafeAreaProvider>
    );
  }

  // Se não está logado, mostra tela de login ou cadastro
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.container}>
        {showCadastro ? (
          <CadastroScreen
            onSuccess={() => setShowCadastro(false)}
            onBackToLogin={() => setShowCadastro(false)}
          />
        ) : (
          <LoginScreen
            onSuccess={() => console.log('Logado com sucesso!')}
            onCadastro={() => setShowCadastro(true)}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212'
  }
});

export default App;