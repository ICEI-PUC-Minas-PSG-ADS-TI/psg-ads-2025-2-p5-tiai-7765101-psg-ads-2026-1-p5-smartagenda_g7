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

type Props = {
    tarefa?: Tarefa | null;
    onClose?: (requireRefresh?: boolean) => void;
    Parent?: Tarefa;
    newTask?: boolean; // para criação
    onUnsavedChanges?: (hasUnsavedChanges: boolean) => void;
    blockRefresh?: boolean;
};

export default function TaskManager({ tarefa, onClose, Parent, newTask, onUnsavedChanges, blockRefresh }: Props) {
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
    //const [unsavedChanges, setUnsavedChanges] = useState(isCreating);
    const unsavedChanges = useRef(isCreating);
    useEffect(() => {
        onUnsavedChanges?.(unsavedChanges.current);
    }, [unsavedChanges.current, onUnsavedChanges]);
    //const unsavedSubtaskChanges = useRef(false);

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
            //console.log("parented here");
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
            //getParentChain(tarefa, "").then((fullChain) => { setDepthDisplay(fullChain); });
        }

        //else console.log("no parents?");
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
        console.log("updated with ", subtasks?.length, " subtasks");
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
            //if (Subtasks.length != baseTask.subtarefas.length) {

                getallsubtasks();
            //}
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
        //if (!task) return;
        const createSubtask = async () => {
            let subtask = await CreateTarefaControlled();
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
        console.log(tarefas);
        let updatedparent = tarefas ? tarefas[task!.id] : null;

        let updated = updatedparent ? await GetSubtarefas(updatedparent) : await GetSubtarefas(task!);
        setSubtasks(updated || []);
        if (forcerefresh) {//if (!selectedSubtask || !subtask) {
            console.log("----- UPDATED SUBTASKS? (specific) ", updated?.length);
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
            //tryClose();

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

        //if (parent) tryClose();
        /*

        unsavedSubtaskChanges.current = false;

        console.log("saving subtask");

        const current = Subtasks;

        let updatedSubtasks: Tarefa[];

        const existingIndex = current.findIndex(t => t.id === subtask.id);

        if (existingIndex >= 0) {
            updatedSubtasks = [...current];
            updatedSubtasks[existingIndex] = subtask;
        } else {
            updatedSubtasks = [...current, subtask];
        }

        console.log("----- UPDATED SUBTASKS? ", updatedSubtasks.length);

        setSubtasks(updatedSubtasks);

        const prevTask = task;

        if (prevTask) {

            let updatedStatus: Tarefa['estado'] = 'EmProgresso';

            if (updatedSubtasks.every(t => t.estado === 'Finalizado'))
                updatedStatus = 'Finalizado';
            else if (updatedSubtasks.every(t => t.estado === 'NaoIniciado'))
                updatedStatus = 'NaoIniciado';

            newtask = {
                ...prevTask,
                estado: updatedStatus,
                data_finalizado: updatedStatus === 'Finalizado' ? Date.now() : undefined,
                subtarefas: updatedSubtasks.map(t => t.id)
            };
            console.log("1new subtask count: ", newtask?.subtarefas?.length);


            setTask(newtask);
        }
        console.log("2new subtask count: ", newtask?.subtarefas?.length);
        if (newtask) await TrySalvarTarefa(newtask);*/
        //tryClose();
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

    /*const importTasksJSON = useCallback(async (tarefas: Tarefa[]) => {
        if (tarefas) {
            unsavedChanges.current = false;
            for (const t of tarefas) {
                await TrySalvarTarefa(t);
            }
            let selected = tarefas.find((t) => !t.isSubtarefa);
            //if (selected) setTask(selected);

            if (onClose && selected) {
                onClose(selected);
            }
        }
        else { }
    }, []);*/

    const tryClose = async (IsSaving?: boolean) => { // NOT for cancelling
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
                console.log(`SAVING BOTH RIGHT NOW ${updated.parentId} -- `, parent?.subtarefas?.length); // theres something fucking this up
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
                console.log("no task?????????");
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

    //O conteúdo abaixo dos campos preenchiveis, exceto o botão de salvar.
    if (isCreating) {
        LowerContent = (<View></View>);
    }
    else {
        let addsubtask = (
            <TouchableOpacity
                style={[styles.buttonSmall, styles.highlightColor]}
                onPress={newSubtask}
            >
                <Text style={styles.label}>Adicionar Sub-tarefa</Text>
            </TouchableOpacity>
        );
        LowerContent = (
            <View>
                <Text style={styles.statusLabel}>
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
                        <Text style={styles.secondaryText}>
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
                        <Text style={styles.secondaryText}>
                            Finalizada em {textDates.data_finalizado}
                        </Text>
                        <TouchableOpacity
                            style={[styles.buttonSmall, styles.highlightColor3]}
                            onPress={() =>
                                changeState(
                                    'EmProgresso',
                                    true,
                                    'Tem certeza que deseja reabrir a tarefa?'
                                )
                            }
                        >
                            <Text style={styles.label}>Reabrir Tarefa</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        {addsubtask}
                        <TouchableOpacity
                            style={[styles.buttonSmall, styles.highlightColor]}
                            onPress={() =>
                                changeState(
                                    'Finalizado',
                                    true,
                                    'Tem certeza que deseja finalizar a tarefa?'
                                )
                            }
                        >
                            <Text style={styles.label}>Finalizar Tarefa</Text>
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
                <View style={[styles.container, styles.coloredBackground]}>
                    <Text style={styles.secondaryText}>{depthDisplay}</Text>
                    {!isCreating && (<KebabOptionsMenu onOptionPressed={handleKebabMenu} />)}
                    <Text style={styles.title}> {isCreating ?
                        (depthDisplay ? 'Criar Sub-Tarefa' : 'Criar Tarefa') :
                        (depthDisplay ? 'Editar Sub-Tarefa' : 'Editar Tarefa')}
                    </Text>

                    {/*isCreating && <ImportTasksModal onImport={importTasksJSON}></ImportTasksModal>*/}

                    {/*<TouchableOpacity onPress={() => CreateTarefaJSON("ye")}><Text>TEST BUTTON</Text></TouchableOpacity>*/}
                    {selectedSubtask && (
                        <TaskManager tarefa={selectedSubtask} onClose={() => saveSubtask(true)} newTask={subtaskCreationMode} Parent={task} />
                    )}

                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Título:</Text>
                            <TextInput
                                placeholder="Ex: Reunião de Alinhamento"
                                placeholderTextColor="#999"
                                value={task?.titulo}
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
                                value={task?.descricao_geral}
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

                        {LowerContent}

                        <TouchableOpacity
                            style={[styles.button, styles.saveColor]}
                            onPress={() => tryClose(true)}
                        >
                            <Text style={styles.label}>{isCreating ? 'Salvar Nova Tarefa' : 'Salvar Alterações'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/*
                <TouchableOpacity style={[styles.button, styles.highlightColor2]} onPress={() => setOpenTreeView(true)}><Text style={styles.label}>Visualização de Árvore</Text></TouchableOpacity>
                */}
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

type KebabProps = {
    onOptionPressed?: (option: string) => void;
};

function KebabOptionsMenu({ onOptionPressed }: KebabProps) {
    const [visible, setVisible] = useState(false);

    const tryDelete = () => {
        Alert.alert('Excluir Tarefa?', 'Tem certeza que deseja excluir essa tarefa, e TODAS suas sub-tarefas?',
            [{ text: 'Cancelar', style: 'cancel' },
            { text: 'Sim, excluir tarefa e todas as sub-tarefas', onPress: () => onOptionPressed?.("Delete") }]
        )
        //setVisible(false);
    }

    const TreeView = () => {
        setVisible(false);
        onOptionPressed?.("TreeView");
    }

    return (
        <View style={styles.kebabcontainer}>
            <TouchableOpacity onPress={() => setVisible(true)}>
                <Text style={styles.kebabdots}>⋮</Text>
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
                    <View style={styles.kebabmenu}>
                        <TouchableOpacity onPress={tryDelete}>
                            <Text style={styles.kebaboption}>Excluir Tarefa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={TreeView}>
                            <Text style={styles.kebaboption}>Exbição de Árvore</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

type ImportModalProps = {
    onImport?: (tasks: Tarefa[]) => void;
};

function ImportTasksModal({ onImport }: ImportModalProps) {
    const [visible, setVisible] = useState(false);
    const [text, setText] = useState('');

    const importTasks = useCallback(async () => {
        console.log(text);
        if (!text) { Alert.alert("Insira uma estrutura JSON no campo"); return; }
        let res = await CreateTarefaJSON(text);
        if (!res || res.length <= 0) {
            console.log("Couldn't import tasks by json :(");
            Alert.alert("Não foi possível importar as tarefas pelo JSON, verifique os LOGS");
            return;
        }
        console.log("Imported ", res.length, " tasks");
        onImport?.(res);
        setVisible(false);
    }, [text]);

    return (
        <View>
            <TouchableOpacity style={[styles.buttonSmall, styles.highlightColor3]} onPress={() => setVisible(true)}><Text style={styles.label}>Importar Tarefas por JSON</Text></TouchableOpacity>

            <Modal
                visible={visible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.container}>
                    <View>
                        <Text style={styles.title}>Importar Tarefas por JSON</Text>

                        <TextInput
                            style={styles.biginput}
                            multiline
                            placeholder={`{ "tarefas": [] }`}
                            value={text}
                            onChangeText={setText}
                        />

                        <TouchableOpacity style={[styles.buttonSmall, styles.highlightColor3]} onPress={importTasks} ><Text style={styles.label}>Importar Tarefa(s)</Text></TouchableOpacity>
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
        backgroundColor: '#121212',
    },
    formContainer: {
        marginHorizontal: 24,
        flex: 1
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
    saveColor: {
        backgroundColor: '#43ac6d'
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
    biginput: {
        color: '#000000',
        borderColor: '#000000',
        borderWidth: 2,
        justifyContent: 'center',
        backgroundColor: '#E1E1E1',
        borderRadius: 10,
        padding: 10,
        minHeight: 300,
        maxHeight: 600
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
    },
    kebabcontainer: {
        padding: 20,
        alignItems: 'flex-end',
    },
    kebabdots: {
        fontSize: 40,
        padding: 10,
        color: '#FFFFFF'
    },
    kebaboverlay: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 60,
        paddingRight: 20,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    kebabmenu: {
        backgroundColor: 'white',
        borderRadius: 8,
        paddingVertical: 10,
        width: 150,
        elevation: 5,
    },
    kebaboption: {
        padding: 10,
        fontSize: 16,
    },
});