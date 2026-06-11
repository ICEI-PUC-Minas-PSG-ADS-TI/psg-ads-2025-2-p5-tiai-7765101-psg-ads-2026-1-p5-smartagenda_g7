import React, { useEffect, useState } from 'react';
import {
ScrollView,
View,
Text,
StyleSheet,
TouchableOpacity,
Alert
} from 'react-native';

import StorageAPI from '../services/LocalStorageService';
import { Tarefa } from '../types/tarefa';
import { ExportDashboardPDF } from '../services/PDFService';
import { useTheme } from '../theme/ThemeContext';

export default function Dashboard() {

const { theme } = useTheme();

const [tarefas, setTarefas] = useState<Tarefa[]>([]);

useEffect(() => {
carregarDados();
}, []);

async function carregarDados() {
const tarefasObj = await StorageAPI.CarregarTarefas();


if (!tarefasObj) {
  setTarefas([]);
  return;
}

setTarefas(Object.values(tarefasObj));


}

const total = tarefas.length;

const finalizadas = tarefas.filter(
t => t.estado === 'Finalizado'
).length;

const emProgresso = tarefas.filter(
t => t.estado === 'EmProgresso'
).length;

const naoIniciadas = tarefas.filter(
t => t.estado === 'NaoIniciado'
).length;

const atrasadas = tarefas.filter(
t =>
t.estado !== 'Finalizado' &&
t.data_vencimento < Date.now()
).length;

const proximas = [...tarefas]
.filter(
t => t.estado !== 'Finalizado'
)
.sort(
(a, b) =>
a.data_vencimento -
b.data_vencimento
)
.slice(0, 5);

async function exportarPDF() {


try {

  await ExportDashboardPDF(
    tarefas
  );

} catch (error) {

  console.log(error);

  Alert.alert(
    'Erro',
    'Não foi possível gerar o PDF.'
  );

}


}

return (
<ScrollView
style={[
styles.container,
{
backgroundColor: theme.colors.background
}
]}
>
<Text
style={[
styles.titulo,
{
color: theme.colors.text
}
]}
>
Dashboard </Text>


  <View style={styles.grid}>

    <Card
      titulo="Total"
      valor={total}
      theme={theme}
    />

    <Card
      titulo="Finalizadas"
      valor={finalizadas}
      theme={theme}
    />

    <Card
      titulo="Em Progresso"
      valor={emProgresso}
      theme={theme}
    />

    <Card
      titulo="Não Iniciadas"
      valor={naoIniciadas}
      theme={theme}
    />

  </View>

  <View
    style={[
      styles.section,
      {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1
      }
    ]}
  >
    <Text
      style={[
        styles.sectionTitle,
        {
          color: theme.colors.text
        }
      ]}
    >
      ⚠️ Tarefas Atrasadas
    </Text>

   <Text
  style={[
    styles.bigNumber,
    {
      color:
        atrasadas > 0
          ? theme.colors.error
          : theme.colors.success
    }
  ]}
>
  {atrasadas}
</Text>
  </View>

  <View
    style={[
      styles.section,
      {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1
      }
    ]}
  >
    <Text
      style={[
        styles.sectionTitle,
        {
          color: theme.colors.text
        }
      ]}
    >
      📅 Próximos Vencimentos
    </Text>

    {
      proximas.map(item => (
        <View
          key={item.id}
          style={styles.taskItem}
        >
          <Text
            style={[
              styles.taskTitle,
              {
                color: theme.colors.text
              }
            ]}
          >
            {item.titulo}
          </Text>

          <Text
            style={[
              styles.taskDate,
              {
                color: theme.colors.textSecondary
              }
            ]}
          >
            {new Date(
              item.data_vencimento
            ).toLocaleDateString()}
          </Text>
        </View>
      ))
    }
  </View>

  <TouchableOpacity
    style={[
      styles.button,
      {
        backgroundColor: theme.colors.primary
      }
    ]}
    onPress={exportarPDF}
  >
    <Text style={styles.buttonText}>
      Exportar Relatório PDF
    </Text>
  </TouchableOpacity>

</ScrollView>


);
}

function Card({
titulo,
valor,
theme
}: {
titulo: string;
valor: number;
theme: any;
}) {
return (
<View
style={[
styles.card,
{
backgroundColor: theme.colors.surface,
borderColor: theme.colors.border,
borderWidth: 1
}
]}
>
<Text
style={[
styles.cardTitle,
{
color: theme.colors.textSecondary
}
]}
>
{titulo} </Text>


  <Text
    style={[
      styles.cardValue,
      {
        color: theme.colors.text
      }
    ]}
  >
    {valor}
  </Text>
</View>


);
}

const styles = StyleSheet.create({

container: {
flex: 1,
padding: 16,
},

titulo: {
fontSize: 26,
fontWeight: 'bold',
marginBottom: 20,
},

grid: {
flexDirection: 'row',
flexWrap: 'wrap',
justifyContent: 'space-between',
},

card: {
width: '48%',
padding: 16,
borderRadius: 12,
marginBottom: 12,
},

cardTitle: {
fontSize: 14,
},

cardValue: {
fontSize: 28,
fontWeight: 'bold',
marginTop: 10,
},

section: {
padding: 16,
borderRadius: 12,
marginTop: 16,
},

sectionTitle: {
fontSize: 18,
fontWeight: 'bold',
marginBottom: 12,
},

bigNumber: {
fontSize: 40,
fontWeight: 'bold',
},

taskItem: {
marginBottom: 12,
},

taskTitle: {
fontSize: 16,
},

taskDate: {},

button: {
marginTop: 20,
marginBottom: 40,
padding: 16,
borderRadius: 12,
alignItems: 'center',
},

buttonText: {
color: '#fff',
fontWeight: 'bold',
},
});
