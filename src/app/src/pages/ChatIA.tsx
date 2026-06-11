import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNetInfo } from '@react-native-community/netinfo';
import { Bot, SquarePen, Menu, MoreVertical, Search } from 'lucide-react-native';
import { useAIChat, Message } from '../hooks/useAIChat';
import ChatSearchModal from './ChatSearchModal';
import { useTheme } from '../theme/ThemeContext';
import { CarregarConfiguracao } from '../services/LocalStorageService'
import IAInteracaoService, { IAConversacao } from '../services/IAInteracaoService';

export default function ChatIA() {
    const { theme } = useTheme();
    const [inputText, setInputText] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [conversations, setConversations] = useState<IAConversacao[]>([]);
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
    const [targetMessageId, setTargetMessageId] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);

    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [conversationToRename, setConversationToRename] = useState<IAConversacao | null>(null);
    const [newTitle, setNewTitle] = useState('');

    const [useLocalAI, setUseLocalAI] = useState<boolean>(false);
    const [allowOffline, setAllowOffline] = useState<boolean>(false);
    const netInfo = useNetInfo();
    const isConnected = netInfo.isConnected ?? true;

    useEffect(() => {
        let unsubscribe = () => { };

        const carregar = async () => {
            if (isConnected) {
                unsubscribe = IAInteracaoService.EscutarConversacoesFirebase((dados) => {
                    setConversations(dados);
                    if (!activeConvId && dados.length > 0) {
                        setActiveConvId(dados[0].id);
                    }
                });
            } else {
                const locais = await IAInteracaoService.CarregarConversacoesLocais();
                const arrayLocais = Object.values(locais).sort((a, b) => b.dataAtualizacao - a.dataAtualizacao);
                setConversations(arrayLocais);
                if (!activeConvId && arrayLocais.length > 0) {
                    setActiveConvId(arrayLocais[0].id);
                }
            }
        };
        carregar();
        return () => unsubscribe();
    }, [isConnected]);

    const sortedConversations = [...conversations].sort((a, b) => b.dataAtualizacao - a.dataAtualizacao);

    const handleNewConversation = async () => {
        const id = Date.now().toString();
        const novaConv: IAConversacao = {
            id,
            titulo: `Nova Conversa`,
            dataCriacao: Date.now(),
            dataAtualizacao: Date.now()
        };
        await IAInteracaoService.SalvarConversacao(novaConv, isConnected);
        setActiveConvId(id);
        setIsSidebarOpen(false);
    };

    const handleDeleteConversation = async (id: string) => {
        await IAInteracaoService.DeletarConversacao(id, isConnected);
        if (activeConvId === id) {
            const restantes = conversations.filter(c => c.id !== id);
            if (restantes.length > 0) {
                setActiveConvId(restantes[0].id);
            } else {
                setActiveConvId(null);
            }
        }
    };

    const handleOptions = (conv: IAConversacao) => {
        Alert.alert(
            "Opções da Conversa",
            conv.titulo,
            [
                {
                    text: "Renomear", onPress: () => {
                        setConversationToRename(conv);
                        setNewTitle(conv.titulo);
                        setRenameModalVisible(true);
                    }
                },
                { text: "Excluir", onPress: () => handleDeleteConversation(conv.id), style: "destructive" },
                { text: "Cancelar", style: "cancel" }
            ]
        );
    };

    const handleRenameSubmit = async () => {
        if (!conversationToRename || !newTitle.trim()) return;

        const updatedConv = {
            ...conversationToRename,
            titulo: newTitle.trim(),
            dataAtualizacao: Date.now()
        };

        await IAInteracaoService.SalvarConversacao(updatedConv, isConnected);

        setRenameModalVisible(false);
        setConversationToRename(null);
    };

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

    const { messages, sendMessage, isLoading } = useAIChat(useLocalAI, activeConvId);

    useEffect(() => {
        if (targetMessageId && messages.length > 0 && flatListRef.current) {
            const index = messages.findIndex(m => m.id === targetMessageId);
            if (index !== -1) {
                setTimeout(() => {
                    flatListRef.current?.scrollToIndex({ index, animated: true });
                    setTimeout(() => setTargetMessageId(null), 2000);
                }, 500);
            }
        }
    }, [messages, targetMessageId]);

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
        const isTarget = item.id === targetMessageId;

        if (messages.length === 1 && !isUser) {
            return (
                <View style={styles.welcomeMessageContainer}>
                    <Bot color={theme.colors.primary} size={48} style={{ marginBottom: 20 }} />
                    <Text style={[styles.welcomeMessageText, { color: theme.colors.text }]}>
                        {item.text}
                    </Text>
                </View>
            );
        }

        return (
            <View style={[styles.messageBubble, isUser ?
                { alignSelf: 'flex-end', backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 } :
                { alignSelf: 'flex-start', backgroundColor: theme.colors.surfaceVariant, borderBottomLeftRadius: 4 },
            isTarget ? { borderWidth: 2, borderColor: '#4d00b1ff', backgroundColor: isUser ? theme.colors.primary : theme.colors.surface } : null
            ]}>

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
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messageList}
                    showsVerticalScrollIndicator={false}
                    onScrollToIndexFailed={info => {
                        const wait = new Promise(resolve => setTimeout(resolve, 500));
                        wait.then(() => {
                            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                        });
                    }}
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
                                    <Bot color={theme.colors.primary} size={20} /> SmartAgenda
                                </Text>
                            </View>

                            <View style={styles.sidebarActions}>
                                <TouchableOpacity onPress={handleNewConversation} style={[styles.actionButton, { backgroundColor: theme.colors.surfaceVariant }]}>
                                    <View style={{ marginRight: 12 }}>
                                        <SquarePen color={theme.colors.text} size={20} />
                                    </View>
                                    <Text style={[styles.actionText, { color: theme.colors.text }]}>Nova conversa</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setIsSearchModalVisible(true)} style={[styles.actionButton, { backgroundColor: theme.colors.surfaceVariant }]}>
                                    <View style={{ marginRight: 12 }}>
                                        <Search color={theme.colors.text} size={20} />
                                    </View>
                                    <Text style={[styles.actionText, { color: theme.colors.text }]}>Pesquisar em conversas</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.recentSectionTitle, { color: theme.colors.textSecondary }]}>Recentes</Text>

                            <FlatList
                                data={sortedConversations}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.geminiConvItem,
                                            activeConvId === item.id ? { backgroundColor: theme.colors.surfaceVariant } : null,
                                            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }
                                        ]}
                                        onPress={() => { setActiveConvId(item.id); setIsSidebarOpen(false); }}
                                    >
                                        <Text style={[styles.geminiConvTitle, { flex: 1, color: activeConvId === item.id ? theme.colors.primary : theme.colors.textSecondary }]} numberOfLines={1}>{item.titulo}</Text>
                                        <TouchableOpacity onPress={() => handleOptions(item)} style={{ padding: 4 }}>
                                            <MoreVertical color={theme.colors.textSecondary} size={20} />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                )}

                {/* Rename Modal */}
                <Modal visible={renameModalVisible} transparent={true} animationType="fade">
                    <View style={styles.overlayBlur}>
                        <View style={[styles.renameBox, { backgroundColor: theme.colors.surface }]}>
                            <Text style={[styles.renameTitle, { color: theme.colors.text }]}>Renomear Conversa</Text>
                            <TextInput
                                style={[styles.renameInput, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.text }]}
                                value={newTitle}
                                onChangeText={setNewTitle}
                                autoFocus
                            />
                            <View style={styles.renameActions}>
                                <TouchableOpacity onPress={() => setRenameModalVisible(false)} style={styles.renameCancelButton}>
                                    <Text style={{ color: theme.colors.textSecondary }}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleRenameSubmit} style={[styles.renameSaveButton, { backgroundColor: theme.colors.primary }]}>
                                    <Text style={{ color: '#FFF' }}>Salvar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Modal de Pesquisa */}
                <ChatSearchModal
                    visible={isSearchModalVisible}
                    onClose={() => setIsSearchModalVisible(false)}
                    onSelectMessage={(convId, msgId) => {
                        setIsSearchModalVisible(false);
                        setActiveConvId(convId);
                        setIsSidebarOpen(false);
                        setTargetMessageId(msgId);
                    }}
                />
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
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        maxWidth: '85%',
    },
    welcomeMessageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        marginTop: 60,
    },
    welcomeMessageText: {
        fontSize: 24,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 34,
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
    renameBox: {
        width: '80%',
        padding: 24,
        borderRadius: 16,
    },
    renameTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    renameInput: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
    },
    renameActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    renameCancelButton: {
        padding: 10,
        marginRight: 10,
    },
    renameSaveButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
});
