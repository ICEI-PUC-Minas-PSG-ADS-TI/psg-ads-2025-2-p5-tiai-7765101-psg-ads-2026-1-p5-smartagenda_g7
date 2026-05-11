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

export default function ChatIA() {
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
            <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                <Text style={styles.messageText}>{item.text}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Assistente de Agenda IA</Text>
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
                        <ActivityIndicator size="small" color="#9F7CFA" />
                        <Text style={styles.loadingText}>A IA está pensando...</Text>
                    </View>
                )}

                {/* Input e Botão de Envio */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite sua mensagem..."
                        placeholderTextColor="#888"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        editable={!isLoading}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        activeOpacity={0.8}
                        disabled={isLoading}
                    >
                        <Text style={styles.sendButtonText}>Enviar</Text>
                    </TouchableOpacity>
                </View>

                {!isConnected && (
                    <View style={styles.overlayBlur}>
                        <View style={styles.offlineBox}>
                            <Text style={styles.offlineTitle}>Sem Conexão</Text>
                            <Text style={styles.offlineText}>
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
        backgroundColor: '#1E1E1E',
    },
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        paddingTop: 20,
        paddingHorizontal: 24,
        paddingBottom: 15,
        backgroundColor: '#1E1E1E',
        borderBottomWidth: 1,
        borderBottomColor: '#2D2D2D',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#9F7CFA',
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
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#9F7CFA',
        borderBottomRightRadius: 4,
    },
    assistantBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#2D2D2D',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        color: '#FFFFFF',
        fontSize: 16,
        lineHeight: 22,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#1E1E1E',
        borderTopWidth: 1,
        borderTopColor: '#2D2D2D',
        alignItems: 'center',
        paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    },
    input: {
        flex: 1,
        backgroundColor: '#2D2D2D',
        color: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        fontSize: 16,
        maxHeight: 100,
    },
    sendButton: {
        marginLeft: 12,
        backgroundColor: '#9F7CFA',
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
        color: '#9F7CFA',
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
        backgroundColor: '#1E1E1E',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        marginHorizontal: 30,
        borderWidth: 2,
        borderColor: '#9F7CFA',
    },
    offlineTitle: {
        color: '#9F7CFA',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    offlineText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
});
