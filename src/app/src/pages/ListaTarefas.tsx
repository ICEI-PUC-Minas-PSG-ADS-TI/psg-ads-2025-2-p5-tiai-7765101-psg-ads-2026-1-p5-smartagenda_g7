import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, DeviceEventEmitter } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Componentes
import TarefaList from '../components/TarefaList';
import TaskManager from '../components/TaskManager';
import TarefaFilter, { FiltroEstado, aplicarFiltros } from '../components/TarefaFilter';
import { useTheme } from '../theme/ThemeContext';

// Serviços e Tipos
import { Tarefa } from '../types/tarefa.ts';
import { FilterSubTarefasArray, OrdenarTarefas, RefreshNotifications } from '../services/TarefaService';
import { TrySalvarTarefa, TryCarregarTarefasArray } from '../services/SaveControlService';

export default function ListaTarefas() {
    const { theme } = useTheme();
    const [tarefas, setTarefas] = useState<Tarefa[]>([]);
    const [selectedState, setSelectedState] = useState<FiltroEstado>('Todas');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [carregando, setCarregando] = useState(true);
    const firstLoad = useRef(true);

    const [isCreating, setIsCreating] = useState(false);
    const unsavedChanges = useRef(false);

    const carregarTarefas = useCallback(async () => {
        try {
            setCarregando(true);
            console.log("Carregando tarefas...");
            const tarefasCarregadas = await TryCarregarTarefasArray();
            if (!tarefasCarregadas) {
                console.log("[ListaTarefas] ATENÇÃO: Nenhuma tarefa encontrada, ou ocorreu um erro.");
                setTarefas([]);
            }
            else setTarefas(OrdenarTarefas(await FilterSubTarefasArray(tarefasCarregadas, true)));
            await RefreshNotifications();
            console.log("Tarefas carregadas: ", tarefasCarregadas.length);

        } catch (error) {
            console.log("[ListaTarefas] ATENÇÃO: Ocorreu um erro ao carregar as tarefas: " + error);
            setTarefas([]);
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarTarefas();
    }, [])

    useEffect(() => {
        //console.log("'tarefasUpdated' listener added");  
        carregarTarefas();      
        const subscription = DeviceEventEmitter.addListener('tarefasUpdated', () => { console.log("Evento 'tarefasUpdated' recebido"); carregarTarefas() });
        return () => { /*console.log("'tarefasUpdated' listener removed");*/ subscription.remove() };
    }, []);

    //const isLogged = !!auth().currentUser;

    /*const handleAuthAction = useCallback(async () => {
        if (isLogged) {
            await auth().signOut();
            DeviceEventEmitter.emit('tarefasUpdated'); // Recarregar após deslogar
        } else {
            DeviceEventEmitter.emit('showLogin');
        }
    }, [isLogged]);*/

    const handleCreateNew = useCallback(() => {
        setIsCreating(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsCreating(false);
    }, [isCreating]);

    const handleSaveTask = useCallback(async (result?: Tarefa) => { // deprecated
        handleCloseModal();
    }, []);

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
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.primary }]}>Carregando tarefas...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={theme.type === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />

            {isCreating && (
                <TaskManager tarefa={null} onClose={() =>handleSaveTask()} newTask={isCreating} onUnsavedChanges={(e) => unsavedChanges.current = e} />
            )}

            <TarefaList
                tarefas={tarefasFiltradas}
                onRefresh={carregarTarefas}
                ListHeaderComponent={
                    <View style={styles.headerContainer}>
                        <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
                            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Minhas Tarefas</Text>
                            <Text style={[styles.headerSubtitle, { color: theme.colors.primary }]}>
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

            {/* Botão de Login/Logout 
            <TouchableOpacity style={styles.logoutFab} onPress={handleAuthAction} activeOpacity={0.8}>
                {isLogged ? (
                    <Icon
                        name="logout"
                        size={24}
                        color="#ffffffff"
                        style={styles.logoutIcon}
                    />
                ) : (
                    <Icon
                        name="person"
                        size={24}
                        color="#000"
                        style={styles.logoutIcon}
                    />
                )}
            </TouchableOpacity>*/}

            {/* Botão de criar tarefa */}
            <TouchableOpacity style={[styles.fab, { backgroundColor: theme.colors.primary }]} onPress={handleCreateNew} activeOpacity={0.8}>
                <Icon
                    name="add"
                    size={28}
                    color="#ffffff"
                    style={styles.fabIcon}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
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
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5
    },
    fabIcon: {
        fontSize: 32,
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