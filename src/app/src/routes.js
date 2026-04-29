import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Calendar, ListTodo, Settings } from 'lucide-react-native';

// Importação das telas
import ListaTarefas from './pages/ListaTarefas';
import Calendario from './pages/Calendario';
import Configuracoes from './pages/Configuracoes';

const Tab = createBottomTabNavigator();

const Routes = () => {
  return (
    <Tab.Navigator
      initialRouteName="Tarefas"
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopColor: '#2D2D2D',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
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
        name="Configurações"
        component={Configuracoes}
        options={{
          tabBarLabel: 'Ajustes',
          tabBarIcon: ({ color }) => (
            <Settings color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default Routes;
