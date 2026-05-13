import React, { useState } from 'react';
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
import { useAIChat, Message } from '../hooks/useAIChat';
import { useTheme } from '../theme/ThemeContext';

export default function ChatIA() {
    const { theme } = useTheme();
    const [inputText, setInputText] = useState('');
    const { messages, sendMessage, isLoading } = useAIChat();
    const netInfo = useNetInfo();
    const isConnected = netInfo.isConnected ?? true;

    const handleSend = () => {
        if (!inputText.trim()) return;
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
                    <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>Assistente de Agenda IA</Text>
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

                {!isConnected && (
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
        alignItems: 'center',
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
});
