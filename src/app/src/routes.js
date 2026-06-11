import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MessageCircleMore, Calendar, ListTodo, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Importação das telas
import ListaTarefas from './pages/ListaTarefas';
import Calendario from './pages/Calendario';
import Configuracoes from './pages/Configuracoes';
import ChatIA from './pages/ChatIA';
import HistoricoIA from './pages/HistoricoIA';
import Dashboard from './pages/Dashboard';
const Tab = createBottomTabNavigator();

const Routes = () => {

  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      initialRouteName="Tarefas"
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopColor: '#2D2D2D',
          paddingBottom: insets.bottom,
          paddingTop: 5,
          height: 60 + insets.bottom,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Calendário"
        component={Calendario}
        options={{
          tabBarLabel: 'Calendário',
          tabBarIcon: ({ color }) => (
            <Calendar color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Tarefas"
        component={ListaTarefas}
        options={{
          tabBarLabel: 'Tarefas',
          tabBarIcon: ({ color }) => (
            <ListTodo color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat IA"
        component={ChatIA}
        options={{
          tabBarLabel: 'Chat IA',
          tabBarIcon: ({ color }) => (
            <MessageCircleMore color={color} size={24} />
          ),
        }}
      />

      <Tab.Screen
  name="Dashboard"
  component={Dashboard}
  options={{
    tabBarLabel: 'Dashboard',
    tabBarIcon: ({ color }) => (
      <ListTodo color={color} size={24} />
    ),
  }}
/>

      <Tab.Screen
        name="Configurações"
        component={Configuracoes}
        options={{
          tabBarLabel: 'Ajustes',
          tabBarIcon: ({ color }) => (
            <Settings color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="HistoricoIA"
        component={HistoricoIA}
        options={{
          href: null,
          tabBarItemStyle: {
            display: 'none',
          },
        }}
      />

    </Tab.Navigator>
  );
};

export default Routes;
