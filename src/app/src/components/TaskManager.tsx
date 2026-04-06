// Componente relacionado ao CRUD das tarefas. Podendo ser usado como Modal ou Página
import React, { useEffect, useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    Alert, 
    TouchableOpacity, 
    StyleSheet 
} from 'react-native';

// Tipos e Serviços
import { Tarefa } from '../types/tarefa.ts';
import { CreateTarefa, LocaleStringToTimestamp } from '../services/TarefaService.ts';
import StorageAPI from '../services/LocalStorageService';
import { salvarTarefaFirestore } from '../services/FirestoreService';

type Props = {
    tarefa?: Tarefa | null;
    onClose?: (result?: Tarefa) => void;
};

export default function TaskManager({ tarefa, onClose }: Props) {
    const isCreating = !tarefa;

    const [task, setTask] = useState<Tarefa>(
        tarefa || CreateTarefa(
            Date.now().toString(),
            '',
            Date.now(),
            Date.now() + 7 * 24 * 60 * 60 * 1000
        )
    );
    
    const [textDates, setTextDates] = useState<Record<string, string>>({});
    const [categoriesString, setCategoriesString] = useState('');
    const [descriptionHeight, setDescriptionHeight] = useState(40);

    // Sincroniza os estados quando a tarefa passada via props mudar
    useEffect(() => {
        if (tarefa) {
            setTask(tarefa);
        }
        
        const baseTask = tarefa || task;
        setTextDates({
            data_criado: new Date(baseTask.data_criado).toLocaleString(),
            data_vencimento: new Date(baseTask.data_vencimento).toLocaleString(),
            data_finalizado: baseTask.data_finalizado 
                ? new Date(baseTask.data_finalizado).toLocaleString() 
                : '',
        });
        setCategoriesString(baseTask.categorias ? baseTask.categorias.join(', ') : '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tarefa]);

    const updateField = useCallback((field: keyof Tarefa, value: any) => {
        setTask(prev => ({ ...prev, [field]: value }));
    }, []);

    const tryUpdateDate = useCallback((field: keyof Tarefa, value: string) => {
        setTextDates(prev => ({ ...prev, [field]: value }));
        if (value.length < 19) return; 

        const timestamp = LocaleStringToTimestamp(value);
        if (timestamp !== null) {
            updateField(field, timestamp);
        }
    }, [updateField]);

    const tryUpdateCategories = useCallback((value: string) => {
        try {
            const parsedCategories = value.split(',').map(s => s.trim());
            updateField('categorias', parsedCategories);
        } catch (error) {
            // Falha silenciosa
        }
    }, [updateField]);

    const changeState = useCallback((state: string, requireConfirm?: boolean, confirmText?: string) => {
        if (requireConfirm) {
            Alert.alert(
                'Confirmação', 
                confirmText || 'Tem certeza que deseja alterar o estado da tarefa?', 
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Confirmar', onPress: () => changeState(state, false) }
                ]
            );
        } else {
            if (state === 'Finalizado' && !task.data_finalizado) {
                const timern = Date.now();
                updateField('data_finalizado', timern);
                setTextDates(prev => ({ ...prev, data_finalizado: new Date(timern).toLocaleString() }));
            } else {
                updateField('data_finalizado', undefined);
                setTextDates(prev => ({ ...prev, data_finalizado: '' }));
            }
            updateField('estado', state as any);
        }
    }, [task.data_finalizado, updateField]);

    const handleExit = async () => {
        let errorField = '';
        if (!task.titulo) errorField = 'Título';
        else if (!task.data_vencimento) errorField = 'Data de Vencimento';

        if (errorField !== '') {
            Alert.alert(
                'Campos Obrigatórios', 
                `Por favor, preencha o campo "${errorField}".`, 
                [{ text: 'OK', style: 'cancel' }]
            );
            return;
        }

        try {
            // 1. SALVAR LOCALMENTE
            const data = await StorageAPI.CarregarTarefas() || {};
            data[task.id] = task;
            await StorageAPI.SalvarTarefas(data);

            // 2. TENTAR SALVAR NO FIREBASE
            salvarTarefaFirestore(task).catch(() => {});

            // 3. Fechar modal e enviar resultado
            if (onClose) {
                onClose(task);
            }
            
        } catch (error) {
            Alert.alert(
                'Erro de Armazenamento', 
                'Não foi possível salvar a tarefa na memória do dispositivo.',
                [{ text: 'OK', style: 'default' }]
            );
        }
    };

    return (
        <View style={[styles.container, styles.coloredBackground]}>
            <Text style={styles.title}>{isCreating ? 'Criar Tarefa' : 'Editar Tarefa'}</Text>
            
            <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Título:</Text>
                    <TextInput
                        placeholder="Ex: Reunião de Alinhamento" 
                        placeholderTextColor="#999"
                        value={task.titulo}
                        inputMode="text"
                        onChangeText={text => updateField('titulo', text)}
                        style={styles.input}
                    />
                </View>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Descrição Geral:</Text>
                    <TextInput
                        placeholder="Detalhes adicionais da tarefa..." 
                        placeholderTextColor="#999"
                        value={task.descricao_geral}
                        inputMode="text"
                        onChangeText={text => updateField('descricao_geral', text)}
                        style={[styles.input, { height: Math.max(40, descriptionHeight) }]}
                        multiline
                        onContentSizeChange={(e) => setDescriptionHeight(e.nativeEvent.contentSize.height)}
                    />
                </View>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Data de Vencimento:</Text>
                    <TextInput
                        placeholder="DD/MM/AAAA HH:MM:SS" 
                        placeholderTextColor="#999"
                        value={textDates.data_vencimento}
                        inputMode="text"
                        onChangeText={text => tryUpdateDate('data_vencimento', text)}
                        style={styles.input}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Categorias (separadas por vírgula):</Text>
                    <TextInput
                        placeholder="Ex: Trabalho, Faculdade" 
                        placeholderTextColor="#999"
                        value={categoriesString}
                        inputMode="text"
                        onChangeText={text => { 
                            setCategoriesString(text); 
                            tryUpdateCategories(text); 
                        }}
                        style={styles.input}
                    />
                </View>

                <Text style={styles.statusLabel}>
                    Estado Atual: [{task.estado === 'NaoIniciado' ? 'Não Iniciado' : task.estado === 'EmProgresso' ? 'Em Progresso' : 'Concluída'}]
                </Text>

                {task.estado === 'Finalizado' ? (
                    <View>
                        <Text style={styles.secondaryText}>
                            Finalizada em {textDates.data_finalizado}
                        </Text>
                        <TouchableOpacity 
                            style={[styles.buttonSmall, styles.highlightColor3]} 
                            onPress={() => changeState('EmProgresso', true, 'Tem certeza que deseja reabrir a tarefa?')} 
                        >
                            <Text style={styles.label}>Reabrir Tarefa</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity 
                        style={[styles.buttonSmall, styles.highlightColor]} 
                        onPress={() => changeState('Finalizado', true, 'Tem certeza que deseja finalizar a tarefa?')} 
                    >
                        <Text style={styles.label}>Finalizar Tarefa</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity 
                    style={[styles.button, styles.highlightColor2]} 
                    onPress={handleExit}
                >
                    <Text style={styles.label}>{isCreating ? 'Salvar Nova Tarefa' : 'Salvar Alterações'}</Text>
                </TouchableOpacity>
            </View>
        </View >
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent: 'center', 
        padding: 20, 
        backgroundColor: '#121212' 
    },
    formContainer: { 
        marginHorizontal: 24 
    },
    inputContainer: { 
        marginVertical: 5 
    },
    coloredBackground: { 
        backgroundColor: '#2e0a57' 
    },
    highlightColor: { 
        backgroundColor: '#8b42d4' 
    },
    highlightColor2: { 
        backgroundColor: '#994ae8' 
    },
    highlightColor3: { 
        backgroundColor: '#6f419e' 
    },
    title: { 
        fontSize: 30, 
        fontWeight: 'bold', 
        marginBottom: 20, 
        textAlign: 'center', 
        color: '#FFFFFF' 
    },
    input: { 
        color: '#000000', 
        borderColor: '#000000', 
        borderWidth: 2, 
        justifyContent: 'center', 
        padding: 10, 
        backgroundColor: '#E1E1E1', 
        borderRadius: 10 
    },
    label: { 
        color: '#FFFFFF', 
        marginStart: 7, 
        fontSize: 16, 
        marginBottom: 5 
    },
    statusLabel: {
        color: '#FFFFFF',
        marginStart: 7,
        fontSize: 16,
        marginTop: 15,
        marginBottom: 5,
        fontWeight: 'bold'
    },
    secondaryText: { 
        color: '#baa5cf',
        marginStart: 10,
        marginBottom: 10
    },
    button: { 
        marginVertical: 10, 
        marginHorizontal: 10, 
        padding: 14, 
        borderRadius: 8, 
        alignItems: 'center' 
    },
    buttonSmall: { 
        marginVertical: 10, 
        marginHorizontal: 50, 
        padding: 10, 
        borderRadius: 8, 
        alignItems: 'center' 
    }
});