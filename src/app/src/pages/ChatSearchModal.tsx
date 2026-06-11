import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Modal,
    SafeAreaView
} from 'react-native';
import { ArrowLeft, Search, CalendarDays } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

interface ChatSearchModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectMessage: (conversacaoId: string, messageId: string) => void;
}

export default function ChatSearchModal({ visible, onClose, onSelectMessage }: ChatSearchModalProps) {
    const { theme } = useTheme();

    // Dados mocados para visualização inicial
    const mockResults = [
        {
            id: '1',
            conversacaoId: 'c1',
            conversacaoTitulo: 'Nova Conversa',
            texto: 'Como implementar inteligência artificial em React Native?',
            data: '10 de jun.'
        },
        {
            id: '2',
            conversacaoId: 'c2',
            conversacaoTitulo: 'Estudos de IA',
            texto: 'Qual é o melhor modelo de IA para geração de texto local?',
            data: '8 de jun.'
        }
    ];

    const renderResult = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.resultItem, { borderBottomColor: theme.colors.border }]}
            onPress={() => onSelectMessage(item.conversacaoId, item.id)}
        >
            <Text style={[styles.conversacaoTitulo, { color: theme.colors.primary }]}>{item.conversacaoTitulo}</Text>
            <Text style={[styles.texto, { color: theme.colors.text }]} numberOfLines={2}>
                {item.texto}
            </Text>
            <View style={styles.dataContainer}>
                <CalendarDays color={theme.colors.textSecondary} size={14} />
                <Text style={[styles.dataTexto, { color: theme.colors.textSecondary }]}>{item.data}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} onRequestClose={onClose} animationType="slide">
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.surface }]}>
                {/* Header com Busca */}
                <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                        <ArrowLeft color={theme.colors.text} size={28} />
                    </TouchableOpacity>
                    <View style={[styles.searchContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <Search color={theme.colors.textSecondary} size={20} style={styles.searchIcon} />
                        <TextInput
                            style={[styles.searchInput, { color: theme.colors.text }]}
                            placeholder="Pesquisar em conversas..."
                            placeholderTextColor={theme.colors.textSecondary}
                            autoFocus
                        />
                    </View>
                </View>

                {/* Lista de Resultados */}
                <FlatList
                    data={mockResults}
                    keyExtractor={(item) => item.id}
                    renderItem={renderResult}
                    contentContainerStyle={styles.listContainer}
                    ListHeaderComponent={
                        <Text style={[styles.resultsHeader, { color: theme.colors.textSecondary }]}>
                            Resultados correspondentes
                        </Text>
                    }
                />
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        paddingHorizontal: 12,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    listContainer: {
        paddingBottom: 24,
    },
    resultsHeader: {
        fontSize: 14,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontWeight: '500',
    },
    resultItem: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    conversacaoTitulo: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    texto: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 8,
    },
    dataContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dataTexto: {
        fontSize: 12,
        marginLeft: 4,
    },
});
