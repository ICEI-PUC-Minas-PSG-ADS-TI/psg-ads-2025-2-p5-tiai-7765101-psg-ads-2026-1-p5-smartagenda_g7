// Serviço para Salvamento em memória temporária E salvamento em arquivo local
import type { Tarefa } from '../types/tarefa';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AS from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

const STORAGE_KEY = 'tarefas';
const PATH = `${RNFS.DocumentDirectoryPath}/tarefas.json`;


// ------------- FUNÇÕES DE ASYNCSTORAGE (SALVAMENTO EM MEMÓRIA)

/**
 * Carrega os dados necessários para o funcionamento
 */
export async function Iniciar()
{
    try
    {
        await AS.setItem(STORAGE_KEY, JSON.stringify(await CarregarTarefasLocal()));
    }
    catch (err)
    {
        console.log("Erro ao carregar os dados iniciais: " + err);
    }
}

export async function SalvarTarefas(tarefas: Record<string, Tarefa>)
{
    try
    {
        await AS.setItem(STORAGE_KEY, JSON.stringify(tarefas));
        await SalvarTarefasLocal(tarefas);
    }
    catch (err)
    {
        console.log("Erro ao salvar tarefas no Async Storage: " + err);
    }
}

/**
 * Carrega as Tarefas salvas no Async Storage (memória). Caso não, tenta carrega-la de outros meios.
 * @returns (Dicionario de <string, Tarefa>. Onde a chave é o ID da tarefa)
 */
export async function CarregarTarefasArray(): Promise<Tarefa[] | null>
{
    try
    {
        let d = await CarregarTarefas();
        if (d) return Object.values(d);
        return null;
    }
    catch (err)
    {
        console.log("Erro ao carregar tarefas no Async Storage como Array: " + err);
        return null;
    }
}

/**
 * Carrega as Tarefas salvas no Async Storage (memória). Caso não, tenta carrega-la de outros meios.
 * @returns (Dicionario de <string, Tarefa>. Onde a chave é o ID da tarefa)
 */
export async function CarregarTarefas(): Promise<Record<string, Tarefa> | null>
{
    try
    {
        let data = await AS.getItem(STORAGE_KEY);
        if (data) return JSON.parse(data);
        
        console.log("Tarefas não carregadas em memória, buscando arquivos locais...");
        let fallbackdata = await CarregarTarefasLocal();
        if (fallbackdata) {
            AS.setItem(STORAGE_KEY, JSON.stringify(fallbackdata));
            return fallbackdata;
        }

        // A adicionar uma busca pelos dados salvos no Firebase

        return null;
    }
    catch (err)
    {
        console.log("Erro ao carregar tarefas no Async Storage: " + err);
        return null;
    }
}

// ------------- FUNÇÕES DE FILE SERVICE (SALVAMENTO LOCAL) ------------

/**
 * Salva as tarefas do contexto atual localmente no dispositivo.
 * (Dicionario de <string, Tarefa>. Onde a chave é o ID da tarefa)
 */
export async function SalvarTarefasLocal(tarefas: Record<string, Tarefa>)
{
    try
    {
        let json = JSON.stringify(tarefas);
        await RNFS.writeFile(PATH, json);
    }
    catch (err)
    {
        console.log("Erro ao salvar tarefas localmente no File Service: " + err);
    }
}

/**
 * Carrega as tarefas salvas localmente no dispositivo, e as retorna
 * @returns (Dicionario de <string, Tarefa>. Onde a chave é o ID da tarefa)
 */
export async function CarregarTarefasLocal(): Promise<Record<string, Tarefa> | null> 
{ 
    try
    {
        let json = await RNFS.readFile(PATH);
        return json ? JSON.parse(json) : null;
    }
    catch (err)
    {
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