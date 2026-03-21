// Página de listagem das tarefas, ordenados de ordem crescente em relação a quantos dias faltam para expirar.
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, ActivityIndicator, Alert, Modal } from 'react-native';
import auth from '@react-native-firebase/auth';
import TarefaMinimal from '../components/TarefaMinimal';
import TaskManager from '../components/TaskManager';
import { Tarefa } from '../types/tarefa.ts'
import StorageAPI from '../services/LocalStorageService';
import { set } from '@react-native-firebase/app/dist/module/internal/web/firebaseDatabase';

export default function ListaTarefas() {
    const [tarefas, setTarefas] = useState<Tarefa[]>([]);
    const [selectedTask, setSelectedTask] = useState<Tarefa | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const loadTarefas = async () => {
            setTarefas(await StorageAPI.CarregarTarefasArray() || []);
        };
        loadTarefas();
        OrdenarTarefas();
    }, []);

    const OrdenarTarefas = () => {
        // A implementar. Ordenar as tarefas de acordo com a data de vencimento, do mais próximo para o mais distante.
    }

    const NewTask = () => {
        console.log("new task");
        setSelectedTask(null); // Abrir o TaskManager sem passar uma tarefa, para criar uma nova.
        setIsModalOpen(true);
    }

    const EditTask = (tarefa: Tarefa) => {
        console.log("edit task: " + tarefa.id);
        setSelectedTask(tarefa);
        setIsModalOpen(true);
    }

    const SaveEdited = (result?: Tarefa) => { // tecnicamente só carregar as tarefas já atualizadas do StorageAPI seria o suficiente, mas acho que isso é mais eficiente.
        if (result)
        {
            const index = tarefas.findIndex(t => t.id === result.id);
            if (index !== -1) {
                setTarefas(prev => {
                    const newTarefas = [...prev];
                    newTarefas[index] = result;
                    return newTarefas;
                });
            }
            else setTarefas(prev => [...prev, result]);
        }
        setSelectedTask(null);
        setIsModalOpen(false);
    }

    return(
        <View>
            {isModalOpen && (
                <Modal transparent={true}>
                    <TaskManager tarefa={selectedTask} onClose={SaveEdited} />
                </Modal>
            )}
            <FlatList 
                data={tarefas}
                renderItem={({item}) => <TarefaMinimal tarefa={item} onPress={EditTask} />}
                keyExtractor={(item) => item.id}
            />
            <Button title="Adicionar Tarefa" onPress={NewTask} />
        </View>
    );
}