// Componente relacionada ao CRUD das tarefas. Podendo ser usado como Modal ou Página
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Task } from 'react-native';
import { Tarefa } from '../types/tarefa.ts'
import {CreateTarefa, LocaleStringToTimestamp} from '../services/TarefaService.ts';
import StorageAPI from '../services/LocalStorageService';


type Props = {
  tarefa?: Tarefa | null;
  onClose?: (result?: Tarefa) => void;
};

/**
 * @param tarefa A tarefa a ser gerenciada. Se não for fornecida, o componente irá criar uma nova tarefa.
 * @param onClose Função a ser chamada ao fechar o componente. Retorna a tarefa editada ou criada.
 */
export default function TaskManager({ tarefa, onClose }: Props)
{
    const creating = (tarefa == null || tarefa === undefined);

    const [task, setTask] = useState<Tarefa>(tarefa || 
        CreateTarefa(
            Date.now().toString(), // ID
            '',         //Titulo
            Date.now(), // Data criação
            Date.now() + 7*24*60*60*1000) // Data vencimento
        );
    const [textDates, setTextDates] = useState<Record<string, string>>({});

    useEffect(() => {
        setTextDates({
            data_criado: new Date(task.data_criado).toLocaleString(),
            data_vencimento: new Date(task.data_vencimento).toLocaleString(),
            data_finalizado: task.data_finalizado ? new Date(task.data_finalizado).toLocaleString() : '',
        });
        console.log(Date.parse(textDates.data_vencimento));
    }, [])

    const tryUpdateDate = (field: keyof Tarefa, value: string) => 
        {
            setTextDates(prev => ({...prev, [field]: value}));
            if (value.length < 19) return; // bem inflexível por enquanto, mas é só para evitar tentar converter strings que claramente não são datas.
            //  O formato esperado é "dd/MM/yyyy HH:mm:ss", que tem exatamente 19 caracteres.

            const timestamp = LocaleStringToTimestamp(value);
            console.log(timestamp);
            if (timestamp !== null) {
                updateField(field, timestamp);
                console.log("ACTUALLY SAVING TIME!");
            }
        }

    const updateField = (field: keyof Tarefa, value: any) => {
        setTask(prev => ({
        ...prev,
        [field]: value
        }));
    };

    /**
     * Altera o estado da tarefa entre as 3 possíveis. Se requireConfirm for true, exibe um alerta de confirmação antes de alterar o estado.
     * @param state O estado para o qual a tarefa deve ser alterada. Deve ser "NaoIniciado", "EmProgresso" ou "Finalizado".
     * @param requireConfirm Se true, exibe um alerta de confirmação antes de alterar o estado.
     * @param confirmText Texto a ser exibido na descrição do alerta de confirmação. Ignorado se requireConfirm for false.
     */
    const ChangeState = (state: string, requireConfirm?: boolean, confirmText?: string) => {
        if (requireConfirm)
        {
            Alert.alert("Confirmação", confirmText || "Tem certeza que deseja alterar o estado da tarefa?", [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Confirmar",
                    onPress: () => {
                        ChangeState(state, false);
                    }
                }
            ]);
        }
        else
        {
            if (state === "Finalizado" && !task.data_finalizado)
            {
                var timern = Date.now();
                updateField('data_finalizado', timern);
                setTextDates(prev => ({...prev, data_finalizado: new Date(timern).toLocaleString()}));
            }
            else
            {
                updateField('data_finalizado', undefined);
                setTextDates(prev => ({...prev, data_finalizado: ''}));
            }
            updateField('estado', state);
        }

    }

    const Exit = async () => 
        {
            let data = await StorageAPI.CarregarTarefas() || {};
            if (data)
            {
                data[task.id] = task;
                await StorageAPI.SalvarTarefas(data);
            }
            if (onClose) onClose(task);
        }

    return(
        <View style={styles.container}>
            <Text style={styles.title}>{creating ? "Criar Tarefa" : "Editar Tarefa"}</Text>
            <Text style={styles.label}>Título:</Text>
            <TextInput 
                placeholder="Tarefa Exemplo"
                value={task.titulo}
                inputMode={'text'}
                onChangeText={text => updateField('titulo', text)}
                style={styles.input}
                />
            <Text style={styles.label}>Descrição Geral:</Text>
            <TextInput 
                placeholder="Realizar um dever de casa"
                value={task.descricao_geral}
                inputMode={'text'}
                onChangeText={text => updateField('descricao_geral', text)}
                style={styles.input}
            />
            <Text style={styles.label}>Data de Vencimento:</Text>
            <TextInput 
                placeholder="01/01/1970 00:00:00"
                value={textDates.data_vencimento}
                inputMode={'text'}
                onChangeText={text => tryUpdateDate('data_vencimento', text)}
                style={styles.input}
            />

            <Text style={styles.label}>{task.estado}</Text>

            {task.data_finalizado &&(
                <View>
                    <Text style={styles.secondarytext}>Finalizado em {textDates.data_finalizado}</Text>
                    <TouchableOpacity style={styles.buttonsmall} onPress={()=> ChangeState("EmProgresso", true, "Tem certeza que deseja reabrir a tarefa?")} >
                        <Text style={styles.label}>Reabrir Tarefa</Text>
                    </TouchableOpacity>
                </View>
            )}
            {!creating && !task.data_finalizado &&(
                <TouchableOpacity style={styles.buttonsmall} onPress={()=> ChangeState("Finalizado", true, "Tem certeza que deseja finalizar a tarefa?")} >
                    <Text style={styles.label}>Finalizar Tarefa</Text>
                </TouchableOpacity>
            )}

            <Button title={creating ? "Criar Tarefa" : "Salvar Alterações"} onPress={Exit} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#121212'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white'
  },
  input: {
    color: '#000',
    borderColor: '#000',
    borderWidth: 2,
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  label: {
    color: 'white'
  },
  secondarytext: {
    color: '#aaa'
  },
  buttonsmall: {
    marginVertical: 10,
    marginHorizontal: 50,
    backgroundColor: '#1E90FF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center'
  }
});