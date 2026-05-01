import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CalendarProvider, ExpandableCalendar, LocaleConfig } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import StorageAPI from '../services/LocalStorageService';
import TarefaList from '../components/TarefaList';

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
  const [allTasks, setAllTasks] = useState([]);
  const [taskMarks, setTaskMarks] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const carregarTarefas = useCallback(async () => {
    try {
      const tarefasArray = await StorageAPI.CarregarTarefasArray();
      if (tarefasArray) {
        setAllTasks(tarefasArray);
        const marks = {};
        tarefasArray.forEach(tarefa => {
          if (tarefa.data_vencimento) {
            const date = new Date(tarefa.data_vencimento);
            const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

            marks[dateString] = {
              marked: true,
              dotColor: tarefa.estado === 'Finalizado' ? '#4caf50' : '#f44336'
            };
          }
        });
        setTaskMarks(marks);
      } else {
        setAllTasks([]);
        setTaskMarks({});
      }
    } catch (error) {
      console.error("Erro ao carregar tarefas para o calendário: ", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarTarefas();
    }, [carregarTarefas])
  );

  const onDateChanged = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  const markedDates = useMemo(() => {
    const marks = { ...taskMarks };
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: '#BB86FC'
    };
    return marks;
  }, [taskMarks, selectedDate]);

  const tarefasDoDia = useMemo(() => {
    return allTasks.filter(tarefa => {
      if (!tarefa.data_vencimento) return false;
      const date = new Date(tarefa.data_vencimento);
      const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return dateString === selectedDate;
    });
  }, [allTasks, selectedDate]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendário</Text>
      
      <CalendarProvider
        date={selectedDate}
        onDateChanged={onDateChanged}
        theme={{ todayButtonTextColor: '#BB86FC' }}
      >
        <ExpandableCalendar
          initialPosition={'open'}
          closeOnDayPress={true}
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
            disabledArrowColor: '#fafafaff',
            monthTextColor: 'white',
            indicatorColor: 'white',
            textDayFontWeight: '400',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '500',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14
          }}
          renderArrow={(direction) => (
            <Text style={{ fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' }}>
              {direction === 'left' ? '<' : '>'}
            </Text>
          )}
          markedDates={markedDates}
        />
        
        <View style={styles.listContainer}>
          <TarefaList 
            tarefas={tarefasDoDia} 
            onRefresh={carregarTarefas}
            emptyMessage="Nenhum compromisso para hoje. Deixe a IA planejar algo para você?"
          />
        </View>
      </CalendarProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    marginTop: 20,
    textAlign: 'center',
  },
  calendar: {
    elevation: 4,
  },
  listContainer: {
    flex: 1,
    marginTop: 10,
  }
});

export default Calendario;
