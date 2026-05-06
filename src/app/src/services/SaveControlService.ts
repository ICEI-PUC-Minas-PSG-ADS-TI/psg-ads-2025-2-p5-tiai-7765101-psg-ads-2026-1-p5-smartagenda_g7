// Serviço para Funções controladas de salvamento de tarefas, tanto em memória (Async Storage) quanto em arquivo local (JSON), e possivelmente no futuro, Firebase Firestore.

import auth from '@react-native-firebase/auth';
import { Alert } from 'react-native';
import { Tarefa } from '../types/tarefa.ts';
import { FilterSubTarefasArray, OrdenarTarefas, GetFinalizadas } from '../services/TarefaService';
import StorageAPI from '../services/LocalStorageService';
import { buscarTarefasFirestore, salvarTarefaFirestore, sincronizarTarefas, deletarTarefaFirestore, IsAuth } from '../services/FirestoreService';


/**
 * Tenta sincronizar o banco AsyncStorage com os demais bancos.
 * @returns Lista atualizada das tarefas. Em caso de erro severo, retorna a lista vazia.
 */
export async function TrySalvar(): Promise<Tarefa[]> {
    try {
        console.log("[SAVECONTROL] Iniciando sincronização de tarefas...");
        const isAuth = IsAuth();
        const tarefasLocais = await StorageAPI.CarregarTarefas() || {};
        await StorageAPI.SalvarTarefas(tarefasLocais);
        let local = await StorageAPI.CarregarTarefas();
        if (isAuth) {
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
                await sincronizarTarefas(tarefasLocais);
            }
            catch (err) {
                console.log("[SAVECONTROL] Erro ao salvar tarefa no Firestore (Mas salvo localmente OK): " + err);
            }
        }
        else console.log("Usuário não autenticado, buscando somente tarefas locais");

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
export async function TrySalvarTarefa(result: Tarefa): Promise<Tarefa[]> {
    try {
        const tarefasLocais = await StorageAPI.CarregarTarefas() || {};
        tarefasLocais[result.id] = result;
        await StorageAPI.SalvarTarefas(tarefasLocais);
        const isAuth = IsAuth();
        if (isAuth) {
            try {
                salvarTarefaFirestore(result).catch(() => { });
            }
            catch (err) {
                console.log("[SAVECONTROL] Erro ao salvar tarefa no Firestore (Mas salvo localmente OK): " + err);
            }
        }

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
        if (!isAuth)
        {
            //return await StorageAPI.CarregarTarefasArray() || []
        }

        let res;
        let tarefasFirebase;
        let tarefasLocais;

        try {
            tarefasFirebase = await buscarTarefasFirestore() || [];
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

        if (tarefasFirebase && tarefasFirebase.length > 0) {
            if (tarefasLocais && tarefasLocais.length > 0) {
                // Ambas as fontes têm tarefas, comparar e decidir qual usar
                switch (CompareAndCheck(tarefasFirebase, tarefasLocais)) {
                    case -1: //firebase wins
                        console.log("[SAVECONTROL] Diferenças detectadas, mas optando por usar os dados do Firebase.");
                        res = tarefasFirebase;
                        break;
                    case 1: //local wins
                        console.log("[SAVECONTROL] Diferenças detectadas, mas optando por usar os dados Locais.");
                        res = tarefasLocais;
                        break;
                    case 0: //draw, use firebase
                        console.log("[SAVECONTROL] Nenhuma diferença significativa detectada entre os dados locais e do Firebase, usando os dados do Firebase por padrão.");
                        res = tarefasFirebase;
                        break;
                }
            }
            else {
                // Apenas o Firebase tem tarefas, usar essas
                console.log("[SAVECONTROL] Nenhuma tarefa encontrada localmente, mas tarefas encontradas no Firebase, usando os dados do Firebase.");
                res = tarefasFirebase;
            }
        }
        else if (tarefasLocais && tarefasLocais.length > 0) {
            // Apenas o local tem tarefas, usar essas
            console.log("[SAVECONTROL] Nenhuma tarefa encontrada no Firebase, mas tarefas encontradas localmente, usando os dados locais.");
            res = tarefasLocais;
        }
        else {
            // what
            console.log("[SAVECONTROL] Nenhuma tarefa encontrada no Firestore ou localmente.");
        }

        if (res) {
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

export function CompareAndCheck(tarefasFirebase: Tarefa[], tarefasLocais: Tarefa[]): number {
    let comparasionstring = "";
    const countFirebase = tarefasFirebase.length;
    const countLocais = tarefasLocais.length;
    const finalizadasFirebase = GetFinalizadas(tarefasFirebase).length;
    const finalizadasLocais = GetFinalizadas(tarefasLocais).length;

    // deve ser bom expandir essa verificação mais tarde, mas por enquanto somente será verificado o  abaixo:
    if (countFirebase != countLocais || finalizadasFirebase != finalizadasLocais) {
        comparasionstring += `Salvo em Nuvem: ${countFirebase} tarefas (${finalizadasFirebase} finalizadas) | Salvo Localmente: ${countLocais} tarefas (${finalizadasLocais} finalizadas). `;
        let res;

        Alert.alert(
            'Conflito de arquivos detectado!',
            `Foram encontradas diferenças entre as tarefas salvas localmente e as tarefas salvas na nuvem. ${comparasionstring} Qual fonte de dados você gostaria de usar?`,
            [
                { text: 'Dados em Nuvem', onPress: () => res = -1 },
                { text: 'Dados Locais', onPress: () => res = 1 }
            ]
        );
    }

    return 0;
}

export default {
    TrySalvar,
    TrySalvarTarefa,
    TryCarregarTarefasArray
}