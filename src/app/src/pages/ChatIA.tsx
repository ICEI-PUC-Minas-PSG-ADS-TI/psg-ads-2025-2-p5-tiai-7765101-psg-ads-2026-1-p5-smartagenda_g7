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
    SafeAreaView
} from 'react-native';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'assistant';
}

export default function ChatIA() {
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Olá! Sou seu assistente de produtividade. Como posso te ajudar a organizar suas tarefas hoje?',
            sender: 'assistant',
        }
    ]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            sender: 'user',
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputText('');

        // Mock resposta
        setTimeout(() => {
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Entendi! Vou analisar as informações e te ajudar a estruturar suas tarefas. (Mock de Resposta)',
                sender: 'assistant',
            };
            setMessages((prev) => [...prev, botResponse]);
        }, 1000);
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

                {/* Input e Botão de Envio */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite sua mensagem..."
                        placeholderTextColor="#888"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend} activeOpacity={0.8}>
                        <Text style={styles.sendButtonText}>Enviar</Text>
                    </TouchableOpacity>
                </View>
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
});
