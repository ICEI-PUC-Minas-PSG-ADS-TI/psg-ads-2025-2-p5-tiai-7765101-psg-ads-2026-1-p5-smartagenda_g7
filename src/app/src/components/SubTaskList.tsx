import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, Modal, StyleSheet, StatusBar, ActivityIndicator, Alert } from 'react-native';

// Componentes
import TaskManager from './TaskManager.tsx';
import TarefaDetalhes from './DetalhesTarefa.tsx';
import SubTarefaMinimal from './SubTarefaMinimal.tsx';

// Serviços e Tipos
import { Tarefa } from '../types/tarefa.ts';
import { OrdenarTarefas, GetSubtarefas } from '../services/TarefaService.ts';
import { TrySalvarTarefa } from '../services/SaveControlService.ts';

type Props = {
    tarefaPai: Tarefa;
    ModalType?: 'details' | 'edit';
    onUpdateSubtask?: (subtarefas?: Tarefa) => void;
}

export default function SubtaskList({ tarefaPai, ModalType, onUpdateSubtask }: Props) {
    const [subTarefas, setSubTarefas] = useState<Tarefa[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [modalMode, setModalMode] = useState<'details' | 'edit'>(ModalType || 'details');
    const unsavedChanges = useRef(false);
    const [selectedTask, setSelectedTask] = useState<Tarefa | null>(null);

    const carregarTarefas = useCallback(async () => {
        try {
            setCarregando(true);
            let subtasks = await GetSubtarefas(tarefaPai);
            setSubTarefas(subtasks || []);
            console.log("subTarefas de ", tarefaPai.titulo, ":", subtasks);
        } catch (error) {
            console.log("[ListaTarefas] ATENÇÃO: Ocorreu um erro ao carregar as subtarefas: " + error);
        } finally {
            setCarregando(false);
        }
    }, [tarefaPai]);

    useEffect(() => {
        carregarTarefas();
    }, [carregarTarefas]);

    const handleOpenModal = useCallback((tarefa: Tarefa) => {
        setSelectedTask(tarefa);
        setModalMode(ModalType || 'details');
    }, [ModalType]);

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
                        }
                    }
                ]
            );
            return;
        }
        unsavedChanges.current = false;
        setSelectedTask(null);
        if (ModalType && ModalType === 'edit') {
            setModalMode('edit');
        }
        else setModalMode('details');
    }, [modalMode, unsavedChanges.current]);

    const handleSaveTask = useCallback(async (result?: Tarefa) => {
        if (result) {
            try {
                const atualizadas = await TrySalvarTarefa(result);
                if (atualizadas.length > 0) {
                    
                    const filtradas = atualizadas.filter(t =>
                        tarefaPai.subtarefas?.includes(t.id)
                    );
                    console.log("[suntasklist] a serem atualizadas: ", filtradas.length);
                    let ordered = OrdenarTarefas(filtradas);
                    console.log("[suntasklist] ordenadas: ", ordered.length);
                    setSubTarefas(ordered);
                }
                else { console.log("ATENÇÃO: Lista de tarefas vazia após tentativa de salvamento."); }
            } catch (error) { console.log("ERRO ao salvar tarefa: " + error); }
            if (onUpdateSubtask) onUpdateSubtask(result);
        }
        else {
            if (onUpdateSubtask) onUpdateSubtask(); // call for refresh
        }
        unsavedChanges.current = false;
        handleCloseModal();
    }, [handleCloseModal, onUpdateSubtask]);

    /*const tarefasFiltradas = useMemo(() => {
        return tarefas.filter(t => {
            if (filtroAtivo === 'Pendentes') return t.estado === 'NaoIniciado' || t.estado === 'EmProgresso';
            if (filtroAtivo === 'Concluídas') return t.estado === 'Finalizado';
            return true;
        });
    }, [tarefas, filtroAtivo]);*/

    if (carregando) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9F7CFA" />
                <Text style={styles.loadingText}>Carregando tarefas...</Text>
            </View>
        );
    }

    if (subTarefas.length > 0) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#121212" />

                <Modal visible={selectedTask !== null} transparent={true} animationType="slide" onRequestClose={handleCloseModal}>
                    {modalMode === 'details' && selectedTask && (
                        <TarefaDetalhes tarefa={selectedTask} onClose={handleCloseModal} onEdit={handleOpenEdit} onComplete={handleSaveTask} />
                    )}
                </Modal>
                {selectedTask !== null && modalMode === 'edit' && (
                        <TaskManager tarefa={selectedTask} onClose={handleSaveTask} onUnsavedChanges={(e) => unsavedChanges.current = e} parent={tarefaPai} />
                    )}

                <FlatList
                    data={subTarefas}
                    renderItem={({ item }) => <SubTarefaMinimal tarefa={item} onPress={handleOpenModal} />}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    scrollEnabled={false}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Nenhuma subtarefa encontrada.</Text>
                        </View>
                    )}
                />


                {/* Botão de Adicionar (+) 
            <TouchableOpacity style={styles.fab} onPress={handleCreateNew} activeOpacity={0.8}>
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>*/}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 0,

    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212'
    },
    loadingText: {
        color: '#9F7CFA',
        marginTop: 16
    },
    filterContainer: {
        flexDirection: 'row',
        gap: 10
    },
    filterChip: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#2D2D2D',
        borderWidth: 1,
        borderColor: '#3D3D3D'
    },
    filterChipActive: {
        backgroundColor: 'rgba(159, 124, 250, 0.2)',
        borderColor: '#9F7CFA'
    },
    filterText: {
        color: '#A59EC0',
        fontSize: 14,
        fontWeight: '500'
    },
    filterTextActive: {
        color: '#9F7CFA',
        fontWeight: 'bold'
    },
    listContainer: {
        padding: 5,
    },
    emptyContainer: {
        marginTop: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    emptyText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold'
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#9F7CFA',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5
    },
    fabIcon: {
        fontSize: 32,
        color: '#FFFFFF',
        lineHeight: 34
    },
    logoutFab: {
        position: 'absolute',
        bottom: 30,
        right: 105, // Posicionado à esquerda do FAB principal (60 largura + 30 direita + 15 de gap)
        backgroundColor: '#2D2D2D',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        borderWidth: 1,
        borderColor: '#3D3D3D'
    },
    logoutIcon: {
        fontSize: 24,
        color: '#FFFFFF'
    }
});