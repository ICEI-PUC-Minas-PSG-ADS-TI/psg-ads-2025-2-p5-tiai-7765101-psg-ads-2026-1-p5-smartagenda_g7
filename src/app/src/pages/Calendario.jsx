import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Agenda, LocaleConfig } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import StorageAPI from '../services/LocalStorageService';
import TarefaFilter, { aplicarFiltros } from '../components/TarefaFilter';
import { useTaskModals } from '../components/TarefaList';
import TarefaMinimal from '../components/TarefaMinimal';

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

// Inicializa com a data local correta
const getTodayLocalString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const agendaTheme = {
  reservationsBackgroundColor: '#121212',
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
  agendaDayTextColor: '#A59EC0',
  agendaDayNumColor: '#A59EC0',
  agendaTodayColor: '#BB86FC',
  agendaKnobColor: '#BB86FC'
};

const Calendario = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayLocalString());

  const [selectedState, setSelectedState] = useState('Todas');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const carregarTarefas = useCallback(async () => {
    try {
      const tarefasArray = await StorageAPI.CarregarTarefasArray();
      setAllTasks(tarefasArray || []);
    } catch (error) {
      console.error("Erro ao carregar tarefas para o calendário: ", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarTarefas();
    }, [carregarTarefas])
  );

  const { handleOpenDetails, modals } = useTaskModals(carregarTarefas);

  const categoriasDisponiveis = useMemo(() => {
    const cats = new Set();
    allTasks.forEach(t => {
      if (t.categorias) t.categorias.forEach(c => cats.add(c));
    });
    return Array.from(cats);
  }, [allTasks]);

  const handleToggleCategory = useCallback((cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }, []);

  const filteredTasks = useMemo(() => {
    return aplicarFiltros(allTasks, selectedState, selectedCategories);
  }, [allTasks, selectedState, selectedCategories]);

  const markedDates = useMemo(() => {
    const marks = {};
    filteredTasks.forEach(tarefa => {
      if (tarefa.data_vencimento) {
        const date = new Date(tarefa.data_vencimento);
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        marks[dateString] = {
          marked: true,
          dotColor: tarefa.estado === 'Finalizado' ? '#4caf50' : '#f44336'
        };
      }
    });

    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: '#BB86FC'
    };
    return marks;
  }, [filteredTasks, selectedDate]);

  const items = useMemo(() => {
    const map = {};

    // Pre preenche com varias datas para diminuir lag com o scroll
    const startDate = new Date(2025, 0, 1); // 01/01/2025
    const endDate = new Date(2027, 11, 31); // 31/12/2027

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      map[dateString] = [];
    }

    // Distribui as tarefas nos seus respectivos dias
    filteredTasks.forEach(tarefa => {
      if (tarefa.data_vencimento) {
        const date = new Date(tarefa.data_vencimento);
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        if (!map[dateString]) {
          map[dateString] = [];
        }
        map[dateString].push(tarefa);
      }
    });

    return map;
  }, [filteredTasks]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendário</Text>

      <View style={styles.headerContainer}>
        <TarefaFilter
          selectedState={selectedState}
          selectedCategories={selectedCategories}
          categoriasDisponiveis={categoriasDisponiveis}
          onSelectState={setSelectedState}
          onToggleCategory={handleToggleCategory}
        />
      </View>

      <Agenda
        items={items}
        selected={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        rowHasChanged={(r1, r2) => {
          if (!r1 || !r2) return true;
          return r1.id !== r2.id || r1.estado !== r2.estado || r1.titulo !== r2.titulo;
        }}
        renderItem={(item) => (
          <View style={styles.itemContainer}>
            <TarefaMinimal tarefa={item} onPress={handleOpenDetails} />
          </View>
        )}
        renderEmptyDate={() => (
          <View style={styles.emptyDateContainer}>
            <View style={styles.emptyDateLine} />
          </View>
        )}
        renderEmptyData={() => (
          <View style={styles.emptyDataContainer}>
            <Text style={styles.emptyDataText}>Nenhum compromisso por aqui. Deixe a IA planejar algo para você?</Text>
          </View>
        )}
        markedDates={markedDates}
        theme={agendaTheme}
      />
      {modals}
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
  headerContainer: {
    paddingBottom: 10,
  },
  itemContainer: {
    marginRight: 10,
    marginTop: 17,
  },
  emptyDateContainer: {
    height: 15,
    paddingTop: 30,
  },
  emptyDateLine: {
    height: 1,
    backgroundColor: '#2D2D2D',
    marginLeft: 10,
    marginRight: 10,
  },
  emptyDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyDataText: {
    color: '#A59EC0',
    fontSize: 16,
    textAlign: 'center',
  }
});

export default Calendario;
