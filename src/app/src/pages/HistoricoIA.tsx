import React, { useEffect, useState } from 'react';

import {
    View,
    Text,
    FlatList,
    StyleSheet,
    SafeAreaView
} from 'react-native';

import IAInteracaoService, {
    IAInteracao
} from '../services/IAInteracaoService';

export default function HistoricoIA() {

    const [historico, setHistorico] = useState<IAInteracao[]>([]);

    useEffect(() => {
        carregarHistorico();
    }, []);

    async function carregarHistorico() {

        const dados =
            await IAInteracaoService.BuscarInteracoesFirebase();

        setHistorico(dados);
    }

    function formatarData(timestamp: number) {

        return new Date(timestamp).toLocaleString('pt-BR');
    }

    return (
        <SafeAreaView style={styles.container}>

            <Text style={styles.titulo}>
                Histórico da IA
            </Text>

            <FlatList
                data={historico}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (

                    <View style={styles.card}>

                        {!!item.prompt && (
                            <Text style={styles.prompt}>
                                {item.prompt}
                            </Text>
                        )}

                        {!!item.resposta && (
                            <Text style={styles.resposta}>
                                {item.resposta}
                            </Text>
                        )}

                        <Text style={styles.data}>
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
        backgroundColor: '#000',
        padding: 16,
    },

    titulo: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },

    card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },

    prompt: {
        color: '#BB86FC',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },

    resposta: {
        color: '#FFF',
        fontSize: 15,
        marginBottom: 10,
    },

    data: {
        color: '#999',
        fontSize: 12,
    },
});