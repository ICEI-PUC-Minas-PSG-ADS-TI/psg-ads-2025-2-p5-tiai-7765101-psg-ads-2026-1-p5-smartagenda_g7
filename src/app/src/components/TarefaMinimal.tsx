// Informações simples da tarefa, para ser exibido em lista ou calendário
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Tarefa } from '../types/tarefa.ts'

type Props = {
    tarefa: Tarefa;
    onPress?: (tarefa: Tarefa) => void;
}

/**
 * Componente para exibir as informações básicas de uma tarefa
 * @param tarefa A tarefa a ser exibida
 * @param onPress Função a ser chamada ao clicar na tarefa. Normalmente usada para abrir os detalhes da tarefa. Retorna a própria tarefa.
 */
export default function TarefaMinimal({ tarefa, onPress }: Props) {

    const onPressMiddleMan = () => {
        if (onPress) onPress(tarefa);
    }

    return<TouchableOpacity onPress={onPressMiddleMan}>
    <View style={styles.container}>
        <Text>{tarefa.titulo}</Text>
        <Text>{tarefa.descricao_geral}</Text>
        <Text>Vence em: {new Date(tarefa.data_vencimento).toLocaleString()}</Text>
    </View>
    </TouchableOpacity> 
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 5,
        backgroundColor: '#f0f0f0',
        padding: 10,
        marginHorizontal: 10,
        marginVertical: 5,
    }   
})