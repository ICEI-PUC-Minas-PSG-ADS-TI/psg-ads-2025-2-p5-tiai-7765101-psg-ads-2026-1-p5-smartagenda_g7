// Componente relacionado ao CRUD das tarefas. Podendo ser usado como Modal ou Página
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    Alert,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView
} from 'react-native';

// Tipos e Serviços
import { Tarefa } from '../types/tarefa.ts';
import { CreateTarefa, LocaleStringToTimestamp, GetSubtarefas, CreateTarefaJSON, GetUniqueID, SyncState } from '../services/TarefaService.ts';
import StorageAPI, { CarregarTarefas } from '../services/LocalStorageService';
import 'react-native-get-random-values';
import SubTaskList from './SubTaskList.tsx';
import { TrySalvarTarefa, TrySalvar } from '../services/SaveControlService.ts';
import TaskTreeView from './TaskTreeView.tsx';
import { get } from 'react-native/Libraries/NativeComponent/NativeComponentRegistry';
import { useTheme } from '../theme/ThemeContext';
import KebabOptionsMenu from './KebabOptionsMenu';
import ImportTasksModal from './ImportTasksModal';
import { ArrowLeft } from 'lucide-react-native';

type Props = {
    tarefa?: Tarefa | null;
    onClose?: (requireRefresh?: boolean) => void;
    Parent?: Tarefa;
    newTask?: boolean; // para criação
    onUnsavedChanges?: (hasUnsavedChanges: boolean) => void;
    blockRefresh?: boolean;
};

