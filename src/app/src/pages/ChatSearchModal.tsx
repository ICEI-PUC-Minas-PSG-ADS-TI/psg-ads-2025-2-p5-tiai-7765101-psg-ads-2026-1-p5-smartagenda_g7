import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Modal,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, CalendarDays, User, Bot } from 'lucide-react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useTheme } from '../theme/ThemeContext';
import IAInteracaoService, { IAInteracao } from '../services/IAInteracaoService';

interface ChatSearchModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectMessage: (conversacaoId: string, messageId: string) => void;
}

export default function ChatSearchModal({ visible, onClose, onSelectMessage }: ChatSearchModalProps) {
    const { theme } = useTheme();
    const netInfo = useNetInfo();

    const [searchText, setSearchText] = useState('');
    const [allResults, setAllResults] = useState<(IAInteracao & { conversacaoTitulo: string })[]>([]);
    const [displayedResults, setDisplayedResults] = useState<(IAInteracao & { conversacaoTitulo: string })[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const PAGE_SIZE = 15;

    useEffect(() => {
        if (!visible) {
            setSearchText('');
            setAllResults([]);
            setDisplayedResults([]);
        }
    }, [visible]);

    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (searchText.trim().length === 0) {
            setAllResults([]);
            setDisplayedResults([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        debounceTimer.current = setTimeout(async () => {
            const isConnected = netInfo.isConnected ?? true;
            const res = await IAInteracaoService.PesquisarHistorico(searchText, isConnected);
            setAllResults(res);
            setDisplayedResults(res.slice(0, PAGE_SIZE));
            setIsLoading(false);
        }, 500);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [searchText, netInfo.isConnected]);

    const loadMore = () => {
        if (displayedResults.length < allResults.length) {
            const nextBatch = allResults.slice(displayedResults.length, displayedResults.length + PAGE_SIZE);
            setDisplayedResults([...displayedResults, ...nextBatch]);
        }
    };

    const renderResult = ({ item }: { item: IAInteracao & { conversacaoTitulo: string } }) => {
        const isUser = item.tipo === 'pergunta';
        const messageText = isUser ? item.prompt : item.resposta;
        const dateStr = new Date(item.dataInteracao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

        return (
            <TouchableOpacity
                style={[styles.resultItem, { borderBottomColor: theme.colors.border }]}
                onPress={() => item.conversacaoId && onSelectMessage(item.conversacaoId, item.id)}
            >
                <Text style={[styles.conversacaoTitulo, { color: theme.colors.primary }]}>{item.conversacaoTitulo}</Text>

                <View style={styles.messagePreviewContainer}>
                    {isUser ? (
                        <User color={theme.colors.textSecondary} size={16} style={styles.senderIcon} />
                    ) : (
                        <Bot color={theme.colors.primary} size={16} style={styles.senderIcon} />
                    )}
                    <Text style={[styles.texto, { color: theme.colors.text }]} numberOfLines={2}>
                        {messageText}
                    </Text>
                </View>

                <View style={styles.dataContainer}>
                    <CalendarDays color={theme.colors.textSecondary} size={14} />
                    <Text style={[styles.dataTexto, { color: theme.colors.textSecondary }]}>{dateStr}</Text>
                </View>
            </TouchableOpacity>
        );
    };

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
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>
                </View>

                {/* Lista de Resultados */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={displayedResults}
                        keyExtractor={(item) => item.id}
                        renderItem={renderResult}
                        contentContainerStyle={styles.listContainer}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.5}
                        ListHeaderComponent={
                            displayedResults.length > 0 ? (
                                <Text style={[styles.resultsHeader, { color: theme.colors.textSecondary }]}>
                                    {allResults.length} resultados correspondentes
                                </Text>
                            ) : null
                        }
                        ListEmptyComponent={
                            searchText.length > 0 ? (
                                <Text style={[styles.resultsHeader, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 20 }]}>
                                    Nenhum resultado encontrado.
                                </Text>
                            ) : null
                        }
                    />
                )}
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
        marginBottom: 8,
    },
    messagePreviewContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    senderIcon: {
        marginRight: 6,
        marginTop: 2,
    },
    texto: {
        fontSize: 16,
        lineHeight: 22,
        flex: 1,
    },
    dataContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dataTexto: {
        fontSize: 12,
        marginLeft: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
