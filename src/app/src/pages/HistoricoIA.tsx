import React, { useEffect, useState } from 'react';
import {View,Text,FlatList,StyleSheet,SafeAreaView} from 'react-native';
import IAInteracaoService, {IAInteracao} from '../services/IAInteracaoService';
import { useTheme } from '../theme/ThemeContext';

export default function HistoricoIA() {
    const { theme } = useTheme();
    const [historico, setHistorico] = useState<IAInteracao[]>([]);

   useEffect(() => {

    const unsubscribe =
        IAInteracaoService.EscutarInteracoesFirebase(
            (dados) => {

                setHistorico(dados);
            }
        );

    return unsubscribe;

}, []);

    function formatarData(timestamp: number) {

        return new Date(timestamp).toLocaleString('pt-BR');
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

            <Text style={[styles.titulo, { color: theme.colors.text }]}>
                Histórico da IA
            </Text>

            <FlatList
                data={historico}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (

                    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>

                        {!!item.prompt && (
                            <Text style={[styles.prompt, { color: theme.colors.primary }]}>
                                {item.prompt}
                            </Text>
                        )}

                        {!!item.resposta && (
                            <Text style={[styles.resposta, { color: theme.colors.text }]}>
                                {item.resposta}
                            </Text>
                        )}

                        <Text style={[styles.data, { color: theme.colors.textSecondary }]}>
                            {formatarData(item.dataInteracao)}
                        </Text>

                    </View>
                )}
            />

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 16,
    },

    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },

    card: {
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },

    prompt: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },

    resposta: {
        fontSize: 15,
        marginBottom: 10,
    },

    data: {
        fontSize: 12,
    },
});