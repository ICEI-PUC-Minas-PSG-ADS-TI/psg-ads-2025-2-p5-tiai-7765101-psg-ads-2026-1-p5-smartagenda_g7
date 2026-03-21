// Todos os Detalhes das Tarefas. Podendo ser usado como Modal ou Página

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Tarefa } from '../types/tarefa.ts'

type Props = {
    tarefa: Tarefa;
}

export default function TarefaDetalhes({ tarefa }: Props) {
    useEffect(() => {
        console.log(tarefa); 
    })

    return <View>
        
    </View>
}