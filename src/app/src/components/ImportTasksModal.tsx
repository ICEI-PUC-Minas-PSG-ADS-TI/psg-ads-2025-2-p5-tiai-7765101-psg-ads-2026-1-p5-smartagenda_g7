import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, StyleSheet } from 'react-native';
import { Tarefa } from '../types/tarefa';
import { CreateTarefaJSON } from '../services/TarefaService';
import { useTheme } from '../theme/ThemeContext';

type ImportModalProps = {
    onImport?: (tasks: Tarefa[]) => void;
};

export default function ImportTasksModal({ onImport }: ImportModalProps) {
    const { theme } = useTheme();
    const [visible, setVisible] = useState(false);
    const [text, setText] = useState('');

    const importTasks = useCallback(async () => {
        if (!text) { Alert.alert("Insira uma estrutura JSON no campo"); return; }
        let res = await CreateTarefaJSON(text);
        if (!res || res.length <= 0) {
            Alert.alert("Não foi possível importar as tarefas pelo JSON, verifique os LOGS");
            return;
        }
        onImport?.(res);
        setVisible(false);
    }, [text, onImport]);

    return (
        <View>
            <TouchableOpacity style={[styles.buttonSmall, { backgroundColor: theme.colors.primary }]} onPress={() => setVisible(true)}>
                <Text style={[styles.label, { color: '#FFFFFF' }]}>Importar Tarefas por JSON</Text>
            </TouchableOpacity>

            <Modal
                visible={visible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setVisible(false)}
            >
                <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                    <View>
                        <Text style={[styles.title, { color: theme.colors.text }]}>Importar Tarefas por JSON</Text>

                        <TextInput
                            style={[styles.biginput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                            multiline
                            placeholder={`{ "tarefas": [] }`}
                            placeholderTextColor={theme.colors.textSecondary}
                            value={text}
                            onChangeText={setText}
                        />

                        <TouchableOpacity style={[styles.buttonSmall, { backgroundColor: theme.colors.primary }]} onPress={importTasks} >
                            <Text style={[styles.label, { color: '#FFFFFF' }]}>Importar Tarefa(s)</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    biginput: {
        borderWidth: 2,
        justifyContent: 'center',
        borderRadius: 10,
        padding: 10,
        minHeight: 300,
        maxHeight: 600
    },
    label: {
        marginStart: 7,
        fontSize: 16,
        marginBottom: 5,
        fontWeight: 'bold',
    },
    buttonSmall: {
        marginVertical: 10,
        marginHorizontal: 50,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center'
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
});