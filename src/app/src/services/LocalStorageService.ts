// Serviço para Salvamento em memória temporária E salvamento em arquivo local
import type { Tarefa } from '../types/tarefa';
import AS from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { GetCurrentUser } from './FirestoreService';

// ------------- FUNÇÕES AUXILIARES DE CAMINHO (MULTI-USUÁRIO) ------------

const getStorageKey = () => {
    const user = GetCurrentUser();
    return user ? `tarefas_${user.uid}` : 'tarefas_guest';
};

const getFilePath = () => {
    const user = GetCurrentUser();
    return user
        ? `${RNFS.DocumentDirectoryPath}/tarefas_${user.uid}.json`
        : `${RNFS.DocumentDirectoryPath}/tarefas_guest.json`;
};

const configpath = `${RNFS.DocumentDirectoryPath}/userSettings.json`;


// ------------- FUNÇÕES DE ASYNCSTORAGE (SALVAMENTO EM MEMÓRIA) ------------

/**
 * Carrega os dados necessários para o funcionamento
 */
export async function Iniciar() {
    try {
        const localData = await CarregarTarefasLocal();
        await AS.setItem(getStorageKey(), JSON.stringify(localData || {}));
        const localConfig = await CarregarConfiguracao();
        await AS.setItem("userSettings", JSON.stringify(localConfig || {}));
    } catch (err) {
        console.log("Erro ao carregar os dados iniciais: " + err);
    }
}

export async function SalvarTarefas(tarefas: Record<string, Tarefa>) {
    try {
        await AS.setItem(getStorageKey(), JSON.stringify(tarefas));
        await SalvarTarefasLocal(tarefas);
        //console.log("[SALVARTAREFAS]Tarefas salvas: ", Object.keys(tarefas).length);
    } catch (err) {
        console.log("Erro ao salvar tarefas no Async Storage: " + err);
    }
}

export async function SalvarTarefa(tarefa: Tarefa) {
    try {
        let tarefas = await CarregarTarefas();
        if (!tarefas) tarefas = {};
        tarefas[tarefa.id] = tarefa;
        await AS.setItem(getStorageKey(), JSON.stringify(tarefas));
        await SalvarTarefasLocal(tarefas);
        //console.log("[SALVARTAREFAS]Tarefas salvas: ", Object.keys(tarefas).length);
    } catch (err) {
        console.log("Erro ao salvar tarefas no Async Storage: " + err);
    }
}

export async function TryGetTarefa(id: string): Promise<Tarefa | null> {
    let tarefas = await CarregarTarefas();
    if (tarefas && tarefas[id]) return tarefas[id];
    return null;
}

/**
 * Carrega as Tarefas salvas no Async Storage (memória).
 */
export async function CarregarTarefasArray(): Promise<Tarefa[] | null> {
    try {
        let d = await CarregarTarefas();
        if (d) return Object.values(d);
        return null;
    } catch (err) {
        console.log("Erro ao carregar tarefas no Async Storage como Array: " + err);
        return null;
    }
}

/**
 * Carrega as Tarefas salvas no Async Storage (memória). Caso não, tenta carrega-la de outros meios.
 */
export async function CarregarTarefas(): Promise<Record<string, Tarefa> | null> {
    try {
        let data = await AS.getItem(getStorageKey());
        if (data) return JSON.parse(data);

        console.log("Tarefas não carregadas em memória, buscando arquivos locais...");
        let fallbackdata = await CarregarTarefasLocal();
        if (fallbackdata) {
            await AS.setItem(getStorageKey(), JSON.stringify(fallbackdata));
            return fallbackdata;
        }

        return null;
    } catch (err) {
        console.log("Erro ao carregar tarefas no Async Storage: " + err);
        return null;
    }
}

export async function SalvarConfiguracao(cfg: any) {
    try {
        await AS.setItem("userSettings", JSON.stringify(cfg));
        await SalvarConfiguracaoLocal(cfg);
    } catch (err) {
        console.log("Erro ao salvar tarefas no Async Storage: " + err);
    }
}

export async function CarregarConfiguracao(): Promise<any> {
    try {
        let data = await AS.getItem("userSettings");
        if (data) return JSON.parse(data);

        let fallbackdata = await CarregarConfiguracaoLocal();
        if (fallbackdata) {
            await AS.setItem("userSettings", JSON.stringify(fallbackdata));
            return fallbackdata;
        }

        return null;
    } catch (err) {
        console.log("Erro ao carregar configurações no Async Storage: " + err);
        return null;
    }
}

export async function SalvarTema(themeType: string) {
    try {
        await AS.setItem("userTheme", themeType);
    } catch (err) {
        console.log("Erro ao salvar tema no Async Storage: " + err);
    }
}

export async function CarregarTema(): Promise<string | null> {
    try {
        let theme = await AS.getItem("userTheme");
        return theme;
    } catch (err) {
        console.log("Erro ao carregar tema no Async Storage: " + err);
        return null;
    }
}

/**
 * Deleta uma tarefa, removendo do Async Storage, mas não imediatamente localmente ou no firebase, mas no proximo salvamento local, será atualizado
 * @param id Id da tarefa a ser deletada
 * @returns 
 */
