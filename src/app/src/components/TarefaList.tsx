import { Tarefa } from '../types/tarefa';
import TarefaDetalhes from './DetalhesTarefa';
import TaskManager from './TaskManager';
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Modal, Alert } from 'react-native';
import TarefaMinimal from './TarefaMinimal';
import { useTheme } from '../theme/ThemeContext';
import SubTarefaMinimal from './SubTarefaMinimal';

interface TarefaListProps {
    tarefas: Tarefa[];
    emptyMessage?: string;
    onRefresh?: () => void;
    ListHeaderComponent?: React.ReactElement | null;
    parent?: Tarefa;
    subtaskStyling?: boolean;
}

export type ModalMode = 'none' | 'details' | 'edit';

export const useTaskModals = (onRefresh?: () => void) => {
    const [selectedTask, setSelectedTask] = useState<Tarefa | null>(null);
    const [modalMode, setModalMode] = useState<ModalMode>('none');
    const unsavedChanges = useRef(false);
    const [blockrefresh, setBlockRefresh] = useState(false);

    const handleOpenDetails = useCallback((tarefa: Tarefa, blockRefresh?: boolean) => {
        setSelectedTask(tarefa);
        setModalMode('details');
        setBlockRefresh(!!blockRefresh);
    }, []);

    const handleOpenEdit = useCallback((tarefa: Tarefa, blockRefresh?: boolean) => {
        setSelectedTask(tarefa);
        setModalMode('edit');
        setBlockRefresh(!!blockRefresh);
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
                            setBlockRefresh(false);
                        }
                    }
                ]
            );
            return;
        }
        unsavedChanges.current = false;
        setSelectedTask(null);
        setModalMode('none');
        setBlockRefresh(false);
    }, [modalMode]);

    const handleSaveTask = useCallback(async (result?: Tarefa) => {
        /*if (result) {
            try {
                await TrySalvarTarefa(result);
            } catch (error) { console.log("ERRO ao salvar tarefa: " + error); }
        }*/

        if (onRefresh) onRefresh();

        unsavedChanges.current = false;
        setSelectedTask(null);
        setModalMode('none');
        setBlockRefresh(false);
    }, [onRefresh]);

    const modals = (
        <View>
            <Modal visible={modalMode !== 'none'} transparent={true} animationType="slide" onRequestClose={handleCloseModal}>
                {modalMode === 'details' && selectedTask && (
                    <TarefaDetalhes Tarefa={selectedTask} onClose={handleCloseModal} onEdit={handleOpenEdit} onComplete={handleSaveTask} />
                )}
            </Modal>
            {modalMode === 'edit' && selectedTask && (
                <TaskManager tarefa={selectedTask} onClose={() => handleSaveTask()} blockRefresh={blockrefresh} />
            )}
        </View>
    );

    return {
        handleOpenDetails,
        handleOpenEdit,
        modals
    };
};

const TarefaList: React.FC<TarefaListProps> = ({ tarefas, emptyMessage, onRefresh, ListHeaderComponent, parent, subtaskStyling }) => {
    const { handleOpenDetails, modals } = useTaskModals(onRefresh);
    const { theme } = useTheme();

    const renderitem = ({ item }: { item: Tarefa }) => {
        return subtaskStyling ? (<SubTarefaMinimal tarefa={item} onPress={handleOpenDetails} />) : <TarefaMinimal tarefa={item} onPress={handleOpenDetails} />
    };

    return (
        <>
            <FlatList
                data={tarefas}
                renderItem={({ item }) => renderitem({ item })}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ListHeaderComponent={ListHeaderComponent}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>{emptyMessage || 'Nada por aqui ainda.'}</Text>
                    </View>
                )}
            />
            {modals}
        </>
    );
};

export const TarefaListSafe: React.FC<TarefaListProps> = ({ tarefas, emptyMessage, onRefresh, ListHeaderComponent, subtaskStyling }) => {
    const { handleOpenDetails, modals } = useTaskModals(onRefresh);

    const rendercontent = ({ item }: { item: Tarefa }) => {
        return subtaskStyling ? (<SubTarefaMinimal tarefa={item} onPress={handleOpenDetails} />) : <TarefaMinimal tarefa={item} onPress={handleOpenDetails} />
    };

    const renderedItems =
        tarefas && tarefas.length > 0
            ? (tarefas.map(t => (
                <React.Fragment key={t.id}>
                    {rendercontent({ item: t })}
                </React.Fragment>
            )))
            : <Text>{emptyMessage || 'Nada por aqui ainda.'}</Text>;

    return (
        <>
            {ListHeaderComponent}
            {renderedItems}
            {modals}
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
        fontSize: 18,
        fontWeight: 'bold'
    }
});

export default TarefaList;
