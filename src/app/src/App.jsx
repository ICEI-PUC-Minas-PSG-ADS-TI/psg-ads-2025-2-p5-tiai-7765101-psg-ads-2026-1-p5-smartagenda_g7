import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';

import { preloadModel } from './services/GENAIService';
import BasicGENAIPromptComponent from './components/BasicGENAIPromptComponent';
import LoginScreen from './pages/Login';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [user, setUser] = useState(null);

  useEffect(() => {
    preloadModel();
    
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
          <BasicGENAIPromptComponent />
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