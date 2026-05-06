import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, StatusBar, ActivityIndicator, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useFocusEffect } from '@react-navigation/native';

// Componentes
import TarefaList from '../components/TarefaList';
import TaskManager from '../components/TaskManager';
import TarefaFilter, { FiltroEstado, aplicarFiltros } from '../components/TarefaFilter';

// Serviços e Tipos
import { Tarefa } from '../types/tarefa.ts';
import { FilterSubTarefasArray, OrdenarTarefas } from '../services/TarefaService';
import { TrySalvarTarefa, TryCarregarTarefasArray } from '../services/SaveControlService';

export default function ListaTarefas() {
    const [tarefas, setTarefas] = useState<Tarefa[]>([]);
    const [selectedState, setSelectedState] = useState<FiltroEstado>('Todas');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [carregando, setCarregando] = useState(true);

    const [isCreating, setIsCreating] = useState(false);
    const unsavedChanges = useRef(false);

    const carregarTarefas = useCallback(async () => {
        try {
            setCarregando(true);
            const user = auth().currentUser;
            //if (!user) return;

            const tarefasCarregadas = await TryCarregarTarefasArray();
            if (!tarefasCarregadas) {
                console.log("[ListaTarefas] ATENÇÃO: Nenhuma tarefa encontrada, ou ocorreu um erro.");
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

    useFocusEffect(
        useCallback(() => {
            carregarTarefas();
        }, [carregarTarefas])
    );


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
        else {
            // call for refresh
            try {
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

    const categoriasDisponiveis = useMemo(() => {
        const cats = new Set<string>();
        tarefas.forEach(t => {
            if (t.categorias) t.categorias.forEach(c => cats.add(c));
        });
        return Array.from(cats);
    }, [tarefas]);

    const handleToggleCategory = useCallback((cat: string) => {
        setSelectedCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    }, []);

    const tarefasFiltradas = useMemo(() => {
        return aplicarFiltros(tarefas, selectedState, selectedCategories);
    }, [tarefas, selectedState, selectedCategories]);

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

            <Modal visible={isCreating} transparent={true} animationType="slide" onRequestClose={handleCloseModal}>
                {isCreating && (
                    <TaskManager tarefa={null} onClose={handleSaveTask} onUnsavedChanges={(e) => unsavedChanges.current = e} />
                )}
            </Modal>

            <TarefaList
                tarefas={tarefasFiltradas}
                onRefresh={carregarTarefas}
                ListHeaderComponent={
                    <View style={styles.headerContainer}>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Minhas Tarefas</Text>
                            <Text style={styles.headerSubtitle}>
                                {tarefasFiltradas.length} {tarefasFiltradas.length === 1 ? 'tarefa listada' : 'tarefas listadas'}
                            </Text>
                        </View>

                        <TarefaFilter
                            selectedState={selectedState}
                            selectedCategories={selectedCategories}
                            categoriasDisponiveis={categoriasDisponiveis}
                            onSelectState={setSelectedState}
                            onToggleCategory={handleToggleCategory}
                        />
                    </View>
                }
            />

            {/* Botão de Logout Rápido 
            <TouchableOpacity style={styles.logoutFab} onPress={handleLogout} activeOpacity={0.8}>
                <Text style={styles.logoutIcon}>⎋</Text>
            </TouchableOpacity>*/}

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
    headerContainer: {
        paddingBottom: 10,
        width: '100%'
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