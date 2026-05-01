import { Tarefa } from '../types/tarefa';
import TarefaDetalhes from './DetalhesTarefa';
import TaskManager from './TaskManager';
import { TrySalvarTarefa } from '../services/SaveControlService';
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Modal, Alert } from 'react-native';
import TarefaMinimal from './TarefaMinimal';

interface TarefaListProps {
    tarefas: Tarefa[];
    emptyMessage?: string;
    onRefresh?: () => void;
}

type ModalMode = 'none' | 'details' | 'edit';

const TarefaList: React.FC<TarefaListProps> = ({ tarefas, emptyMessage, onRefresh }) => {
    const [selectedTask, setSelectedTask] = useState<Tarefa | null>(null);
    const [modalMode, setModalMode] = useState<ModalMode>('none');
    const unsavedChanges = useRef(false);

    const handleOpenDetails = useCallback((tarefa: Tarefa) => {
        setSelectedTask(tarefa);
        setModalMode('details');
    }, []);

    const handleOpenEdit = useCallback((tarefa: Tarefa) => {
        setSelectedTask(tarefa);
        setModalMode('edit');
    }, []);

    const handleCloseModal = useCallback(() => {
        if (modalMode === 'edit' && unsavedChanges.current) {
            Alert.alert(
                'Tem certeza que deseja cancelar a edição da tarefa?',
                `Todas as alterações não salvas serão perdidas.`,
                [
                    { text: 'Não', style: 'cancel' },
                    {
                        text: 'Sim, sair sem salvar', onPress: () => {
                            unsavedChanges.current = false;
                            setSelectedTask(null);
                            setModalMode('none');
                        }
                    }
                ]
            );
            return;
        }
        unsavedChanges.current = false;
        setSelectedTask(null);
        setModalMode('none');
    }, [modalMode]);

    const handleSaveTask = useCallback(async (result?: Tarefa) => {
        if (result) {
            try {
                await TrySalvarTarefa(result);
            } catch (error) { console.log("ERRO ao salvar tarefa: " + error); }
        }
        
        if (onRefresh) onRefresh();
        
        unsavedChanges.current = false;
        setSelectedTask(null);
        setModalMode('none');
    }, [onRefresh]);

    return (
        <>
            <FlatList
                data={tarefas}
                renderItem={({ item }) => <TarefaMinimal tarefa={item} onPress={handleOpenDetails} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{emptyMessage || 'Nada por aqui ainda.'}</Text>
                </View>
            )}
        />
            <Modal visible={modalMode !== 'none'} transparent={true} animationType="slide" onRequestClose={handleCloseModal}>
                {modalMode === 'details' && selectedTask && (
                    <TarefaDetalhes tarefa={selectedTask} onClose={handleCloseModal} onEdit={handleOpenEdit} onComplete={handleSaveTask} />
                )}
                {modalMode === 'edit' && selectedTask && (
                    <TaskManager tarefa={selectedTask} onClose={handleSaveTask} onUnsavedChanges={(e) => unsavedChanges.current = e} />
                )}
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    listContainer: {
        padding: 16,
        paddingBottom: 100
    },
    emptyContainer: {
        marginTop: 80,
        alignItems: 'center',
        justifyContent: 'center'
    },
    emptyText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold'
    }
});

export default TarefaList;
