// Informações simples da tarefa, para ser exibido em lista ou calendário
import React from 'react';
import { View, Text as TextRN, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Line, Rect, Text as TextSVG, G } from 'react-native-svg';
import { Tarefa } from '../types/tarefa.ts';
import { get } from 'react-native/Libraries/NativeComponent/NativeComponentRegistry';
import { useTheme } from '../theme/ThemeContext.tsx';

type Props = {
    tarefa: Tarefa;
    onPress?: (tarefa: Tarefa) => void;
    basewidth?: number;
    baseheight?: number;
};

/**
 * Componente para exibir as informações básicas de uma tarefa
 * @param tarefa A tarefa a ser exibida
 * @param onPress Função a ser chamada ao clicar na tarefa. Normalmente usada para abrir os detalhes da tarefa. Retorna a própria tarefa.
 */
export default function SubTarefaMinimal({ tarefa, onPress }: Props) {
    const { theme } = useTheme();

    const onPressMiddleMan = () => {
        if (onPress) onPress(tarefa);
    };

    // Função auxiliar para definir as cores e o texto da etiqueta (badge) baseada no estado
    const getEstadoConfig = (estado: string) => {
        switch (estado) {
            case 'EmProgresso':
                return { bg: 'rgba(159, 124, 250, 0.2)', text: theme.colors.primary, label: 'Em Progresso' };
            case 'Finalizado':
                return { bg: 'rgba(76, 175, 80, 0.2)', text: theme.colors.success, label: 'Concluída' };
            case 'NaoIniciado':
            default:
                return { bg: '#2D2D2D', text: theme.colors.textSecondary, label: 'A Fazer' };
        }
    };

    const estadoConfig = getEstadoConfig(tarefa.estado);

    return (
        <TouchableOpacity onPress={onPressMiddleMan} activeOpacity={0.7}>
            <View style={[styles.card, tarefa.estado === 'Finalizado' && styles.cardFinalizado]}>

                {/* Título e Status */}
                <View style={styles.header}>
                    <TextRN
                        style={[styles.title, tarefa.estado === 'Finalizado' && styles.textStrikethrough]}
                        numberOfLines={1}>
                        {tarefa.titulo}
                    </TextRN>

                    <View style={[styles.badge, { backgroundColor: estadoConfig.bg }]}>
                        <TextRN style={[styles.badgeText, { color: estadoConfig.text }]}>
                            {estadoConfig.label}
                        </TextRN>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export function SubTarefaMinimalSVG({ tarefa, onPress, basewidth, baseheight }: Props) {
    const { theme } = useTheme();

    const width = basewidth ?? 120;
    const height = baseheight ?? 50;

    const onPressMiddleMan = () => {
        if (onPress) onPress(tarefa);
    };

    // Função auxiliar para definir as cores e o texto da etiqueta (badge) baseada no estado
    const getStyle = (Type: string) => {
        switch (Type) {
            case 'StateColor':
                switch (tarefa.estado) {
                    case 'EmProgresso':
                        return theme.colors.primary;
                    case 'Finalizado':
                        return theme.colors.success;
                    default:
                        return theme.colors.textSecondary;
                }
            default:
                return;
        }

    };

    //const estadoConfig = getEstadoConfig(tarefa.estado);

    return (
        <>
            <G onPress={onPressMiddleMan}>
                <Rect width={width} height={height} rx={8} ry={8} fill="#1E1E1E" stroke={getStyle('StateColor')} strokeWidth={2} />

                {/* Título e Status */}
                <G style={styles.header}>
                    <TextSVG
                        x={width/2} y={height*0.6} fill={getStyle('StateColor')} textAnchor="middle" alignmentBaseline="middle">
                        {tarefa.titulo}
                    </TextSVG>
                </G>
            </G>
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 6,
        padding: 8,
        marginBottom: 6,
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