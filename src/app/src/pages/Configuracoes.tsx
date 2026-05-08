import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity, Switch, Alert, DeviceEventEmitter } from 'react-native';
import { buscarTarefasFirestore, GetCurrentUser, Signout } from '../services/FirestoreService';
import LocalStorageService, { CarregarTarefas, CarregarTarefasArray } from '../services/LocalStorageService';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CadastroScreen from './Cadastro';
import LoginScreen from './Login';
import { LogIn, LogOut } from "lucide-react-native";
import { TryCarregarTarefasArray, TrySalvar, TrySalvarTarefa } from '../services/SaveControlService';
import { Tarefa } from '../types/tarefa';
import { CompareAndCheck } from '../services/SaveControlService';

type USettings = {
  EnableLocalAI?: boolean,
  UseBackup?: boolean
}

const Configuracoes = () => {
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<USettings>({});
  const [logging, setLogging] = useState(false);

  async function Toggle(index: string, value: boolean) {
    switch (index) {
      case "EnableLocalAI": //falta verificar se já está instalado e a quantidade exata a ser instalada
        if (value) Alert.alert("Habilitar IA local", "A IA local offline é consideravelmente mais lenta do que em Cloud, e será necessário baixar uma carga de ~1,5gb em seu dispositivo. Deseja habilitar?",
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Habilitar', onPress: () => {
                setSettings(prev => ({
                  ...prev,
                  [index]: value
                }));
              }
            }
          ]
        );
        else {
          setSettings(prev => ({
            ...prev,
            [index]: value
          }));
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
          LocalStorageService.SalvarTarefas(resmap);
          await TrySalvar();
        }
        else {
          if (await YouSure("Desativar Backup em Cloud", "Deseja realmente desativar o backup em cloud? Todos os dados locais atuais serão mantidos, mas não serão mais sincronizados com a nuvem, e novos dados não serão salvos na nuvem."))
          {
            console.log("Sucessful logoff");
            if (await handleLogout()) { // manter dados
              await LocalStorageService.CarregarTarefas();
            }
            else { // limpar dados
              await LocalStorageService.ClearLocalData();
              await LocalStorageService.ClearCacheData();
            }
            await Signout();
            //GetCurrentUser().signOut();

            await TrySalvar(true);
            setSettings(prev => ({
              ...prev,
              [index]: false
            }));
            setUser(null);
          }
          else return;
        }
        //console.log("Emitting from config");
        //DeviceEventEmitter.emit('tarefasUpdated');
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
      <StatusBar barStyle={'dark-content'} />
      <View style={styles.container}>
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
      </View>
    </SafeAreaProvider>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações</Text>

      <ScrollView>
        {user ? (
          <TouchableOpacity style={styles.option} onPress={() => Toggle("UseBackup", false)}>
            <View style={styles.compOption}>
              <Text style={styles.Optiontext}>Desativar Backup em Cloud</Text>
              <Text style={styles.OptionSubtext}>Desconectar a conta de backup em Cloud</Text>
            </View>
            <LogOut color={'#d1d1d1'} size={24} />
          </TouchableOpacity>
        ) : (

          <TouchableOpacity style={styles.option} onPress={() => setLogging(true)}>
            <View style={styles.compOption}>
              <Text style={styles.Optiontext}>Backup em Cloud</Text>
              <Text style={styles.OptionSubtext}>Realizar backup e sincronização entre dispositivos</Text>
            </View>
            <LogIn color={'#d1d1d1'} size={24} />
          </TouchableOpacity>

        )}
        <View style={styles.option}>
          <Text style={styles.Optiontext}>Habilitar IA Local Offline</Text>
          <Switch value={settings?.EnableLocalAI}
            onValueChange={(val) => Toggle("EnableLocalAI", val)}
            trackColor={{ false: '#555', true: '#4CAF50' }}
            thumbColor={'white'} style={styles.Slider} />
        </View>
        {/*}
        <View style={styles.option}>
          <Text style={styles.Optiontext}>Option</Text>
          <TouchableOpacity style={styles.Slider}><Text style={styles.text}>xD</Text></TouchableOpacity>
        </View>
        <View style={styles.option}>
          <Text style={styles.Optiontext}>Option</Text>
          <TouchableOpacity style={styles.Slider}><Text style={styles.text}>xD</Text></TouchableOpacity>
        </View>*/}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    color: 'white'
  },
  Optiontext: {
    color: 'white',
    alignItems: "flex-start",
    width: "70%"
  },
  OptionSubtext: {
    color: '#d1d1d1',
    alignItems: "flex-start",
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "nowrap",
    width: "100%",
    borderColor: "grey",
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
  }
});

export default Configuracoes;
