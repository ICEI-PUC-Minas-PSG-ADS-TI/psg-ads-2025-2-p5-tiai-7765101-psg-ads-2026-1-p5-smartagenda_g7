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
import { CreateTarefa, LocaleStringToTimestamp, GetSubtarefas, CreateTarefaJSON, GetUniqueID } from '../services/TarefaService.ts';
import StorageAPI, { CarregarTarefas } from '../services/LocalStorageService';
import 'react-native-get-random-values';
import SubTaskList from './SubTaskList.tsx';
import { TrySalvarTarefa, TrySalvar } from '../services/SaveControlService.ts';
import TaskTreeView from './TaskTreeView.tsx';

type Props = {
    tarefa?: Tarefa | null;
    onClose?: (result?: Tarefa) => void;
    depthDisplay?: string;
    onUnsavedChanges?: (hasUnsavedChanges: boolean) => void;
};

export default function TaskManager({ tarefa, onClose, depthDisplay, onUnsavedChanges }: Props) {
    const CreateTarefaControlled = useCallback(async () => {
        let id = await GetUniqueID();

        return CreateTarefa(
            id,
            '',
            Date.now(),
            Date.now() + 7 * 24 * 60 * 60 * 1000
        )
    }, []);

    const isCreating = !tarefa;
    //const [unsavedChanges, setUnsavedChanges] = useState(isCreating);
    const unsavedChanges = useRef(isCreating);
    useEffect(() => {
        onUnsavedChanges?.(unsavedChanges.current);
    }, [unsavedChanges.current, onUnsavedChanges]);
    const unsavedSubtaskChanges = useRef(false);

    const [task, setTask] = useState<Tarefa | null>(
        tarefa ?? null
    );

    // relacionados aos textos que precisam ser transformados nos campos
    const [textDates, setTextDates] = useState<Record<string, string>>({});
    const [categoriesString, setCategoriesString] = useState('');
    const [descriptionHeight, setDescriptionHeight] = useState(40);

    // useStates relacionados a subtarefas.
    const [Subtasks, setSubtasks] = useState<Tarefa[]>([]);
    const [selectedSubtask, setSelectedSubtask] = useState<Tarefa | null>(null);

    // taskTreeView
    const [openTreeView, setOpenTreeView] = useState(false);

    useEffect(() => {
        if (tarefa) {
            setTask(tarefa);
        }
    }, [tarefa]);

    useEffect(() => {
        if (task) return;

        // para preencher com uma nova tarefa vazia caso não tenha sido passada nenhuma tarefa via props.
        const initialize = async () => {
            const newTask = await CreateTarefaControlled();
            setTask(newTask);
        }
        initialize();
    }, [task, CreateTarefaControlled]);

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
            if (Subtasks.length != baseTask.subtarefas.length) {
                const getallsubtasks = async () => {
                    let subtasks = await GetSubtarefas(baseTask!);
                    console.log("updated with ", subtasks?.length, " subtasks");
                    if (subtasks && subtasks.length > 0) setSubtasks(subtasks);
                }
                getallsubtasks();
            }
        }

    }, [task, task?.subtarefas]);

    const newSubtask = useCallback(() => {
        const createSubtask = async () => {
            let subtask = await CreateTarefaControlled();
            subtask.isSubtarefa = true;
            setSelectedSubtask(subtask);
            console.log("created subtask: " + subtask.id);
        }
        createSubtask();
    }, []);

    const tryCloseSubtask = useCallback(() => {
        console.log("exiting subtask, unsaved changes:" + unsavedSubtaskChanges.current);
        if (unsavedSubtaskChanges.current) {
            Alert.alert(
                'Tem certeza que deseja cancelar a edição da tarefa?',
                `Todas as alterações não salvas serão perdidas.`,
                [
                    { text: 'Não', style: 'cancel' },
                    {
                        text: 'Sim, sair sem salvar', onPress: () => {
                            unsavedSubtaskChanges.current = false;
                            setSelectedSubtask(null);
                        }
                    }
                ]
            );
            return;
        }
        unsavedSubtaskChanges.current = false;
        setSelectedSubtask(null);
    }, [unsavedSubtaskChanges.current]);

    const saveSubtask = useCallback(async (subtask?: Tarefa) => {
        console.log("subtask save cancelation: " + !selectedSubtask + ", " + !subtask);
        let newtask: Tarefa | undefined;
        if (!subtask) {//if (!selectedSubtask || !subtask) {
            let updated = await GetSubtarefas(task!);
            await setSubtasks(updated || []);

            await setTask(prevTask => {
                if (!prevTask) return prevTask;
                let updatedStatus: Tarefa['estado'] = 'EmProgresso';
                if (updated) {
                    if (updated.every(t => t.estado === 'Finalizado'))
                        updatedStatus = 'Finalizado';
                    else if (updated.every(t => t.estado === 'NaoIniciado'))
                        updatedStatus = 'NaoIniciado';

                    newtask = {
                        ...prevTask,
                        estado: updatedStatus,
                        data_finalizado: updatedStatus === 'Finalizado' ? Date.now() : undefined,
                        subtarefas: updated.map(t => t.id)
                    };
                }
                else {
                    newtask = {
                        ...prevTask,
                        estado: updatedStatus,
                        subtarefas: []
                    };
                }
                return newtask;
            });
            console.log("new subtask count: ", newtask?.subtarefas?.length);
            if (newtask) await TrySalvarTarefa(newtask);
            tryCloseSubtask();
            return;
        }

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

        await setSubtasks(updatedSubtasks);

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
        if (newtask) await TrySalvarTarefa(newtask);
        tryCloseSubtask();
    }, [selectedSubtask, setTask, tryCloseSubtask]);

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
        }
        catch (error) {
            console.log(error);
        }
        if (onClose) {
            onClose();
        }
    }, []);

    const importTasksJSON = useCallback(async (tarefas: Tarefa[]) => {
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
    }, []);

    const handleExit = async () => {
        let errorField = '';
        if (!task?.titulo) errorField = 'Título';
        else if (!task?.data_vencimento) errorField = 'Data de Vencimento';

        if (errorField !== '') {
            Alert.alert(
                'Campos Obrigatórios',
                `Por favor, preencha o campo "${errorField}".`,
                [{ text: 'OK', style: 'cancel' }]
            );
            return;
        }

        try {
            if (task) {
                let updated = task;
                if (depthDisplay) {
                    updated.isSubtarefa = true;
                }

                unsavedChanges.current = false;
                await TrySalvarTarefa(updated);

                if (onClose) {
                    onClose(updated);
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
                            Subtasks: ({Subtasks.length})
                        </Text>
                        <View >
                            <SubTaskList tarefaPai={task!} ModalType="edit"
                                depthDisplay={depthDisplay ? depthDisplay + tarefa?.titulo + " > " : tarefa?.titulo + " > "}
                                onUpdateSubtask={saveSubtask} />
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
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={[styles.container, styles.coloredBackground]}>
                <Text style={styles.secondaryText}>{depthDisplay}</Text>
                {!isCreating && (<KebabOptionsMenu onOptionPressed={handleKebabMenu} />)}
                <Text style={styles.title}> {isCreating ?
                    (depthDisplay ? 'Criar Sub-Tarefa' : 'Criar Tarefa') :
                    (depthDisplay ? 'Editar Sub-Tarefa' : 'Editar Tarefa')}
                </Text>

                {isCreating && <ImportTasksModal onImport={importTasksJSON}></ImportTasksModal>}

                {/*<TouchableOpacity onPress={() => CreateTarefaJSON("ye")}><Text>TEST BUTTON</Text></TouchableOpacity>*/}

                <Modal visible={selectedSubtask !== null} transparent={true} animationType="slide" onRequestClose={tryCloseSubtask}>
                    <TaskManager tarefa={null} onClose={saveSubtask} depthDisplay={depthDisplay ? depthDisplay + tarefa?.titulo + " > " : tarefa?.titulo + " > "} onUnsavedChanges={(e) => { unsavedSubtaskChanges.current = e; }} />
                </Modal>

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
                        style={[styles.button, styles.highlightColor2]}
                        onPress={handleExit}
                    >
                        <Text style={styles.label}>{isCreating ? 'Salvar Nova Tarefa' : 'Salvar Alterações'}</Text>
                    </TouchableOpacity>
                </View>

                {/*
                <TouchableOpacity style={[styles.button, styles.highlightColor2]} onPress={() => setOpenTreeView(true)}><Text style={styles.label}>Visualização de Árvore</Text></TouchableOpacity>
                */}
            </View>

            {!isCreating && (
                <Modal visible={openTreeView} transparent={true} animationType="slide" onRequestClose={() => setOpenTreeView(false)}>
                    <TaskTreeView tarefa={task} />
                </Modal>
            )}

        </ScrollView >
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