export default function TaskManager({ tarefa, onClose, Parent, newTask, onUnsavedChanges, blockRefresh }: Props) {
    const { theme } = useTheme();

    const CreateTarefaControlled = useCallback(async () => {
        let id = await GetUniqueID();

        return CreateTarefa(
            id,
            '',
            Date.now(),
            Date.now() + 7 * 24 * 60 * 60 * 1000
        )
    }, []);

    const isCreating = newTask || false;
    const unsavedChanges = useRef(isCreating);
    useEffect(() => {
        onUnsavedChanges?.(unsavedChanges.current);
    }, [unsavedChanges.current, onUnsavedChanges]);

    const [task, setTask] = useState<Tarefa | null>(
        tarefa ?? null
    );
    const [parent, setParent] = useState<Tarefa | null>(Parent ?? null);
    const [depthDisplay, setDepthDisplay] = useState<string | undefined>(undefined);

    // relacionados aos textos que precisam ser transformados nos campos
    const [textDates, setTextDates] = useState<Record<string, string>>({});
    const [categoriesString, setCategoriesString] = useState('');
    const [descriptionHeight, setDescriptionHeight] = useState(40);

    // useStates relacionados a subtarefas.
    const [Subtasks, setSubtasks] = useState<Tarefa[]>([]);
    const [selectedSubtask, setSelectedSubtask] = useState<Tarefa | null>(null);
    const [subtaskCreationMode, setSubtaskCreationMode] = useState(false);

    // taskTreeView
    const [openTreeView, setOpenTreeView] = useState(false);

    const getParentChain = async (t: Tarefa, chain: string): Promise<string> => {
        let tarefas = await StorageAPI.CarregarTarefas();
        if (tarefas)
            return await getParentChainInner(t, chain, tarefas)
        else return chain;
    }
    const getParentChainInner = async (t: Tarefa, chain: string, tarefas: Record<string, Tarefa>): Promise<string> => {

        if (!tarefas) return chain;
        let parent = tarefas[t.parentId!];
        if (!parent) return chain;
        return getParentChain(parent, parent.titulo + " > " + chain);
    }

    useEffect(() => {
        if (tarefa) {
            setTask(tarefa);
        }

        if (parent) {
            if (tarefa)
                getParentChain(tarefa, "").then((fullChain) => { setDepthDisplay(fullChain); });
            else
                getParentChain(parent, `${parent.titulo} >`).then((fullChain) => { setDepthDisplay(fullChain); });
        }
        else if (tarefa?.parentId) {
            StorageAPI.TryGetTarefa(tarefa.parentId).then((p) => {
                if (p) {
                    setParent(p);
                }
            });
        }
    }, [tarefa, parent]);

    useEffect(() => {
        if (task) return;

        // para preencher com uma nova tarefa vazia caso não tenha sido passada nenhuma tarefa via props.
        const initialize = async () => {
            const newTask = await CreateTarefaControlled();
            setTask(newTask);
        }
        initialize();
    }, [task, CreateTarefaControlled]);

    const getallsubtasks = async () => {
        if (!task) return;
        let subtasks = await GetSubtarefas(task);
        if (subtasks && subtasks.length > 0) setSubtasks(subtasks);
    }

    // Sincroniza os estados quando a tarefa passada via props mudar
    useEffect(() => {

        if (!task) return;
        const baseTask = task;
        if (!baseTask) { console.log("null task!!"); return; }  // geralmente acontece na primeira renderização, quando ainda não foi criada a tarefa vazia. se só aparecer uma vez, tá ok.

        setTextDates({
            data_criado: new Date(baseTask.data_criado).toLocaleString(),
            data_vencimento: new Date(baseTask.data_vencimento).toLocaleString(),
            data_finalizado: baseTask.data_finalizado
                ? new Date(baseTask.data_finalizado).toLocaleString()
                : '',
        });
        setCategoriesString(baseTask.categorias ? baseTask.categorias.join(', ') : '');

        if (baseTask.subtarefas && baseTask.subtarefas.length > 0) {
            getallsubtasks();
        }

    }, [task]);

    const refresh = () => {
        const refr = async () => {
            let tarefas = await CarregarTarefas();
            if (tarefas) {
                setTask(tarefas[task!.id])
            }
        }
        refr();
    }

    const newSubtask = useCallback(() => {
        const createSubtask = async () => {
            let subtask = await CreateTarefaControlled();
            subtask.categorias = tarefa?.categorias;
            subtask.parentId = task!.id;
            setSelectedSubtask(subtask);
            setSubtaskCreationMode(true);
            console.log("created subtask: " + subtask.id);
        }
        createSubtask();
    }, []);

    const ForceRefresh = useCallback(async () => {
        let tarefas = await CarregarTarefas();
        if (tarefas && task) {
            let newtask = tarefas[task.id];
            if (newtask) setTask(newtask);
            else console.log("task not found on refresh??");
        }
    }, []);

    const saveSubtask = useCallback(async (forcerefresh?: boolean) => {
        console.log("saving subtask");
        let newtask: Tarefa | undefined;

        let tarefas = await CarregarTarefas();
        let updatedparent = tarefas ? tarefas[task!.id] : null;

        let updated = updatedparent ? await GetSubtarefas(updatedparent) : await GetSubtarefas(task!);
        setSubtasks(updated || []);
        if (forcerefresh) {
            let updatedStatus: Tarefa['estado'] = 'EmProgresso';
            if (updated) {
                if (updated.every(t => t.estado === 'Finalizado'))
                    updatedStatus = 'Finalizado';
                else if (updated.every(t => t.estado === 'NaoIniciado'))
                    updatedStatus = 'NaoIniciado';

                newtask = {
                    ...task!,
                    estado: updatedStatus,
                    data_finalizado:
                        updatedStatus === 'Finalizado'
                            ? Date.now()
                            : undefined,
                    subtarefas: updated?.map(t => t.id) ?? undefined
                };
            }
            else {
                newtask = {
                    ...task!,
                    estado: updatedStatus,
                    subtarefas: []
                };
            }
            setTask(newtask);
            console.log("new subtask count: ", newtask?.subtarefas?.length);
            if (newtask) await TrySalvarTarefa(newtask);
        }
        else {
            /*console.log('ahoy');
            setSubtasks(prev => {
                const existingIndex = prev.findIndex(t => t.id === subtask.id);
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = subtask;
                    return updated;
                }
                return [...prev, subtask];
            })*/
        }
        if (updatedparent) setTask(updatedparent);
        console.log("old subtask count: ", task?.subtarefas?.length, " | new subtask count: ", updatedparent?.subtarefas?.length);
        setSubtaskCreationMode(false);
        setSelectedSubtask(null);
    }, [setSelectedSubtask, task]);

    const updateField = useCallback((field: keyof Tarefa, value: any) => {
        setTask(prev => prev ? { ...prev, [field]: value } : null);
        unsavedChanges.current = true;
    }, []);

    const tryUpdateDate = useCallback((field: keyof Tarefa, value: string) => {
        setTextDates(prev => ({ ...prev, [field]: value }));
        if (value.length < 19) return;

        const timestamp = LocaleStringToTimestamp(value);
        if (timestamp !== null) {
            updateField(field, timestamp);
        }
        unsavedChanges.current = true;
    }, [updateField]);

    const tryUpdateCategories = useCallback((value: string) => {
        try {
            const parsedCategories = value.split(',').map(s => s.trim());
            updateField('categorias', parsedCategories);
        } catch (error) {
            // Falha silenciosa
        }
        unsavedChanges.current = true;
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
            if (state === 'Finalizado' && !task?.data_finalizado) {
                const timern = Date.now();
                updateField('data_finalizado', timern);
                setTextDates(prev => ({ ...prev, data_finalizado: new Date(timern).toLocaleString() }));
            } else {
                updateField('data_finalizado', undefined);
                setTextDates(prev => ({ ...prev, data_finalizado: '' }));
            }
            updateField('estado', state as any);
        }
        unsavedChanges.current = true;
    }, [task, updateField]);

    const handleKebabMenu = useCallback((optionIndex: string) => {
        switch (optionIndex) {
            case "Delete":
                tryDeleteTask();
                break;
            case "TreeView":
                setOpenTreeView(true);
                break;
        }
    }, []);

    const tryDeleteTask = useCallback(async () => {
        try {
            console.log("deleting");
            await StorageAPI.DeletarTarefa(task!.id);
            unsavedChanges.current = false;
            await TrySalvar();
            onClose?.(true);
        }
        catch (error) {
            console.log(error);
        }
    }, [task, onClose]);

    const tryClose = async (IsSaving?: boolean) => {
        console.log("exiting task, unsaved changes:" + unsavedChanges.current);
        let errorField = '';
        if (!task?.titulo) errorField = 'Título';
        else if (!task?.data_vencimento) errorField = 'Data de Vencimento';

        if (unsavedChanges.current && !IsSaving) {

            let res = await new Promise<boolean>((resolve) => {
                Alert.alert(
                    'Tem certeza que deseja cancelar a edição da tarefa?',
                    'Todas as alterações não salvas serão perdidas.',
                    [
                        {
                            text: 'Cancelar',
                            onPress: () => resolve(true),
                        },
                        {
                            text: 'Sair sem Salvar',
                            onPress: () => resolve(false),
                        }
                    ]
                )
            });
            if (res) { return; }
            else {
                unsavedChanges.current = false;
                handleCancelExit();
                return;
            }

        }
        if (errorField !== '') {
            Alert.alert(
                'Campos Obrigatórios',
                `Por favor, preencha o campo "${errorField}".`,
                [{ text: 'OK', style: 'cancel' }]
            );
            return;
        }
        handleSaveExit();
    }

    const handleSaveExit = async () => {
        try {
            if (task) {
                let updated = task;
                if (parent) {
                    console.log("Parent isn't absent")
                    updated.parentId = parent.id;
                    if (parent.subtarefas) {
                        let included = false;
                        for (const sid of parent.subtarefas) {
                            if (sid === task.id) {
                                included = true; break;
                            }
                        }
                        if (!included) {
                            parent.subtarefas.push(task.id);
                        }
                    }
                    else parent.subtarefas = [task.id];
                    await StorageAPI.SalvarTarefa(task);
                    await SyncState(parent);
                }

                unsavedChanges.current = false;
                console.log(`SAVING BOTH RIGHT NOW (parent id: ${updated.parentId}) -- subtask count: `, parent?.subtarefas?.length); // theres something fucking this up
                if (parent) {
                    await TrySalvarTarefa(updated);
                    await TrySalvarTarefa(parent);
                }
                else
                    await TrySalvarTarefa(updated, !blockRefresh);

                if (onClose) {
                    onClose(true);
                }
            }
            else {
                if (onClose) {
                    onClose();
                }
            }


        } catch (error) {
            Alert.alert(
                'Erro de Armazenamento',
                'Não foi possível salvar a tarefa na memória do dispositivo.',
                [{ text: 'OK', style: 'default' }]
            );
        }
    };

    const handleCancelExit = () => {
        onClose?.();
    }

    let LowerContent;

    //O conteúdo abaixo dos campos preenchiveis, exceto o botão de salvar
    if (isCreating) {
        LowerContent = (<View></View>);
    }
    else {
        let addsubtask = (
            <TouchableOpacity
                style={[styles.buttonSmall, { backgroundColor: theme.colors.primary }]}
                onPress={newSubtask}
            >
                <Text style={[styles.label, { color: '#FFFFFF' }]}>Adicionar Sub-tarefa</Text>
            </TouchableOpacity>
        );
        LowerContent = (
            <View>
                <Text style={[styles.statusLabel, { color: theme.colors.text }]}>
                    Estado Atual: [
                    {task?.estado === 'NaoIniciado'
                        ? 'Não Iniciado'
                        : task?.estado === 'EmProgresso'
                            ? 'Em Progresso'
                            : 'Concluída'}
                    ]
                </Text>

                {Subtasks.length > 0 ? (
                    <View>
                        <Text style={[styles.secondaryText, { color: theme.colors.textSecondary }]}>
                            Sub-Tarefas: ({Subtasks.length})
                        </Text>
                        <View >
                            <SubTaskList tarefaPai={task!} subtasks={Subtasks} onSelected={setSelectedSubtask} ModalType="edit"
                                onUpdateSubtask={() => saveSubtask()} />
                        </View>
                        {addsubtask}
                    </View>
                ) : task?.estado === 'Finalizado' ? (
                    <View>
                        {addsubtask}
                        <Text style={[styles.secondaryText, { color: theme.colors.textSecondary }]}>
                            Finalizada em {textDates.data_finalizado}
                        </Text>
                        <TouchableOpacity
                            style={[styles.buttonSmall, { backgroundColor: theme.colors.primary }]}
                            onPress={() =>
                                changeState(
                                    'EmProgresso',
                                    true,
                                    'Tem certeza que deseja reabrir a tarefa?'
                                )
                            }
                        >
                            <Text style={[styles.label, { color: '#FFFFFF' }]}>Reabrir Tarefa</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        {addsubtask}
                        <TouchableOpacity
                            style={[styles.buttonSmall, { backgroundColor: theme.colors.primary }]}
                            onPress={() =>
                                changeState(
                                    'Finalizado',
                                    true,
                                    'Tem certeza que deseja finalizar a tarefa?'
                                )
                            }
                        >
                            <Text style={[styles.label, { color: '#FFFFFF' }]}>Finalizar Tarefa</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    }

    if (!task) return (<Text>Carregando...</Text>)
    else return (
        <Modal transparent={true} animationType="slide" onRequestClose={() => tryClose()}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                    <View style={styles.headerContainer}>
                        <TouchableOpacity onPress={() => tryClose()} style={styles.headerBackButton}>
                            <ArrowLeft color={theme.colors.text} size={28} />
                        </TouchableOpacity>

                        <Text style={[styles.title, { color: theme.colors.text }]}>
                            {isCreating ?
                                (depthDisplay ? 'Criar Sub-Tarefa' : 'Criar Tarefa') :
                                (depthDisplay ? 'Editar Sub-Tarefa' : 'Editar Tarefa')}
                        </Text>

                        <View style={styles.headerRightAction}>
                            {!isCreating && (<KebabOptionsMenu onOptionPressed={handleKebabMenu} />)}
                        </View>
                    </View>
                    {depthDisplay ? <Text style={[styles.secondaryText, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: -15, marginBottom: 20 }]}>{depthDisplay}</Text> : null}

                    {/*isCreating && <ImportTasksModal onImport={importTasksJSON}></ImportTasksModal>*/}
                    {/*<TouchableOpacity onPress={() => CreateTarefaJSON("ye")}><Text>TEST BUTTON</Text></TouchableOpacity>*/}
                    {selectedSubtask && (
                        <TaskManager tarefa={selectedSubtask} onClose={() => saveSubtask(true)} newTask={subtaskCreationMode} Parent={task} />
                    )}

                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: theme.colors.text }]}>Título:</Text>
                            <TextInput
                                placeholder="Ex: Reunião de Alinhamento"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={task?.titulo}
                                inputMode="text"
                                onChangeText={text => updateField('titulo', text)}
                                style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: theme.colors.text }]}>Descrição Geral:</Text>
                            <TextInput
                                placeholder="Detalhes adicionais da tarefa..."
                                placeholderTextColor={theme.colors.textSecondary}
                                value={task?.descricao_geral}
                                inputMode="text"
                                onChangeText={text => updateField('descricao_geral', text)}
                                style={[styles.input, { height: Math.max(40, descriptionHeight), backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                                multiline
                                onContentSizeChange={(e) => setDescriptionHeight(e.nativeEvent.contentSize.height)}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: theme.colors.text }]}>Data de Vencimento:</Text>
                            <TextInput
                                placeholder="DD/MM/AAAA HH:MM:SS"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={textDates.data_vencimento}
                                inputMode="text"
                                onChangeText={text => tryUpdateDate('data_vencimento', text)}
                                style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: theme.colors.text }]}>Categorias (separadas por vírgula):</Text>
                            <TextInput
                                placeholder="Ex: Trabalho, Faculdade"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={categoriesString}
                                inputMode="text"
                                onChangeText={text => {
                                    setCategoriesString(text);
                                    tryUpdateCategories(text);
                                }}
                                style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                            />
                        </View>

                        {LowerContent}

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: theme.colors.success }]}
                            onPress={() => tryClose(true)}
                        >
                            <Text style={[styles.label, { color: '#FFFFFF' }]}>{isCreating ? 'Salvar Nova Tarefa' : 'Salvar Alterações'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {!isCreating && (
                    <Modal visible={openTreeView} transparent={true} animationType="slide" onRequestClose={() => { setOpenTreeView(false); refresh() }}>
                        <TaskTreeView tarefa={task} />
                    </Modal>
                )}

            </ScrollView >
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    headerBackButton: {
        padding: 5,
        width: 40,
    },
    headerRightAction: {
        width: 40,
        alignItems: 'flex-end',
    },
    formContainer: {
        marginHorizontal: 24,
        flex: 1
    },
    inputContainer: {
        marginVertical: 5
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    },
    input: {
        borderWidth: 2,
        justifyContent: 'center',
        padding: 10,
        borderRadius: 10
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
        marginBottom: 5
    },
    statusLabel: {
        marginStart: 7,
        fontSize: 16,
        marginTop: 15,
        marginBottom: 5,
        fontWeight: 'bold'
    },
    secondaryText: {
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