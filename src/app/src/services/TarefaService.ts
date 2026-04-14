// Funções relacionadas às Tarefas

import type { Tarefa } from '../types/tarefa';
import StorageAPI from './LocalStorageService';

export function CreateTarefa(id:string, titulo: string, data_criado: number, data_vencimento: number, isSubTarefa?: boolean, categorias?: string[], descricao_geral?: string, data_finalizado?: number): Tarefa
{
    return {
        id,
        titulo,
        data_criado,
        data_vencimento,
        isSubtarefa: isSubTarefa || false,
        categorias,
        descricao_geral,
        data_finalizado,
        estado: data_finalizado != undefined && data_finalizado > 0 ? "Finalizado" : "NaoIniciado"
    }
}

/**
 * Obtém as subtarefas diretas de uma tarefa específica.
 * @param id ID da tarefa cujas subtarefas se deseja obter.
 * @returns array de subtarefas, ou null se a tarefa não tiver subtarefas ou se ocorrer algum erro durante o processo.
 */
export async function GetSubtarefasById(id: string): Promise<Tarefa[] | null>
{
    let tarefas = await StorageAPI.CarregarTarefas();
    let t;
    if (!tarefas) return null;
        t = tarefas[id];
    if (!t) return null;
    
    return GetSubtarefas(t);
}

/**
 * Obtém as subtarefas diretas de uma tarefa específica.
 * @param tarefa 
 * @returns array de subtarefas, ou null se a tarefa não tiver subtarefas ou se ocorrer algum erro durante o processo.
 */
export async function GetSubtarefas(tarefa: Tarefa): Promise<Tarefa[] | null>
{
    if (!tarefa.subtarefas || tarefa.subtarefas.length === 0) return null;

    let tarefas = await StorageAPI.CarregarTarefas();
    if (!tarefas) return null;

    let subtarefas: Tarefa[] = [];

    for (let subId of tarefa.subtarefas) 
    {
        let sub = tarefas[subId];
        if (sub) subtarefas.push(sub);
        else console.log(`Subtarefa com id ${subId} não encontrada para a tarefa ${tarefa.id}`);
    }

    console.log("[TAREFASERVICE] Subtarefas encontradas para a tarefa ", tarefa.titulo, ":", subtarefas);
    return subtarefas;
}

export async function GetSubtarefasFinalizadas(tarefa: Tarefa): Promise<Tarefa[]> {
    if (!tarefa.subtarefas || tarefa.subtarefas.length === 0) return [];
    let t= await StorageAPI.CarregarTarefas();
    let subtarefas: Tarefa[] = [];

    for (let subId of tarefa.subtarefas) 
    {
        let sub = t ? t[subId] : null;
        if (sub && sub.estado === "Finalizado") subtarefas.push(sub);
    }
    return subtarefas;
}

/**
 * Filtra todas as tarefas para retornar apenas as tarefas principais (isSubtarefa = false) ou apenas as subtarefas (isSubtarefa = true), dependendo do valor de onlyMaintasks. Retorna null se ocorrer algum erro durante o processo.
 * @param tarefas array das tarefas
 * @param onlyMaintasks true = returna somente principais, false = retorna somente subtarefas
 * @returns Array das tarefas filtradas.
 */
export async function FilterSubTarefasArray(tarefas: Tarefa[], onlyMaintasks: boolean): Promise<Tarefa[]> {
    let res: Tarefa[] = [];

    tarefas.forEach((value) => {
        if (value.isSubtarefa === !onlyMaintasks) {
            res.push(value);
        }
    }); 

    return res;
}

/**
 * Filtra todas as tarefas para retornar apenas as tarefas principais (isSubtarefa = false) ou apenas as subtarefas (isSubtarefa = true), dependendo do valor de onlyMaintasks. Retorna null se ocorrer algum erro durante o processo.
 * @param tarefas array das tarefas
 * @param onlyMaintasks true = returna somente principais, false = retorna somente subtarefas
 * @returns Dicionário das tarefas filtradas, indexado por ID.
 */
export async function FilterSubTarefas(tarefas: Tarefa[], onlyMaintasks: boolean): Promise<Record<string, Tarefa>> {
    let res = {} as Record<string, Tarefa>;

    tarefas.forEach((value) => {
        if (value.isSubtarefa === !onlyMaintasks) {
            res[value.id] = value;
        }
    }); 

    return res;
}

/**
 * Filtra todas as tarefas para retornar apenas as tarefas principais (isSubtarefa = false) ou apenas as subtarefas (isSubtarefa = true), dependendo do valor de onlyMaintasks. Retorna null se ocorrer algum erro durante o processo.
 * @param tarefas dicionário das tarefas
 * @param onlyMaintasks true = returna somente principais, false = retorna somente subtarefas
 * @returns Dicionário das tarefas filtradas, indexado por ID.
 */
export async function FilterSubTarefasDicionario(tarefas: Record<string, Tarefa>, onlyMaintasks: boolean): Promise<Record<string, Tarefa>> {
    let tolist = Object.values(tarefas);
    return await FilterSubTarefas(tolist, onlyMaintasks);
}

// eventualmente provavelmente não será necessário, com menus para selecionar a data e hora
// mas por enquanto é útil para converter as datas de texto editáveis no TaskManager.
// O formato esperado é "dd/MM/yyyy HH:mm:ss", mas pode haver variações dependendo do locale do dispositivo. 
/**
 * Transforma uma string de data e hora no formato local (geralmente algo como "dd/MM/yyyy HH:mm:ss") em um timestamp numérico (milisegundos desde 01/01/1970), que é o formato usado para guardar as datas nas tarefas.
 * @param dateString string Locale da data e hora. Geralmente algo como 01/01/2001 01:01:01
 * @returns data em milisegundos desde 01/01/1970, que é o formato usado para guardar as datas nas tarefas. Retorna null se a string não for um formato de data válido.
 */
export function LocaleStringToTimestamp(dateString: string): number | null 
{
    const [date, time] = dateString.trim().split(' ');
    if (!date || !time) return null;

    const [day, month, year] = date.split('/').map(Number);
    const [hour, min, sec] = time.split(':').map(Number);

    if (
        [day, month, year, hour, min, sec].some(n => isNaN(n))
    ) return null;

    const d = new Date(year, month - 1, day, hour, min, sec);

    return isNaN(d.getTime()) ? null : d.getTime();
}

/**
 * Ordena as tarefas por data de vencimento, da mais próxima para a mais distante.
 * @param lista lista a ser ordenada
 * @returns 
 */
export function OrdenarTarefas(lista: Tarefa[]): Tarefa[] {
    return lista.sort((a, b) => {
        if (!a.data_vencimento) return 1;
        if (!b.data_vencimento) return -1;
        return a.data_vencimento - b.data_vencimento;
    });
};

export function GetFinalizadas(tarefas: Tarefa[]): Tarefa[] {
    return tarefas.filter(t => t.estado === "Finalizado");
}