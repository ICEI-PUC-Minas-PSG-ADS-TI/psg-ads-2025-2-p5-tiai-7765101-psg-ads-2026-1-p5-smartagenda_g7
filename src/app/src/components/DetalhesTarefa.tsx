// Todos os Detalhes das Tarefas. Podendo ser usado como Modal ou Página

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Tarefa } from '../types/tarefa.ts';
import { TrySalvarTarefa } from '../services/SaveControlService.ts';
import StorageAPI, { TryGetTarefa } from '../services/LocalStorageService.ts';
import { SyncState } from '../services/TarefaService.ts';

type Props = {
    tarefa: Tarefa;
    onClose: () => void; // Para fechar o modal e voltar à lista
    onEdit: (tarefa: Tarefa) => void; // Para abrir o TaskManager
    onComplete: (tarefa: Tarefa) => void; // Para salvar o novo estado
}

export default function TarefaDetalhes({ tarefa, onClose, onEdit, onComplete }: Props) {

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
            await TrySalvarTarefa(parent, true);
        }
        else {
            await TrySalvarTarefa(updated, true);
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

    const dataVencimento = tarefa.data_vencimento
        ? new Date(tarefa.data_vencimento).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })
        : 'Sem prazo estipulado';

    const dataCriacao = new Date(tarefa.data_criado).toLocaleDateString();

    const isFinalizada = tarefa.estado === "Finalizado";

    return (
        <View style={styles.overlay}>
            <View style={styles.container}>

                {/* Cabeçalho do Modal */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Detalhes da Tarefa</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>X</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    {/* Status Badge */}
                    <View style={styles.statusContainer}>
                        <Text style={[styles.statusBadge, isFinalizada ? styles.statusFinalizado : styles.statusPendente]}>
                            {isFinalizada ? 'CONCLUÍDA' : (tarefa.estado === 'EmProgresso' ? 'EM PROGRESSO' : 'A FAZER')}
                        </Text>
                    </View>

                    <Text style={styles.titulo}>{tarefa.titulo}</Text>

                    <View style={styles.dateBox}>
                        <Text style={styles.dateLabel}>🗓 Vence em:</Text>
                        <Text style={styles.dateValue}>{dataVencimento}</Text>
                    </View>

                    <Text style={styles.sectionTitle}>Descrição</Text>
                    <Text style={styles.descricao}>
                        {tarefa.descricao_geral ? tarefa.descricao_geral : 'Nenhuma descrição fornecida para esta tarefa.'}
                    </Text>

                    <Text style={styles.footerInfo}>Criada em {dataCriacao}</Text>
                </ScrollView>

                {/* Botões de Ação */}
                <View style={styles.actionContainer}>
                    {!isFinalizada && (
                        <TouchableOpacity style={styles.btnConcluir} onPress={handleConcluir}>
                            <Text style={styles.btnConcluirText}>✔ Marcar como Concluída</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.btnEditar} onPress={() => onEdit(tarefa)}>
                        <Text style={styles.btnEditarText}>✏️ Editar Tarefa</Text>
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
        backgroundColor: '#1E1E1E',
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
        color: '#FFFFFF',
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#2D2D2D',
        borderRadius: 20,
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        color: '#FFFFFF',
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
        backgroundColor: 'rgba(159, 124, 250, 0.2)',
        color: '#9F7CFA',
    },
    titulo: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 20,
    },
    dateBox: {
        backgroundColor: '#2D2D2D',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: '#9F7CFA',
    },
    dateLabel: {
        fontSize: 14,
        color: '#A59EC0',
        marginBottom: 4,
    },
    dateValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 10,
    },
    descricao: {
        fontSize: 16,
        color: '#D1D1D1',
        lineHeight: 24,
        marginBottom: 30,
    },
    footerInfo: {
        fontSize: 12,
        color: '#666666',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    actionContainer: {
        marginTop: 10,
        gap: 12,
    },
    btnConcluir: {
        backgroundColor: '#4CAF50', // Verde para conclusão
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
        backgroundColor: '#2D2D2D',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#3D3D3D',
    },
    btnEditarText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    }
});