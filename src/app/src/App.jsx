import React, { useEffect, useState, useRef } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, Alert, DeviceEventEmitter } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

import Routes from './routes';
import LoginScreen from './pages/Login';
import CadastroScreen from './pages/Cadastro';
import StorageAPI, { CarregarConfiguracao } from './services/LocalStorageService';
import { onUserAuthenticated } from './services/UserService';
import SaveControlService from './services/SaveControlService';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { Init } from './services/NotificationService';

function AppContent() {
  const { theme, themeType } = useTheme();
  const isDarkMode = themeType === 'dark';
  const [user, setUser] = useState(null);
  const [showCadastro, setShowCadastro] = useState(false);
  const [showLogin, setShowLogin] = useState(false); // Initially false, so app opens normally
  const lastUid = useRef(null);

  useEffect(() => {
    let subscriber;
    const getcfg = async () => {
      return await CarregarConfiguracao();
    }
    const initNotifications = async () => {
      await Init();
    }
    initNotifications();

    let cfg = getcfg();
    if (cfg.UseBackup) {
      try {
        subscriber = auth().onAuthStateChanged(async (authUser) => {
          setUser(authUser);
          if (authUser && authUser.uid !== lastUid.current) {
            lastUid.current = authUser.uid;
            await onUserAuthenticated(authUser);
            await StorageAPI.Iniciar(); // Recarrega os dados locais apontando para o usuário logado
            console.log("Trying to sync after auth change...");
            await SaveControlService.TrySalvar(true); // Sincroniza e emite evento para atualizar UI
          }
        });
      } catch (err) {
        Alert.alert('Não foi possível se conectar ao Firebase', `Erro: ${err.message}`);
      }
    }
    else {
      console.log("Backup não habilitado.");
      const loadlocal = async () => {
        await StorageAPI.Iniciar();
      }
      loadlocal();
    }
    if (cfg.EnableDailyNotify !== undefined) {
      const setdailynoty = async (value) => {
        if (value) {
          let tarefas = await LocalStorageService.CarregarTarefasArray()
          if (tarefas) await RefreshDailyNotifications(tarefas);
        }
        else {
          let tarefas = await LocalStorageService.CarregarTarefasArray()
          if (tarefas) await DisableAllDailyNotifications(tarefas);
        }
      }
      setdailynoty(cfg.EnableDailyNotify)
    }
    if (cfg.EnableScheduledNotify !== undefined) {
      const setschedulednoty = async (value) => {
        if (value) {
          let tarefas = await LocalStorageService.CarregarTarefasArray()
          if (tarefas) await RefreshScheduledNotifications(tarefas);
        }
        else {
          let tarefas = await LocalStorageService.CarregarTarefasArray()
          if (tarefas) await DisableAllScheduledNotifications(tarefas);
        }
      }
      setschedulednoty(cfg.EnableScheduledNotify)
    }

    // Listener para abrir a tela de login a partir de outros componentes
    const eventListener = DeviceEventEmitter.addListener('showLogin', () => {
      setShowLogin(true);
      setShowCadastro(false);
    });

    return () => {
      if (subscriber) subscriber();
      eventListener.remove();
    };
  }, [user]);

  if (showCadastro) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <CadastroScreen
            onSuccess={() => setShowCadastro(false)}
            onBackToLogin={() => {
              setShowCadastro(false);
              setShowLogin(true);
            }}
            onCancel={() => setShowCadastro(false)}
          />
        </View>
      </SafeAreaProvider>
    );
  }

  if (showLogin) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <LoginScreen
            onSuccess={() => {
              console.log('Logado com sucesso!');
              setShowLogin(false);
            }}
            onCadastro={() => {
              setShowLogin(false);
              setShowCadastro(true);
            }}
            onBack={() => setShowLogin(false)}
          />
        </View>
      </SafeAreaProvider>
    );
  }

  // Sempre mostra a navegação principal, independente de logado ou não
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <Routes />
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}