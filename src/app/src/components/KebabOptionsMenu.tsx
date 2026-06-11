import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type KebabProps = {
    onOptionPressed?: (option: string) => void;
};

export default function KebabOptionsMenu({ onOptionPressed }: KebabProps) {
    const { theme } = useTheme();
    const [visible, setVisible] = useState(false);

    const tryDelete = () => {
        Alert.alert('Excluir Tarefa?', 'Tem certeza que deseja excluir essa tarefa, e TODAS suas sub-tarefas?',
            [{ text: 'Cancelar', style: 'cancel' },
            {
                text: 'Sim, excluir tarefa e todas as sub-tarefas', onPress: () => {
                    setVisible(false);
                    onOptionPressed?.("Delete");
                }
            }]
        );
    }

    const TreeView = () => {
        setVisible(false);
        onOptionPressed?.("TreeView");
    }

    return (
        <View style={styles.kebabcontainer}>
            <TouchableOpacity onPress={() => setVisible(true)}>
                <Text style={[styles.kebabdots, { color: theme.colors.text }]}>⋮</Text>
            </TouchableOpacity>

            <Modal
                transparent
                animationType="fade"
                visible={visible}
                onRequestClose={() => setVisible(false)}
            >
                <TouchableOpacity
                    style={styles.kebaboverlay}
                    onPress={() => setVisible(false)}
                >
                    <View style={[styles.kebabmenu, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                        <TouchableOpacity onPress={tryDelete}>
                            <Text style={[styles.kebaboption, { color: theme.colors.text }]}>Excluir Tarefa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={TreeView}>
                            <Text style={[styles.kebaboption, { color: theme.colors.text }]}>Exibição de Árvore</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    kebabcontainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    kebabdots: {
        fontSize: 30,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    kebaboverlay: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 60,
        paddingRight: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    kebabmenu: {
        borderRadius: 8,
        paddingVertical: 10,
        width: 150,
        elevation: 5,
        borderWidth: 1,
    },
    kebaboption: {
        padding: 10,
        fontSize: 16,
    },
});