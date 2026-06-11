// Todos os Detalhes das Tarefas. Podendo ser usado como Modal ou Página

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Tarefa } from '../types/tarefa.ts';
import { TrySalvarTarefa } from '../services/SaveControlService.ts';
import StorageAPI, { TryGetTarefa } from '../services/LocalStorageService.ts';
import { SyncState, GetSubtarefas } from '../services/TarefaService.ts';
import { useTheme } from '../theme/ThemeContext';
import {TarefaListSafe} from '../components/TarefaList.tsx';

type Props = {
    Tarefa: Tarefa;
    onClose: () => void; // Para fechar o modal e voltar à lista
    onEdit: (tarefa: Tarefa) => void; // Para abrir o TaskManager
    onComplete: (tarefa: Tarefa) => void; // Para salvar o novo estado
}

export default function TarefaDetalhes({ Tarefa, onClose, onEdit, onComplete }: Props) {
    const { theme } = useTheme();

    const [tarefa, setTarefa] = useState<Tarefa>(Tarefa);
    const [Subtasks, setSubtasks] = useState<Tarefa[]>([]);
    const [SelectedSubtask, setSelectedSubtask] = useState<Tarefa | null>(null);

    useEffect(() => {
        const getallsubtasks = async () => {
            let subtasks = await GetSubtarefas(tarefa);
            console.log("updated with ", subtasks?.length, " subtasks");
            if (subtasks && subtasks.length > 0) setSubtasks(subtasks);
        }
        getallsubtasks();
    }, [tarefa]);

    const onCompleteInner = async (task: Tarefa) => {
        let updated = { ...task };
        let parent: Tarefa | null = null;
        if (updated.parentId) {
            parent = await TryGetTarefa(updated.parentId!);
        }
        if (parent) {
            updated.parentId = parent.id;
            if (parent.subtarefas) {
                let included = false;
                for (const sid of parent.subtarefas) {
                    if (sid === updated.id) {
                        included = true; break;
                    }
                }
                if (!included) {
                    parent.subtarefas.push(updated.id);
                }
            }
            else parent.subtarefas = [updated.id];
            await StorageAPI.SalvarTarefa(updated);
            await SyncState(parent);

            await TrySalvarTarefa(updated);
            await TrySalvarTarefa(parent, false);
        }
        else {
            await TrySalvarTarefa(updated, false);
        }

        onComplete(updated);
    }

    const handleConcluir = () => {
        Alert.alert(
            "Concluir Tarefa",
            `Tem certeza que deseja marcar "${tarefa.titulo}" como concluída?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Sim, concluir!",
                    style: "default",
                    onPress: () => {
                        const tarefaAtualizada = { ...tarefa, data_finalizado: Date.now(), estado: "Finalizado" as const };
                        onCompleteInner(tarefaAtualizada);
                    }
                }
            ]
        );
    };

    const RefreshCurrent = async () => {
        let toupdate = await TryGetTarefa(tarefa.id);
        setTarefa(toupdate || tarefa);
        let subtasks = await GetSubtarefas(toupdate || tarefa);
        setSubtasks(subtasks || []);
    }

    const GetDaysLeft = () => {
        const now = Date.now();
        return '(' + Math.ceil((tarefa.data_vencimento - now) / (1000 * 60 * 60 * 24)) + " dias restantes)";
    }

    return (
        <View style={styles.overlay}>
            <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>

                {/* Cabeçalho do Modal */}
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Detalhes da Tarefa</Text>
                    <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <Text style={[styles.closeButtonText, { color: theme.colors.text }]}>X</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    {/* Status Badge */}
                    <View style={styles.statusContainer}>
                        <Text style={[styles.statusBadge, tarefa.estado === "Finalizado" ? styles.statusFinalizado : { backgroundColor: `${theme.colors.primary}33`, color: theme.colors.primary }]}>
                            {tarefa.estado === "Finalizado" ? 'CONCLUÍDA' : (tarefa.estado === 'EmProgresso' ? 'EM PROGRESSO' : 'A FAZER')}
                        </Text>
                    </View>

                    <Text style={[styles.titulo, { color: theme.colors.text }]}>{tarefa.titulo}</Text>

                    <View style={[styles.dateBox, { backgroundColor: theme.colors.surfaceVariant, borderLeftColor: tarefa.estado === "Finalizado" ? theme.colors.success : theme.colors.primary}]}>
                        {tarefa.estado === "Finalizado" ? (
                            <View>
                                <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>🗓 Finalizado em:</Text>
                        <Text style={[styles.dateValue, { color: theme.colors.text }]}>{new Date(tarefa.data_finalizado!).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}</Text>
                            </View>
                        ):(
                            <View>
                                <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>🗓 Vence em:</Text>
                            <Text style={[styles.dateValue, { color: theme.colors.text }]}>{new Date(tarefa.data_vencimento).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}</Text>
                            <Text style={[styles.dateValue, {color: theme.colors.textSecondary}]}> {GetDaysLeft()} </Text>
                            </View>
                        )}
                        
                    </View>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Descrição</Text>
                    <Text style={[styles.descricao, { color: theme.colors.text }]}>
                        {tarefa.descricao_geral ? tarefa.descricao_geral : 'Nenhuma descrição fornecida para esta tarefa.'}
                    </Text>

                    <Text style={[styles.footerInfo, { color: theme.colors.textSecondary }]}>Criada em {new Date(tarefa.data_criado).toLocaleDateString()}</Text>

                    {Subtasks.length > 0 && (
                        <View>
                            <Text style={{ color: theme.colors.text }}>
                                Sub-Tarefas: ({Subtasks.length})
                            </Text>
                            <View >
                                <TarefaListSafe parent={tarefa} tarefas={Subtasks} onRefresh={() => {RefreshCurrent()}} subtaskStyling={true} />
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Botões de Ação */}
                <View style={styles.actionContainer}>
                    {tarefa.estado !== "Finalizado" && (
                        <TouchableOpacity style={[styles.btnConcluir, { backgroundColor: theme.colors.success }]} onPress={handleConcluir}>
                            <Text style={styles.btnConcluirText}>✔ Marcar como Concluída</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={[styles.btnEditar, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]} onPress={() => onEdit(tarefa)}>
                        <Text style={[styles.btnEditarText, { color: theme.colors.text }]}>✏️ Editar Tarefa</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '85%',
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    content: {
        flex: 1,
    },
    statusContainer: {
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        overflow: 'hidden',
    },
    statusFinalizado: {
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        color: '#4CAF50',
    },
    statusPendente: {
    },
    titulo: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    dateBox: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderLeftWidth: 4,
    },
    dateLabel: {
        fontSize: 14,
        marginBottom: 4,
    },
    dateValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    descricao: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 30,
    },
    footerInfo: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    actionContainer: {
        marginTop: 10,
        gap: 12,
    },
    btnConcluir: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    btnConcluirText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    btnEditar: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
    },
    btnEditarText: {
        fontSize: 16,
        fontWeight: 'bold',
    }
});