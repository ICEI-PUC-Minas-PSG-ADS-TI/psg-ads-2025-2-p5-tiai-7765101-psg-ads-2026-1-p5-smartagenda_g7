// Serviço para Funções controladas de salvamento de tarefas, tanto em memória (Async Storage) quanto em arquivo local (JSON), e possivelmente no futuro, Firebase Firestore.
import { Alert, DeviceEventEmitter } from 'react-native';
import { Tarefa } from '../types/tarefa.ts';
import { FilterSubTarefasArray, OrdenarTarefas, GetFinalizadas } from '../services/TarefaService';
import StorageAPI from '../services/LocalStorageService';
import { buscarTarefasFirestore, salvarTarefaFirestore, sincronizarTarefas, deletarTarefaFirestore, IsAuth, GetCurrentUser } from '../services/FirestoreService';
import { ForceCancelAllNotifications } from './NotificationService.ts';


/**
 * Tenta sincronizar o banco AsyncStorage com os demais bancos.
 * @returns Lista atualizada das tarefas. Em caso de erro severo, retorna a lista vazia.
 */
export async function TrySalvar(ForceRefresh?: boolean): Promise<Tarefa[]> {
    try {
        console.log("[SAVECONTROL] Iniciando sincronização de tarefas...");
        //const isAuth = IsAuth();
        const tarefasLocais = await StorageAPI.CarregarTarefas() || {};
        await StorageAPI.SalvarTarefas(tarefasLocais);
        let local = await StorageAPI.CarregarTarefas();

        if (GetCurrentUser()) {
            let firebase = await buscarTarefasFirestore();
            let onlyfirebase = firebase ? firebase.filter(f => !local || !local[f.id]) : [];
            if (onlyfirebase.length > 0) {
                console.log(`[SAVECONTROL] ${onlyfirebase.length} tarefas encontradas no Firebase que não existem localmente. Deletando essas tarefas do Firebase para evitar conflitos futuros...`);
            }
            // Prioridade atual: Local > Firebase. Tarefas locais todas permanecem, e tarefas que só existem no Firebase são deletadas
            await onlyfirebase.forEach(async t => {
                await deletarTarefaFirestore(t.id).catch((e) => { console.log("[SAVECONTROL] Falha ao deletar tarefa do Firestore durante sincronização: " + e) });
            })
            try {
                //console.log('[SAVECONTROL] Salvado no firebase..');
                await sincronizarTarefas(tarefasLocais);
            }
            catch (err) {
                console.log("[SAVECONTROL] Erro ao salvar tarefas no Firestore (Mas salvo localmente OK): " + err);
            }
        }

        //console.log("Emitting tarefasUpdated from TrySalvar");
        if (ForceRefresh)
            DeviceEventEmitter.emit('tarefasUpdated');
        return await StorageAPI.CarregarTarefasArray() || [];
    }
    catch (err) {
        console.log("[SAVECONTROL] Erro ao salvar tarefa: " + err);
        return await StorageAPI.CarregarTarefasArray() || [];
    }
}
/**
 * Tenta salvar uma tarefa, tanto localmente quanto no Firestore.
 * @param result tarefa a ser salva.
 * @returns Lista atualizada das tarefas. Em caso de erro severo, retorna a lista vazia.
 */
export async function TrySalvarTarefa(result: Tarefa, ForceRefresh?: boolean): Promise<Tarefa[]> {
    try {
        const tarefasLocais = await StorageAPI.CarregarTarefas() || {};
        tarefasLocais[result.id] = result;
        await StorageAPI.SalvarTarefas(tarefasLocais);
        try {
            if (GetCurrentUser()) {
                salvarTarefaFirestore(result).catch(() => { });
            }
        }
        catch (err) {
            console.log("[SAVECONTROL] Erro ao salvar tarefa no Firestore (Mas salvo localmente OK): " + err);
        }
        if (ForceRefresh)
            DeviceEventEmitter.emit('tarefasUpdated');
        //console.log("Emitting tarefasUpdated from TrySalvarTarefa");
        return await StorageAPI.CarregarTarefasArray() || [];
    }
    catch (err) {
        console.log("[SAVECONTROL] Erro ao salvar tarefa: " + err);
        return await StorageAPI.CarregarTarefasArray() || [];
    }
}


