import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, StatusBar, ActivityIndicator, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

// Componentes
import TarefaList from '../components/TarefaList';
import TaskManager from '../components/TaskManager';

// Serviços e Tipos
import { Tarefa } from '../types/tarefa.ts';
import { FilterSubTarefasArray, OrdenarTarefas } from '../services/TarefaService';
import { TrySalvarTarefa, TryCarregarTarefasArray } from '../services/SaveControlService';

type FiltroTipo = 'Todas' | 'Pendentes' | 'Concluídas';
type ModalMode = 'none' | 'details' | 'edit';

export default function ListaTarefas() {
    const [tarefas, setTarefas] = useState<Tarefa[]>([]);
    const [filtroAtivo, setFiltroAtivo] = useState<FiltroTipo>('Todas');
    const [carregando, setCarregando] = useState(true);

    const [isCreating, setIsCreating] = useState(false);
    const unsavedChanges = useRef(false); 

    const carregarTarefas = useCallback(async () => {
        try {
            setCarregando(true);
            const user = auth().currentUser;
            if (!user) return;

            const tarefasCarregadas = await TryCarregarTarefasArray();
            if (!tarefasCarregadas) {
                console.log("[ListaTarefas] ATENÇÃO: Nenhuma tarefa encontrada no Firestore ou localmente, ou ocorreu um erro.");
                setTarefas([]);
            }
            else setTarefas(OrdenarTarefas(await FilterSubTarefasArray(tarefasCarregadas, true)));

        } catch (error) {
            console.log("[ListaTarefas] ATENÇÃO: Ocorreu um erro ao carregar as tarefas: " + error);
            setTarefas([]);
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

    const handleCreateNew = useCallback(() => {
        setIsCreating(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        if (isCreating && unsavedChanges.current) {
            console.log("Unsaved changes");
            Alert.alert(
                'Tem certeza que deseja cancelar a criação da tarefa?',
                `Todas as alterações não salvas serão perdidas.`,
                [
                    { text: 'Não', style: 'cancel' },
                    {
                        text: 'Sim, sair sem salvar', onPress: () => {
                            unsavedChanges.current = false;
                            setIsCreating(false);
                        }
                    }
                ]
            );
            return;
        }
        unsavedChanges.current = false;
        setIsCreating(false);
    }, [isCreating, unsavedChanges.current]);

    const handleSaveTask = useCallback(async (result?: Tarefa) => {
        if (result) {
            try {
                let atualizadas = await TrySalvarTarefa(result);
                if (atualizadas.length > 0) {
                    setTarefas((OrdenarTarefas(await FilterSubTarefasArray(atualizadas, true))));
                }
                else { console.log("ATENÇÃO: Lista de tarefas vazia após tentativa de salvamento."); }
            } catch (error) { console.log("ERRO ao salvar tarefa: " + error); }
        }
        else
        {
            // call for refresh
            try{
                const atualizadas = await TryCarregarTarefasArray();
                if (atualizadas) {
                    setTarefas(OrdenarTarefas(await FilterSubTarefasArray(atualizadas, true)));
                }
                else { console.log("ATENÇÃO: Lista de tarefas vazia após tentativa de recarregamento."); }
            }
            catch (e) { console.log("ERRO ao recarregar tarefas após tentativa de salvamento: " + e); }
        }
        unsavedChanges.current = false;
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

            <Modal visible={isCreating} transparent={true} animationType="slide" onRequestClose={handleCloseModal}>
                {isCreating && (
                    <TaskManager tarefa={null} onClose={handleSaveTask} onUnsavedChanges={(e) => unsavedChanges.current = e} />
                )}
            </Modal>

            <TarefaList
                tarefas={tarefasFiltradas}
                onRefresh={carregarTarefas}
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