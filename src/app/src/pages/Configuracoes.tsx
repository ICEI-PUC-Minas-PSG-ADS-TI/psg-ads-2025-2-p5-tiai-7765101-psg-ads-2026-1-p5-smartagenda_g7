import { useState, useEffect } from 'react';
import { View, Text, StyleSheet,  StatusBar, ScrollView, TouchableOpacity, Switch, Alert, TouchableHighlight, } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GetCurrentUser } from '../services/FirestoreService';
import LocalStorageService from '../services/LocalStorageService';
import { SafeAreaProvider } from 'react-native-safe-area-context';  
import CadastroScreen from './Cadastro';
import LoginScreen from './Login';
import { LogIn, LogOut } from "lucide-react-native";
import { TryCarregarTarefasArray } from '../services/SaveControlService';
import { CompareAndCheck } from '../services/SaveControlService';

type USettings = {
  EnableLocalAI?: boolean,
  UseBackup?: boolean
}

const Configuracoes = () => {
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<USettings>({});
  const [logging, setLogging] = useState(false);

  function Toggle(index: string, value: boolean) {
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
        if (value)
        {
          let old = LocalStorageService.CarregarTarefasLocal();
          let u = GetCurrentUser();
          if (u) setUser(u);
          setSettings(prev => ({
            ...prev,
            [index]: true
          }));
          TryCarregarTarefasArray();
        }
        else {
          if (handleLogout())
          {
            setSettings(prev => ({
            ...prev,
            [index]: false
          }));
            setUser(null);
          }
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

  function handleLogout() : boolean {
    Alert.alert("Dados a manter", "Deseja continuar com os dados atuais ou limpar todos os dados?") // ill do it later;
    auth().signOut();
    return true;
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
          />
        ) : (
          <LoginScreen
            onSuccess={() => {Toggle("UseBackup", true); setLogging(false);}}
            onCadastro={() => setShowCadastro(true)}
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

            <TouchableOpacity style={styles.option}  onPress={() => setLogging(true)}>
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
