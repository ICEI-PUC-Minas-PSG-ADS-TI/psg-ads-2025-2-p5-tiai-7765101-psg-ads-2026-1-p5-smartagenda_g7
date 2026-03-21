import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';

import { preloadModel } from './services/GENAIService';
import BasicGENAIPromptComponent from './components/BasicGENAIPromptComponent';
import LoginScreen from './pages/Login';
import ListaTarefas from './pages/ListaTarefas';

import StorageAPI from './services/LocalStorageService';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [user, setUser] = useState(null);

  useEffect(() => {
    //preloadModel(); Desativado pois não vamos testar a IA agora

    StorageAPI.Iniciar(); // CARREGAMENTO DE DADOS LOCAIS
    
    try {
      const subscriber = auth().onAuthStateChanged(setUser);
      return subscriber; 
    } catch (err) {
      Alert.alert('Não foi possível se conectar ao Firebase', `Erro: ${err.message}`);
      return;
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={styles.container}>
        {user ? (
          <ListaTarefas />
        ) : (
          <LoginScreen onSuccess={() => console.log('Logado com sucesso!')} />
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