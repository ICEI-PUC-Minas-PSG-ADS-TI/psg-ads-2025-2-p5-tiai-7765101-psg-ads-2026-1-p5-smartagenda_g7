// Informações simples da tarefa, para ser exibido em lista ou calendário
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Tarefa } from '../types/tarefa.ts';
import { useTheme } from '../theme/ThemeContext';

type Props = {
    tarefa: Tarefa;
    onPress?: (tarefa: Tarefa) => void;
    small?: boolean;
    showDate?: boolean;
};

/**
 * Componente para exibir as informações básicas de uma tarefa
 * @param tarefa A tarefa a ser exibida
 * @param onPress Função a ser chamada ao clicar na tarefa. Normalmente usada para abrir os detalhes da tarefa. Retorna a própria tarefa.
 */
export default function TarefaMinimal({ tarefa, onPress, small, showDate }: Props) {
    const { theme } = useTheme();

    const onPressMiddleMan = () => {
        if (onPress) onPress(tarefa);
    };

    // Função auxiliar para definir as cores e o texto da etiqueta (badge) baseada no estado
    const getEstadoConfig = (estado: string) => {
        switch (estado) {
            case 'EmProgresso':
                return { bg: `${theme.colors.primary}33`, text: theme.colors.primary, label: 'Em Progresso' };
            case 'Finalizado':
                return { bg: `${theme.colors.success}33`, text: theme.colors.success, label: 'Concluída' };
            case 'NaoIniciado':
            default:
                return { bg: theme.colors.surfaceVariant, text: theme.colors.textSecondary, label: 'A Fazer' };
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
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, tarefa.estado === 'Finalizado' && { borderColor: theme.colors.success }]}>
                
                {/* Título e Status */}
                <View style={styles.header}>
                    <Text 
                        style={[styles.title, { color: theme.colors.text }, tarefa.estado === 'Finalizado' && { textDecorationLine: 'line-through', color: theme.colors.textSecondary }]} 
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
                    <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                        {tarefa.descricao_geral}
                    </Text>
                ) : null}

                {/* Data */}
                <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
                    <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
                        Vence em: {dataFormatada}
                    </Text>
                </View>
                
            </View>
        </TouchableOpacity> 
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        elevation: 2, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
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
        flex: 1,
        marginRight: 10,
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
        marginBottom: 12,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        paddingTop: 12,
        marginTop: 4,
    },
    dateText: {
        fontSize: 13,
        fontWeight: '500',
    }
});