export async function TryCarregarTarefasArray(unfiltered?: boolean): Promise<Tarefa[]> {
    try {
        const isAuth = IsAuth();
        if (!isAuth) {
            //return await StorageAPI.CarregarTarefasArray() || []
        }

        let res;
        let tarefasFirebase;
        let tarefasLocais;

        try {
            if (GetCurrentUser()) {
                tarefasFirebase = await buscarTarefasFirestore() || [];
            }
        }
        catch (err) {
            console.log("[SAVECONTROL] Erro ao carregar tarefas do Firestore: " + err);
        }

        try {
            tarefasLocais = await StorageAPI.CarregarTarefasArray() || [];
        }
        catch (err) {
            console.log("[SAVECONTROL] Erro ao carregar tarefas locais: " + err);
        }

        res = await CompareAndCheck(tarefasFirebase, tarefasLocais);

        if (res) {
            if (res === tarefasFirebase) await ForceCancelAllNotifications();

            // sincronizar dados
            const tarefasMap: Record<string, Tarefa> = {};
            res.forEach(t => { tarefasMap[t.id] = t; });
            await StorageAPI.SalvarTarefas(tarefasMap);
            // TODO: sincronizar com firestore

            if (unfiltered) return OrdenarTarefas(res);
            return OrdenarTarefas(await FilterSubTarefasArray(res, true));
        }

        return [];
    }
    catch (err) {
        console.log("[SAVECONTROL] Erro ao carregar tarefas: " + err);
        return [];
    }
}

/**
 * Compara duas listas de tarefas, caso se diferem, há decisões em qual manter sobre a outra
 * @param newTasks Novas tarefas, geralmente do firebase
 * @param oldTasks Velhas tarefas, geralmente locais
 * @returns Lista escolhida como correta para ser mantida
 */
export async function CompareAndCheck(newTasks?: Tarefa[], oldTasks?: Tarefa[]): Promise<Tarefa[]> {
    if (newTasks && newTasks.length > 0) {
        if (oldTasks && oldTasks.length > 0) {
            // Ambas as fontes têm tarefas, comparar e decidir qual usar
            switch (await CompareAndCheckInner(newTasks, oldTasks)) {
                case -1: //firebase wins
                    console.log("[SAVECONTROL] Diferenças detectadas, mas optando por usar os dados do Firebase.");
                    return newTasks;
                case 1: //local wins
                    console.log("[SAVECONTROL] Diferenças detectadas, mas optando por usar os dados Locais.");
                    return oldTasks;
                case 0: //draw, use firebase
                    console.log("[SAVECONTROL] Nenhuma diferença significativa detectada entre os dados locais e do Firebase, usando os dados do Firebase por padrão.");
                    return newTasks;
            }
        }
        else {
            // Apenas o Firebase tem tarefas, usar essas
            console.log("[SAVECONTROL] Nenhuma tarefa encontrada localmente, mas tarefas encontradas no Firebase, usando os dados do Firebase.");
            return newTasks;
        }
    }
    else if (oldTasks && oldTasks.length > 0) {
        // Apenas o local tem tarefas, usar essas
        console.log("[SAVECONTROL] Nenhuma tarefa encontrada no Firebase, mas tarefas encontradas localmente, usando os dados locais.");
        return oldTasks;
    }
    // what
    console.log("[SAVECONTROL] Nenhuma tarefa encontrada no Firestore ou localmente.");
    return [];
}

async function CompareAndCheckInner(tarefasFirebase: Tarefa[], tarefasLocais: Tarefa[]): Promise<number> {
    let comparasionstring = "";
    const countFirebase = tarefasFirebase.length;
    const countLocais = tarefasLocais.length;
    const finalizadasFirebase = GetFinalizadas(tarefasFirebase).length;
    const finalizadasLocais = GetFinalizadas(tarefasLocais).length;

    // deve ser bom expandir essa verificação mais tarde, mas por enquanto somente será verificado o  abaixo:
    if (countFirebase != countLocais || finalizadasFirebase != finalizadasLocais) {
        comparasionstring += `Salvo em Nuvem: ${countFirebase} tarefas (${finalizadasFirebase} finalizadas) \nSalvo Localmente: ${countLocais} tarefas (${finalizadasLocais} finalizadas). `;
        let res = await new Promise<number>((resolve) => {
            Alert.alert(
                'Conflito de sincronização',
                [
                    'Encontramos diferenças entre os dados salvos neste dispositivo e os dados salvos na nuvem.',
                    '',
                    comparasionstring,
                    '',
                    'Escolha qual versão deseja manter:'
                ].join('\n'),
                [
                    {
                        text: 'Usar dados da nuvem',
                        onPress: () => resolve(-1),
                    },
                    {
                        text: 'Usar dados locais',
                        onPress: () => resolve(1),
                    }
                ],
                {
                    cancelable: false
                }
            )
        });
        return res;
    }

    return 0;
}

export default {
    TrySalvar,
    TrySalvarTarefa,
    TryCarregarTarefasArray
}