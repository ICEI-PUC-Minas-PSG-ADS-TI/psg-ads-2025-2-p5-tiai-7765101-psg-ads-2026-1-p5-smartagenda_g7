import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import StorageAPI from '../services/LocalStorageService';

// Configuração para pt-br
LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

const Calendario = () => {
  const [markedDates, setMarkedDates] = useState({});

  useFocusEffect(
    useCallback(() => {
      const carregarTarefas = async () => {
        try {
          const tarefasArray = await StorageAPI.CarregarTarefasArray();
          if (tarefasArray) {
            const marks = {};
            tarefasArray.forEach(tarefa => {
              if (tarefa.data_vencimento) {
                const date = new Date(tarefa.data_vencimento);
                // Formato exigido pelo react-native-calendars: YYYY-MM-DD
                const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                
                // Destaca os dias. Usa cor diferente se a tarefa estiver finalizada
                marks[dateString] = { 
                  marked: true, 
                  dotColor: tarefa.estado === 'Finalizado' ? '#4caf50' : '#f44336'
                };
              }
            });
            setMarkedDates(marks);
          }
        } catch (error) {
          console.error("Erro ao carregar tarefas para o calendário: ", error);
        }
      };
      
      carregarTarefas();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendário</Text>
      <Calendar
        style={styles.calendar}
        theme={{
          backgroundColor: '#121212',
          calendarBackground: '#1E1E1E',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#BB86FC',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#BB86FC',
          dayTextColor: '#d9e1e8',
          textDisabledColor: '#555555',
          dotColor: '#BB86FC',
          selectedDotColor: '#ffffff',
          arrowColor: '#FFFFFF',
          disabledArrowColor: '#555555',
          monthTextColor: 'white',
          indicatorColor: 'white',
          textDayFontWeight: '400',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '500',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14
        }}
        markedDates={markedDates}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center',
  },
  calendar: {
    borderRadius: 10,
    elevation: 4,
  }
});

export default Calendario;