export async function DeletarTarefa(id: string, ignoreSubtasks?: boolean) {
    try {
        // tirar a referencia das tarefas pai
        let tarefas = await CarregarTarefas();
        if (!tarefas) return;
        console.log("Tarefas antes de deletar: ", Object.keys(tarefas).length);
        let parentsToUpdate = Object.values(tarefas).filter(t => t.subtarefas?.includes(id));
        Object.values(tarefas).forEach(tarefa => {
            if (tarefa.subtarefas) {
                tarefa.subtarefas = tarefa.subtarefas.filter(subId => subId !== id);
            }
        });
        console.log("[LocalStorageService] Removido Referencias à tarefa ", id);
        await DeletarTarefaActual(tarefas, id, ignoreSubtasks);
        //console.log(JSON.stringify(tarefas, null, 2));
        await SalvarTarefas(tarefas);
    }
    catch (e) {
        console.log("Erro ao deletar tarefa: " + e);
    }
}

async function DeletarTarefaActual(tarefas: Record<string, Tarefa>, id: string, ignoreSubtasks?: boolean) {
    if (!tarefas) return;
    if (!ignoreSubtasks) {
        if (!tarefas[id]) return;
        const subtarefas = tarefas[id].subtarefas ?? [];

        for (const subId of subtarefas) {
            if (tarefas[subId]) {
                await DeletarTarefaActual(tarefas, subId); // confiando que não é possível ter loops de referencia
            }
        }
    }
    delete tarefas[id];
    console.log("[LocalStorageService] Deletando tarefa ", id);
}

export async function ClearCacheData() {
    try {
        await AS.removeItem(getStorageKey());
        await AS.removeItem('tarefas_guest');
    } catch (err) {
        console.log("Erro ao limpar cache: " + err);
    }
}

export async function TarefaExists(id: string): Promise<boolean> {
    let t = await CarregarTarefas();
    return t ? !!t[id] : false;
}

// ------------- FUNÇÕES DE FILE SERVICE (SALVAMENTO LOCAL) ------------

/**
 * Salva as tarefas do contexto atual localmente no dispositivo.
 */
export async function SalvarTarefasLocal(tarefas: Record<string, Tarefa>) {
    try {
        let json = JSON.stringify(tarefas);
        await RNFS.writeFile(getFilePath(), json);
    } catch (err) {
        console.log("Erro ao salvar tarefas localmente no File Service: " + err);
    }
}

/**
 * Carrega as tarefas salvas localmente no dispositivo, e as retorna
 */
export async function CarregarTarefasLocal(): Promise<Record<string, Tarefa> | null> {
    try {
        const exists = await RNFS.exists(getFilePath());
        if (!exists) return null;

        let json = await RNFS.readFile(getFilePath());
        return json ? JSON.parse(json) : null;
    } catch (err) {
        console.log("Erro ao Carregar tarefas Localmente no File Service: " + err);
        return null;
    }
}

/**
 * Carrega as tarefas salvas localmente no dispositivo, e as retorna
 */
export async function CarregarTarefasLocalGuest(): Promise<Record<string, Tarefa> | null> {
    try {
        const exists = await RNFS.exists(`${RNFS.DocumentDirectoryPath}/tarefas_guest.json`);
        if (!exists) return null;

        let json = await RNFS.readFile(`${RNFS.DocumentDirectoryPath}/tarefas_guest.json`);
        return json ? JSON.parse(json) : null;
    } catch (err) {
        console.log("Erro ao Carregar tarefas Localmente no File Service: " + err);
        return null;
    }
}

export async function SalvarConfiguracaoLocal(config: any) {
    try {
        let json = JSON.stringify(config);
        await RNFS.writeFile(configpath, json);
    } catch (err) {
        console.log("Erro ao salvar configurações localmente no File Service: " + err);
    }
}

export async function CarregarConfiguracaoLocal(): Promise<any> {
    try {
        const exists = await RNFS.exists(configpath);
        if (!exists) return null;

        let json = await RNFS.readFile(configpath);
        return json ? JSON.parse(json) : null;
    } catch (err) {
        console.log("Erro ao Carregar configurações Localmente no File Service: " + err);
        return null;
    }
}

export async function ClearLocalData() {
    try {
        const exists = await RNFS.exists(getFilePath());
        const existsGuest = await RNFS.exists(`${RNFS.DocumentDirectoryPath}/tarefas_guest.json`);
        if (exists) {
            await RNFS.writeFile(getFilePath(), '');
        }
        if (existsGuest) {
            await RNFS.writeFile(`${RNFS.DocumentDirectoryPath}/tarefas_guest.json`, '');
        }
    }
    catch (err) {
        console.log("Erro ao limpar dados locais: " + err);
    }
}

// Somente para poder chamar as funções como classe
export default {
    TryGetTarefa,
    CarregarTarefas,
    CarregarTarefasLocal,
    CarregarTarefasLocalGuest,
    CarregarTarefasArray,
    SalvarTarefas,
    SalvarTarefa,
    SalvarTarefasLocal,
    DeletarTarefa,
    Iniciar,
    CarregarConfiguracao,
    CarregarConfiguracaoLocal,
    SalvarConfiguracao,
    SalvarConfiguracaoLocal,
    ClearLocalData,
    ClearCacheData,
    TarefaExists,
    SalvarTema,
    CarregarTema
}