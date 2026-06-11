import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, StatusBar, ScrollView, Modal, TouchableOpacity, Switch, Alert } from 'react-native';

import { buscarTarefasFirestore, GetCurrentUser, Signout } from '../services/FirestoreService';
import LocalStorageService, { SalvarConfiguracao } from '../services/LocalStorageService';
import { TrySalvar, CompareAndCheck } from '../services/SaveControlService';
import { initLocalModel, IsDownloaded, UninstallModel } from '../services/LocalGenAIService';
import { Notify, Schedule } from '../services/NotificationService';
import { CleanupSubtaskReferences, DisableAllDailyNotifications, DisableAllScheduledNotifications, RefreshDailyNotifications, RefreshNotifications, RefreshScheduledNotifications } from '../services/TarefaService';

import CadastroScreen from './Cadastro';
import LoginScreen from './Login';
import { LogIn, LogOut } from "lucide-react-native";
import { Tarefa } from '../types/tarefa';
import { USettings } from '../types/usettings';
import { useTheme } from '../theme/ThemeContext';


const Configuracoes = () => {
  const { theme, themeType, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<USettings>({});
  const [logging, setLogging] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const navigation = useNavigation<any>();

  async function Toggle(index: string, value: boolean) {
    switch (index) {
      case "EnableLocalAI":
        if (value) {
          const onlywhendownloaded = async () => {
            const isdownloaded = await IsDownloaded();
            if (isdownloaded) {
              setSettings(prev => ({
                ...prev,
                ["EnableLocalAI"]: true
              }));
            }
            else {
              Alert.alert("Habilitar IA local", [
                "A IA local offline é uma função experimental.",
                "",
                "• O desempenho é CONSIDERAVELMENTE mais lento que o modo Cloud.",
                "• Algumas funções são limitadas em sua complexidade.",
                "• Será necessário baixar uma carga de aproximadamente 2 GB no dispositivo.",
                "",
                "Deseja continuar?"
              ].join("\n"),
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Habilitar e Baixar Modelo', onPress: () => {
                      DownloadLocalAI();
                    }
                  }
                ]
              );
            }
          }
          onlywhendownloaded();
        }
        else {
          setSettings(prev => ({
            ...prev,
            [index]: value
          }));

          const onlywhendownloaded2 = async () => {
            const isdownloaded = await IsDownloaded();
            if (isdownloaded) {
              Alert.alert("Desisntalar modelo", "Deseja adicionalmente desinstalar a carga de ~2gb de seu dispositivo?",
                [
                  { text: 'Desativar SEM DESISNTALAR', style: 'cancel' },
                  {
                    text: 'Desativar E DESISNTALAR O MODELO', onPress: async () => {
                      await UninstallModel();
                    }
                  }
                ]
              );
            }
          }
          onlywhendownloaded2();
        }
        break;
      case "UseBackup":
        if (value) {
          console.log("Suceessful logon");
          let o = await LocalStorageService.CarregarTarefasLocalGuest();
          let oldtasks;
          if (o) {
            oldtasks = Object.values(o);
          }
          let newTasks;
          try {
            newTasks = await buscarTarefasFirestore();
          }
          catch { }
          let res = await CompareAndCheck(newTasks, oldtasks);

          if (!res) res = [];

          let u = GetCurrentUser();
          if (u) setUser(u);
          setSettings(prev => ({
            ...prev,
            [index]: true
          }));
          let resmap = Object.fromEntries(
            res.map(t => [t.id, t])
          ) as Record<string, Tarefa>;
          resmap = await CleanupSubtaskReferences(resmap);
          LocalStorageService.SalvarTarefas(resmap);
          //console.log(resmap);
          try {
            await TrySalvar(true);
          } finally {
            await RefreshNotifications();
          }

        }
        else {
          if (await YouSure("Desativar Backup em Cloud", "Deseja realmente desativar o backup em cloud? Todos os dados locais atuais poderão mantidos, mas não serão mais sincronizados com a nuvem, e novos dados não serão salvos na nuvem.")) {
            console.log("Sucessful logoff");
            if (await handleLogout()) { // manter dados
              let t = await LocalStorageService.CarregarTarefas();
              await Signout();
              if (t) await LocalStorageService.SalvarTarefas(t);
            }
            else { // limpar dados
              await LocalStorageService.ClearLocalData();
              await LocalStorageService.ClearCacheData();
              await Signout();
            }
            //GetCurrentUser().signOut();

            try {
              await TrySalvar(true);
            } finally {
              await RefreshNotifications();
            }

            setSettings(prev => ({
              ...prev,
              [index]: false
            }));
            setUser(null);
          }
          else return;
        }
        break;
      case "EnableDailyNotify":
        setSettings(prev => ({
          ...prev,
          [index]: value
        }));
        let tarefas1 = await LocalStorageService.CarregarTarefasArray()
        if (tarefas1) {
          if (value) {
            await RefreshDailyNotifications(tarefas1);
          }
          else {
            await DisableAllDailyNotifications(tarefas1);
          }
          await LocalStorageService.SalvarTarefasArray(tarefas1);
        }
        break;
      case "EnableScheduledNotify":
        setSettings(prev => ({
          ...prev,
          [index]: value
        }));
        let tarefas2 = await LocalStorageService.CarregarTarefasArray()
        if (tarefas2) {
          if (value) {
            await RefreshScheduledNotifications(tarefas2);
          }
          else {
            await DisableAllScheduledNotifications(tarefas2);
          }
          await LocalStorageService.SalvarTarefasArray(tarefas2);
        }
        break;

    }
  }

  useEffect(() => {
    let user = GetCurrentUser();
    if (user) setUser(user);

    const loadSettings = async () => {
      let localsettings = await LocalStorageService.CarregarConfiguracao();
      if (localsettings) setSettings(localsettings);
    }

    loadSettings();
  }, []);

  useEffect(() => {
    const salvarcfg = async () => {
      await SalvarConfiguracao(settings);
    }
    salvarcfg();
  }, [settings])

  function YouSure(title: string, message: string): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        title,
        message,
        [
          {
            text: "Não",
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: "Sim",
            style: "destructive",
            onPress: () => resolve(true),
          }
        ]
      );
    });
  }

  function DownloadLocalAI() {
    const dld = async () => {
      await initLocalModel((m) => {
        if (m == "Preparing model...") {
          setLoadingText("");
          setSettings(prev => ({
            ...prev,
            ["EnableLocalAI"]: true
          }));
          return;
        }
        setLoadingText(m)
      });
    }
    dld();
  }

  function handleLogout(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        "Dados a manter",
        "Deseja continuar com os dados atuais ou limpar todos os dados?",
        [
          {
            text: "Limpar dados",
            style: "destructive",
            onPress: () => resolve(false),
          },
          {
            text: "Manter dados",
            style: "cancel",
            onPress: () => resolve(true),
          }
        ]
      );
    });
  }

  const [showCadastro, setShowCadastro] = useState(false);

  if (logging) return (
    <SafeAreaProvider>
      <StatusBar barStyle={theme.type === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {showCadastro ? (
          <CadastroScreen
            onSuccess={() => { Toggle("UseBackup", true); setLogging(false); }}
            onBackToLogin={() => setShowCadastro(false)}
            onCancel={() => setLogging(false)}
          />
        ) : (
          <LoginScreen
            onSuccess={() => { Toggle("UseBackup", true); setLogging(false); }}
            onCadastro={() => setShowCadastro(true)}
            onBack={() => setLogging(false)}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Configurações</Text>

      <Modal visible={loadingText !== ""} transparent={true} animationType="slide" onRequestClose={() => { }}>
        <View style={[styles.modal]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{loadingText}</Text>
        </View>
      </Modal>

      <ScrollView>
        {user ? (
          <TouchableOpacity style={[styles.option, { borderColor: theme.colors.border }]} onPress={() => Toggle("UseBackup", false)}>
            <View style={styles.compOption}>
              <Text style={[styles.Optiontext, { color: theme.colors.text }]}>Desativar Backup em Cloud</Text>
              <Text style={[styles.OptionSubtext, { color: theme.colors.textSecondary }]}>Desconectar a conta de backup em Cloud</Text>
            </View>
            <LogOut color={theme.colors.textSecondary} size={24} />
          </TouchableOpacity>
        ) : (

          <TouchableOpacity style={[styles.option, { borderColor: theme.colors.border }]} onPress={() => setLogging(true)}>
            <View style={styles.compOption}>
              <Text style={[styles.Optiontext, { color: theme.colors.text }]}>Backup em Cloud</Text>
              <Text style={[styles.OptionSubtext, { color: theme.colors.textSecondary }]}>Realizar backup e sincronização entre dispositivos</Text>
            </View>
            <LogIn color={theme.colors.textSecondary} size={24} />
          </TouchableOpacity>

        )}
        <View style={[styles.option, { borderColor: theme.colors.border }]}>
          <Text style={[styles.Optiontext, { color: theme.colors.text }]}>Habilitar Notificações Marcadas</Text>
          <Switch value={settings.EnableScheduledNotify ?? true}
            onValueChange={async (v) => await Toggle("EnableScheduledNotify", v)}
            trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.success }}
            thumbColor={'white'} style={styles.Slider} />
        </View>
        <View style={[styles.option, { borderColor: theme.colors.border }]}>
          <Text style={[styles.Optiontext, { color: theme.colors.text }]}>Habilitar Notificações Diárias</Text>
          <Switch value={settings.EnableDailyNotify ?? false}
            onValueChange={async (v) => await Toggle("EnableDailyNotify", v)}
            trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.success }}
            thumbColor={'white'} style={styles.Slider} />
        </View>
        <View style={[styles.option, { borderColor: theme.colors.border }]}>
          <View style={styles.compOption}>
            <Text style={[styles.Optiontext, { color: theme.colors.text }]}>Tema Escuro</Text>
            <Text style={[styles.OptionSubtext, { color: theme.colors.textSecondary }]}>Ativar ou desativar o modo escuro</Text>
          </View>
          <Switch value={themeType === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }}
            thumbColor={'white'} style={styles.Slider} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
  },
  Optiontext: {
    alignItems: "flex-start",
    width: "70%"
  },
  OptionSubtext: {
    alignItems: "flex-start",
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "nowrap",
    width: "100%",
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  compOption: {
    flexDirection: "column",
    flex: 1
  },
  Slider: {
    width: "30%",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  modal: {
    flex: 1,
    maxHeight: 100,
    padding: 30,
    margin: 'auto',
    backgroundColor: 'black',
    borderRadius: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignContent: 'center',
    borderColor: 'white',
    borderWidth: 2
  }
});

export default Configuracoes;
