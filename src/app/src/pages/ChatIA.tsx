import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ActivityIndicator
} from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { Sparkles, SquarePen, Search, Menu } from 'lucide-react-native';
import { useAIChat, Message } from '../hooks/useAIChat';
import { useTheme } from '../theme/ThemeContext';
import { CarregarConfiguracao } from '../services/LocalStorageService'

interface ConversationMock {
    id: string;
    title: string;
}

export default function ChatIA() {
    const { theme } = useTheme();
    const [inputText, setInputText] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [conversations, setConversations] = useState<ConversationMock[]>([
        { id: '1', title: 'Conversa Atual' }
    ]);
    const [activeConvId, setActiveConvId] = useState('1');

    const sortedConversations = [...conversations].sort((a, b) => parseInt(b.id) - parseInt(a.id));
    const filteredConversations = sortedConversations.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleNewConversation = () => {
        const newConv = { id: Date.now().toString(), title: `Nova Conversa ${conversations.length + 1}` };
        setConversations([newConv, ...conversations]);
        setActiveConvId(newConv.id);
        setIsSidebarOpen(false);
    };

    const handleDeleteConversation = (id: string) => {
        const updated = conversations.filter(c => c.id !== id);
        if (updated.length === 0) {
            const newConv = { id: Date.now().toString(), title: 'Nova Conversa' };
            setConversations([newConv]);
            setActiveConvId(newConv.id);
        } else {
            setConversations(updated);
            if (activeConvId === id) setActiveConvId(updated[0].id);
        }
    };
    const [useLocalAI, setUseLocalAI] = useState<boolean>(false);
    const [allowOffline, setAllowOffline] = useState<boolean>(false);
    const netInfo = useNetInfo();
    const isConnected = netInfo.isConnected ?? true;

    const getConfig = async () => {
        const config = await CarregarConfiguracao();
        setAllowOffline(config?.EnableLocalAI === true);

        if (!isConnected) {
            setUseLocalAI(config?.EnableLocalAI === true);
        }
        else {
            setUseLocalAI(false);
        }
    };

    useEffect(() => {
        getConfig();
    }, [isConnected]);

    const { messages, sendMessage, isLoading } = useAIChat(useLocalAI);

    const handleSend = () => {
        if (!inputText.trim()) return;
        if (netInfo.isConnected) {
            if (useLocalAI) setUseLocalAI(false);
        }
        else if (allowOffline) {
            setUseLocalAI(true);
        }

        sendMessage(inputText);
        setInputText('');
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[styles.messageBubble, isUser ?
                { alignSelf: 'flex-end', backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 } :
                { alignSelf: 'flex-start', backgroundColor: theme.colors.surfaceVariant, borderBottomLeftRadius: 4 }]}>

                <Text style={[styles.messageText, { color: isUser ? '#FFFFFF' : theme.colors.text }]}>{item.text}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.surface }]}>
            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
                    <TouchableOpacity onPress={() => setIsSidebarOpen(true)} style={styles.menuButton}>
                        <Menu color={theme.colors.primary} size={28} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>Assistente IA</Text>
                    <View style={{ width: 28 }} />
                </View>

                {/* Lista de Mensagens */}
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messageList}
                    showsVerticalScrollIndicator={false}
                />

                {/* Loading Indicator */}
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                        <Text style={[styles.loadingText, { color: theme.colors.primary }]}>A IA está pensando...</Text>
                    </View>
                )}

                {/* Input e Botão de Envio */}
                <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.text }]}
                        placeholder="Digite sua mensagem..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        editable={!isLoading}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: theme.colors.primary }, isLoading && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        activeOpacity={0.8}
                        disabled={isLoading}
                    >
                        <Text style={styles.sendButtonText}>Enviar</Text>
                    </TouchableOpacity>
                </View>

                {(!isConnected && !useLocalAI) && (
                    <View style={styles.overlayBlur}>
                        <View style={[styles.offlineBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}>
                            <Text style={[styles.offlineTitle, { color: theme.colors.primary }]}>Sem Conexão</Text>
                            <Text style={[styles.offlineText, { color: theme.colors.text }]}>
                                A Inteligência Artificial requer internet para funcionar.
                                Conecte-se à rede para usar o Chat IA.
                            </Text>
                        </View>
                    </View>
                )}

                {/* Menu lateral */}
                {isSidebarOpen && (
                    <View style={styles.sidebarOverlay}>
                        <TouchableOpacity style={styles.sidebarCloseArea} onPress={() => setIsSidebarOpen(false)} />
                        <View style={[styles.sidebar, { backgroundColor: theme.colors.surface }]}>

                            <View style={styles.sidebarTop}>
                                <Text style={[styles.sidebarTitle, { color: theme.colors.text }]}>
                                    <Sparkles color={theme.colors.primary} size={20} /> SmartAgenda
                                </Text>
                            </View>

                            <View style={styles.sidebarActions}>
                                <TouchableOpacity onPress={handleNewConversation} style={[styles.actionButton, { backgroundColor: theme.colors.surfaceVariant }]}>
                                    <View style={{ marginRight: 12 }}>
                                        <SquarePen color={theme.colors.text} size={20} />
                                    </View>
                                    <Text style={[styles.actionText, { color: theme.colors.text }]}>Nova conversa</Text>
                                </TouchableOpacity>

                                <View style={[styles.searchContainer, { backgroundColor: 'transparent' }]}>
                                    <View style={{ marginRight: 12 }}>
                                        <Search color={theme.colors.textSecondary} size={20} />
                                    </View>
                                    <TextInput
                                        style={[styles.searchInput, { color: theme.colors.text }]}
                                        placeholder="Pesquisar conversas"
                                        placeholderTextColor={theme.colors.textSecondary}
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                    />
                                </View>
                            </View>

                            <Text style={[styles.recentSectionTitle, { color: theme.colors.textSecondary }]}>Recentes</Text>

                            <FlatList
                                data={filteredConversations}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.geminiConvItem,
                                            activeConvId === item.id ? { backgroundColor: theme.colors.surfaceVariant } : null
                                        ]}
                                        onPress={() => { setActiveConvId(item.id); setIsSidebarOpen(false); }}
                                        onLongPress={() => handleDeleteConversation(item.id)}
                                    >
                                        <Text style={[styles.geminiConvTitle, { color: activeConvId === item.id ? theme.colors.primary : theme.colors.textSecondary }]} numberOfLines={1}>{item.title}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 20,
        paddingHorizontal: 24,
        paddingBottom: 15,
        borderBottomWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    messageList: {
        padding: 16,
        paddingBottom: 24,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        borderTopWidth: 1,
        alignItems: 'center',
        paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    },
    input: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        fontSize: 16,
        maxHeight: 100,
    },
    sendButton: {
        marginLeft: 12,
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    loadingContainer: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginLeft: 8,
        fontSize: 14,
    },
    overlayBlur: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    offlineBox: {
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        marginHorizontal: 30,
        borderWidth: 2,
    },
    offlineTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    offlineText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    menuButton: {
        padding: 4,
    },
    sidebarOverlay: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        zIndex: 20,
    },
    sidebarCloseArea: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sidebar: {
        width: '75%',
        height: '100%',
        position: 'absolute',
        left: 0,
        elevation: 16,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    sidebarTop: {
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    sidebarTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    sidebarActions: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 24,
        marginBottom: 8,
    },
    actionText: {
        fontSize: 16,
        fontWeight: '500',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 16,
        borderRadius: 24,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 8,
    },
    recentSectionTitle: {
        paddingHorizontal: 24,
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 10,
    },
    geminiConvItem: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
        marginHorizontal: 8,
        marginBottom: 2,
    },
    geminiConvTitle: {
        fontSize: 15,
    },
});
