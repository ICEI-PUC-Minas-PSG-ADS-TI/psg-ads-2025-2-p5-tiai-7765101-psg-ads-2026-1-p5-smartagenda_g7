// Serviço para Salvamento em memória temporária E salvamento em arquivo local
import type { Tarefa } from '../types/tarefa';
import AS from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import auth from '@react-native-firebase/auth';

// ------------- FUNÇÕES AUXILIARES DE CAMINHO (MULTI-USUÁRIO) ------------

const getStorageKey = () => {
    const user = auth().currentUser;
    return user ? `tarefas_${user.uid}` : 'tarefas_guest';
};

const getFilePath = () => {
    const user = auth().currentUser;
    return user 
        ? `${RNFS.DocumentDirectoryPath}/tarefas_${user.uid}.json` 
        : `${RNFS.DocumentDirectoryPath}/tarefas_guest.json`;
};


// ------------- FUNÇÕES DE ASYNCSTORAGE (SALVAMENTO EM MEMÓRIA) ------------

/**
 * Carrega os dados necessários para o funcionamento
 */
export async function Iniciar() {
    try {
        const localData = await CarregarTarefasLocal();
        await AS.setItem(getStorageKey(), JSON.stringify(localData || {}));
    } catch (err) {
        console.log("Erro ao carregar os dados iniciais: " + err);
    }
}

export async function SalvarTarefas(tarefas: Record<string, Tarefa>) {
    try {
        await AS.setItem(getStorageKey(), JSON.stringify(tarefas));
        await SalvarTarefasLocal(tarefas);
    } catch (err) {
        console.log("Erro ao salvar tarefas no Async Storage: " + err);
    }
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

// Somente para poder chamar as funções como classe
export default {
    CarregarTarefas,
    CarregarTarefasLocal,
    CarregarTarefasArray,
    SalvarTarefas,
    SalvarTarefasLocal,
    Iniciar
}