import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';

// Componentes
import TarefaMinimal from '../components/TarefaMinimal';
import TaskManager from '../components/TaskManager';
import TarefaDetalhes from '../components/DetalhesTarefa';

// Serviços e Tipos
import { Tarefa } from '../types/tarefa.ts';
import StorageAPI from '../services/LocalStorageService';
import { buscarTarefasFirestore, salvarTarefaFirestore } from '../services/FirestoreService';

type FiltroTipo = 'Todas' | 'Pendentes' | 'Concluídas';
type ModalMode = 'none' | 'details' | 'edit';

const ordenarTarefas = (lista: Tarefa[]) => {
    return lista.sort((a, b) => {
        if (!a.data_vencimento) return 1;
        if (!b.data_vencimento) return -1;
        return a.data_vencimento - b.data_vencimento;
    });
};

export default function ListaTarefas() {
    const [tarefas, setTarefas] = useState<Tarefa[]>([]);
    const [filtroAtivo, setFiltroAtivo] = useState<FiltroTipo>('Todas');
    const [carregando, setCarregando] = useState(true);
    
    const [selectedTask, setSelectedTask] = useState<Tarefa | null>(null);
    const [modalMode, setModalMode] = useState<ModalMode>('none');

    const carregarTarefas = useCallback(async () => {
        try {
            setCarregando(true);
            const user = auth().currentUser;
            if (!user) return;

            const tarefasDoFirebase = await buscarTarefasFirestore();
            
            if (tarefasDoFirebase && tarefasDoFirebase.length > 0) {
                setTarefas(ordenarTarefas([...tarefasDoFirebase]));
                const tarefasMap: Record<string, Tarefa> = {};
                tarefasDoFirebase.forEach(t => { tarefasMap[t.id] = t; });
                await StorageAPI.SalvarTarefas(tarefasMap);
            } else {
                const tarefasLocais = await StorageAPI.CarregarTarefasArray() || [];
                if (tarefasLocais.length > 0) {
                    setTarefas(ordenarTarefas(tarefasLocais));
                }
            }
        } catch (error) {
            const tarefasLocais = await StorageAPI.CarregarTarefasArray() || [];
            setTarefas(ordenarTarefas(tarefasLocais));
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarTarefas();
    }, [carregarTarefas]);

    const handleLogout = useCallback(() => {
        auth().signOut();
    }, []);

    const handleOpenDetails = useCallback((tarefa: Tarefa) => {
        setSelectedTask(tarefa);
        setModalMode('details'); 
    }, []);

    const handleOpenEdit = useCallback((tarefa: Tarefa) => {
        setSelectedTask(tarefa);
        setModalMode('edit'); 
    }, []);

    const handleCreateNew = useCallback(() => {
        setSelectedTask(null);
        setModalMode('edit');
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedTask(null);
        setModalMode('none');
    }, []);

    const handleSaveTask = useCallback(async (result?: Tarefa) => {
        if (result) {
            try {
                const tarefasLocais = await StorageAPI.CarregarTarefas() || {};
                tarefasLocais[result.id] = result;
                await StorageAPI.SalvarTarefas(tarefasLocais);
                salvarTarefaFirestore(result).catch(() => {});
                const atualizadas = await StorageAPI.CarregarTarefasArray() || [];
                setTarefas(ordenarTarefas(atualizadas));
            } catch (error) {}
        }
        handleCloseModal();
    }, [handleCloseModal]);

    const tarefasFiltradas = useMemo(() => {
        return tarefas.filter(t => {
            if (filtroAtivo === 'Pendentes') return t.estado === 'NaoIniciado' || t.estado === 'EmProgresso';
            if (filtroAtivo === 'Concluídas') return t.estado === 'Finalizado';
            return true; 
        });
    }, [tarefas, filtroAtivo]);

    if (carregando) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9F7CFA" />
                <Text style={styles.loadingText}>Carregando tarefas...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Minhas Tarefas</Text>
                <Text style={styles.headerSubtitle}>
                    {tarefasFiltradas.length} {tarefasFiltradas.length === 1 ? 'tarefa listada' : 'tarefas listadas'}
                </Text>

                <View style={styles.filterContainer}>
                    {(['Todas', 'Pendentes', 'Concluídas'] as FiltroTipo[]).map((filtro) => (
                        <TouchableOpacity
                            key={filtro}
                            style={[styles.filterChip, filtroAtivo === filtro && styles.filterChipActive]}
                            onPress={() => setFiltroAtivo(filtro)}>
                            <Text style={[styles.filterText, filtroAtivo === filtro && styles.filterTextActive]}>{filtro}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <Modal visible={modalMode !== 'none'} transparent={true} animationType="slide" onRequestClose={handleCloseModal}>
                {modalMode === 'details' && selectedTask && (
                    <TarefaDetalhes tarefa={selectedTask} onClose={handleCloseModal} onEdit={handleOpenEdit} onComplete={handleSaveTask} />
                )}
                {modalMode === 'edit' && (
                    <TaskManager tarefa={selectedTask} onClose={handleSaveTask} />
                )}
            </Modal>

            <FlatList
                data={tarefasFiltradas}
                renderItem={({ item }) => <TarefaMinimal tarefa={item} onPress={handleOpenDetails} />}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nada por aqui ainda.</Text>
                    </View>
                )}
            />

            {/* Botão de Logout Rápido */}
            <TouchableOpacity style={styles.logoutFab} onPress={handleLogout} activeOpacity={0.8}>
                <Text style={styles.logoutIcon}>⎋</Text>
            </TouchableOpacity>

            {/* Botão de Adicionar (+) */}
            <TouchableOpacity style={styles.fab} onPress={handleCreateNew} activeOpacity={0.8}>
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#121212' 
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
    header: { 
        paddingTop: 40, 
        paddingHorizontal: 24, 
        paddingBottom: 15, 
        backgroundColor: '#1E1E1E', 
        borderBottomWidth: 1, 
        borderBottomColor: '#2D2D2D' 
    },
    headerTitle: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        color: '#FFFFFF' 
    },
    headerSubtitle: { 
        fontSize: 14, 
        color: '#9F7CFA', 
        marginTop: 4, 
        marginBottom: 16 
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