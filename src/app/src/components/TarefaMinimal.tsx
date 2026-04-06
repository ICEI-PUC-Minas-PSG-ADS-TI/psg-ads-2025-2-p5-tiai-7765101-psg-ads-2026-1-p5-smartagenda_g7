// Informações simples da tarefa, para ser exibido em lista ou calendário
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Tarefa } from '../types/tarefa.ts';

type Props = {
    tarefa: Tarefa;
    onPress?: (tarefa: Tarefa) => void;
};

/**
 * Componente para exibir as informações básicas de uma tarefa
 * @param tarefa A tarefa a ser exibida
 * @param onPress Função a ser chamada ao clicar na tarefa. Normalmente usada para abrir os detalhes da tarefa. Retorna a própria tarefa.
 */
export default function TarefaMinimal({ tarefa, onPress }: Props) {

    const onPressMiddleMan = () => {
        if (onPress) onPress(tarefa);
    };

    // Função auxiliar para definir as cores e o texto da etiqueta (badge) baseada no estado
    const getEstadoConfig = (estado: string) => {
        switch (estado) {
            case 'EmProgresso':
                return { bg: 'rgba(159, 124, 250, 0.2)', text: '#9F7CFA', label: 'Em Progresso' };
            case 'Finalizado':
                return { bg: 'rgba(76, 175, 80, 0.2)', text: '#4CAF50', label: 'Concluída' };
            case 'NaoIniciado':
            default:
                return { bg: '#2D2D2D', text: '#A59EC0', label: 'A Fazer' };
        }
    };

    const estadoConfig = getEstadoConfig(tarefa.estado);
    
    // Formata a data de uma maneira mais limpa (ex: 05/04/2026 14:30)
    const dataFormatada = tarefa.data_vencimento 
        ? new Date(tarefa.data_vencimento).toLocaleDateString([], { 
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
          })
        : 'Sem prazo estipulado';

    return (
        <TouchableOpacity onPress={onPressMiddleMan} activeOpacity={0.7}>
            <View style={[styles.card, tarefa.estado === 'Finalizado' && styles.cardFinalizado]}>
                
                {/* Título e Status */}
                <View style={styles.header}>
                    <Text 
                        style={[styles.title, tarefa.estado === 'Finalizado' && styles.textStrikethrough]} 
                        numberOfLines={1}>
                        {tarefa.titulo}
                    </Text>
                    
                    <View style={[styles.badge, { backgroundColor: estadoConfig.bg }]}>
                        <Text style={[styles.badgeText, { color: estadoConfig.text }]}>
                            {estadoConfig.label}
                        </Text>
                    </View>
                </View>

                {/* Descrição */}
                {tarefa.descricao_geral ? (
                    <Text style={styles.description} numberOfLines={2}>
                        {tarefa.descricao_geral}
                    </Text>
                ) : null}

                {/* Data */}
                <View style={styles.footer}>
                    <Text style={styles.dateText}>
                        Vence em: {dataFormatada}
                    </Text>
                </View>
                
            </View>
        </TouchableOpacity> 
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2D2D2D',
        elevation: 2, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    cardFinalizado: {
        borderColor: '#18381A', // Borda pouco esverdeada
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        flex: 1,
        marginRight: 10,
    },
    textStrikethrough: {
        textDecorationLine: 'line-through',
        color: '#888888',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    description: {
        fontSize: 14,
        color: '#A59EC0', // Roxo meio cinza
        marginBottom: 12,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#2D2D2D',
        paddingTop: 12,
        marginTop: 4,
    },
    dateText: {
        fontSize: 13,
        color: '#cacaca',
        fontWeight: '500',
    }
});