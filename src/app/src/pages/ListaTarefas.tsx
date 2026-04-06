import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, StatusBar, ScrollView } from 'react-native';
import TarefaMinimal from '../components/TarefaMinimal';
import TaskManager from '../components/TaskManager';
import { Tarefa } from '../types/tarefa.ts';
import StorageAPI from '../services/LocalStorageService';
import { buscarTarefasFirestore } from '../services/FirestoreService';
import auth from '@react-native-firebase/auth';
import { ActivityIndicator } from 'react-native';

type FiltroTipo = 'Todas' | 'Pendentes' | 'Concluídas';

export default function ListaTarefas() {
    const [tarefas, setTarefas] = useState<Tarefa[]>([]);
    const [filtroAtivo, setFiltroAtivo] = useState<FiltroTipo>('Todas');
    const [selectedTask, setSelectedTask] = useState<Tarefa | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [carregando, setCarregando] = useState(true);

    // Ordenação otimizada aproveitando que data_vencimento já é milissegundos
    const ordenarTarefas = (lista: Tarefa[]) => {
        return lista.sort((a, b) => {
            if (!a.data_vencimento) return 1;
            if (!b.data_vencimento) return -1;
            return a.data_vencimento - b.data_vencimento;
        });
    };

    // Função para carregar tarefas existentes no Firebase
const carregarTarefas = async () => {
    try {
        setCarregando(true);
        console.log('🔄 Buscando tarefas do Firebase...');
        
        const user = auth().currentUser;
        if (!user) {
            console.log('⚠️ Usuário não logado');
            setCarregando(false);
            return;
        }

        const tarefasDoFirebase = await buscarTarefasFirestore();
        
        if (tarefasDoFirebase && tarefasDoFirebase.length > 0) {
            console.log('✅ Tarefas carregadas do Firebase:', tarefasDoFirebase.length);
            setTarefas(ordenarTarefas([...tarefasDoFirebase]));
            
            const tarefasMap: Record<string, Tarefa> = {};
            tarefasDoFirebase.forEach(t => {
                tarefasMap[t.id] = t;
            });
            await StorageAPI.SalvarTarefas(tarefasMap);
        } else {
            console.log('⚠️ Nenhuma tarefa no Firebase, buscando local...');
            const tarefasLocais = await StorageAPI.CarregarTarefasArray() || [];
            if (tarefasLocais.length > 0) {
                setTarefas(ordenarTarefas(tarefasLocais));
            }
        }
    } catch (error) {
        console.error('❌ Erro ao carregar tarefas:', error);
        const tarefasLocais = await StorageAPI.CarregarTarefasArray() || [];
        setTarefas(ordenarTarefas(tarefasLocais));
    } finally {
        setCarregando(false);
    }
};
   useEffect(() => {
    carregarTarefas();
}, []);

    const NewTask = () => {
        setSelectedTask(null);
        setIsModalOpen(true);
    };

    const EditTask = (tarefa: Tarefa) => {
        setSelectedTask(tarefa);
        setIsModalOpen(true);
    };

    const SaveEdited = async (result?: Tarefa) => {
    if (result) {
        await carregarTarefas(); // Recarrega tudo do Firebase
    }
    setSelectedTask(null);
    setIsModalOpen(false);
};

    // Aplica o filtro selecionado antes de renderizar a lista
    const tarefasFiltradas = tarefas.filter(t => {
        if (filtroAtivo === 'Pendentes') return t.estado === 'NaoIniciado' || t.estado === 'EmProgresso';
        if (filtroAtivo === 'Concluídas') return t.estado === 'Finalizado';
        return true; // 'Todas'
    });

    // Tela de carregamento
    if (carregando) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <StatusBar barStyle="light-content" backgroundColor="#121212" />
                <ActivityIndicator size="large" color="#9F7CFA" />
                <Text style={{ color: '#9F7CFA', marginTop: 16 }}>Carregando tarefas...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />

            {/* Cabeçalho */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Minhas Tarefas</Text>
                <Text style={styles.headerSubtitle}>
                    {tarefasFiltradas.length} {tarefasFiltradas.length === 1 ? 'tarefa listada' : 'tarefas listadas'}
                </Text>

                {/* Filtros */}
                <View style={styles.filterContainer}>
                    {(['Todas', 'Pendentes', 'Concluídas'] as FiltroTipo[]).map((filtro) => (
                        <TouchableOpacity
                            key={filtro}
                            style={[
                                styles.filterChip,
                                filtroAtivo === filtro && styles.filterChipActive
                            ]}
                            onPress={() => setFiltroAtivo(filtro)}>
                            <Text style={[
                                styles.filterText,
                                filtroAtivo === filtro && styles.filterTextActive
                            ]}>
                                {filtro}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {isModalOpen && (
                <Modal transparent={true} animationType="slide">
                    <TaskManager tarefa={selectedTask} onClose={SaveEdited} />
                </Modal>
            )}

            <FlatList
                data={tarefasFiltradas}
                renderItem={({ item }) => <TarefaMinimal tarefa={item} onPress={EditTask} />}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nada por aqui ainda.</Text>
                        <Text style={styles.emptySubtext}>
                            {filtroAtivo === 'Todas' ? 'Toque no + para começar a se organizar!' : `Nenhuma tarefa em "${filtroAtivo}".`}
                        </Text>
                    </View>
                )}
            />

            {/* Botão de adicionar tarefa */}
            <TouchableOpacity style={styles.fab} onPress={NewTask} activeOpacity={0.8}>
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        paddingTop: 40,
        paddingHorizontal: 24,
        paddingBottom: 15,
        backgroundColor: '#1E1E1E',
        borderBottomWidth: 1,
        borderBottomColor: '#2D2D2D',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#9F7CFA',
        marginTop: 4,
        marginBottom: 16,
    },
    filterContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    filterChip: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#2D2D2D',
        borderWidth: 1,
        borderColor: '#3D3D3D',
    },
    filterChipActive: {
        backgroundColor: 'rgba(159, 124, 250, 0.2)', // Fundo roxo
        borderColor: '#9F7CFA',
    },
    filterText: {
        color: '#A59EC0',
        fontSize: 14,
        fontWeight: '500',
    },
    filterTextActive: {
        color: '#9F7CFA',
        fontWeight: 'bold',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    emptyContainer: {
        marginTop: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptySubtext: {
        color: '#888888',
        fontSize: 14,
        marginTop: 8,
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
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    fabIcon: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: '300',
        lineHeight: 34,
    }
});