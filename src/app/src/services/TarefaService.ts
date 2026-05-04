// Funções relacionadas às Tarefas

import type { Tarefa } from '../types/tarefa';
import StorageAPI from './LocalStorageService';
import { v4 as uuidv4 } from 'uuid'; // para geração de ID

export function CreateTarefa(id: string, titulo: string, data_criado: number, data_vencimento: number, isSubTarefa?: boolean, categorias?: string[], descricao_geral?: string, subtarefas?: string[], data_finalizado?: number): Tarefa {
    return {
        id,
        titulo,
        data_criado,
        data_vencimento,
        isSubtarefa: isSubTarefa || false,
        subtarefas,
        categorias,
        descricao_geral,
        data_finalizado,
        estado: data_finalizado !== undefined && data_finalizado > 0 ? "Finalizado" : "NaoIniciado"
    }
}

/**
 * Lê um JSON, representado uma tarefa ou lista de tarefas, e transforma-as em uma lista de tarefas como objeto. Indicado para interpretar o uso da IA.
 * @param jsonInput Dados em JSON, pode ser uma única tarefa ou um array de tarefas.
 * @returns Lista de tarefas formada
 */
export async function CreateTarefaJSON(jsonInput: string): Promise<Tarefa[]> {
    try {
        let res: Tarefa[] = [];

        ;
        //jsonInput = GetDummyJSON2();
        //console.log("[TAREFASERVICE] JSON recebido: ", jsonInput);
        let parsed = JSON.parse(jsonInput);
        //console.log("[TAREFASERVICE] JSON convertido: ", parsed);
        if (parsed) {
            if (parsed.tarefas) {
                console.log("this is an array of objects:");
                for (const t of parsed.tarefas) {
                    let parsedTask = await CreateTarefaJSONSingle(t);
                    if (parsedTask) res.push(parsedTask);
                    else console.log("[TAREFASERVICE] Failed to parse Tarefa JSON ", t)
                }
                console.log(res.length);
            }
            else {
                console.log("this is a single object");
                let parsedTask = await CreateTarefaJSONSingle(parsed);
                if (parsedTask) res.push(parsedTask);
                else console.log("[TAREFASERVICE] Failed to parse Tarefa JSON ", parsedTask)
            }
        }
        else console.log("[TAREFASERVICE] Couldn't parse ANYTHING. What? ", jsonInput);

        if (res.length > 0) {
            res = LimparTarefas(res); // remove the trailing ID references and unreachable elements
        }
        res = await RealIds(res); // transforma os IDs dummy em IDs de vdd

        console.log("[TAREFASERVICE] Tarefas criadas por JSON: ", res)

        // So, I need to know how good the json parser is, VERIFY EACH AND EVERY ATTRIBUTE, so if error, some things can still work
        // Should work for both lists and a single task.
        // Logic here maybe should change depending on how good AI is for connecting subtask IDs
        // actually the AI can't really create the ID, either interpret it on the order of it
        // Maybe make it set "Dummy IDS" to make it simpler(?) 
        // idk if the AI actually cares about that or not, it certainly is simpler to interpret here and in logs
        return res;
    }
    catch (e) {
        console.log("[TAREFASERVICE] Erro ao criar tarefa por JSON: ", e);
        return [];
    }
}

/**
 * O parser principal de um Json de uma única tarefa
 * @param t JSON representando uma única tarefa
 * @returns Tarefa convertida
 */
async function CreateTarefaJSONSingle(t: object): Promise<Tarefa | undefined> {
    const obj = t as Record<string, any>;

    let id;
    if (typeof obj.id === "string" && obj.id.trim() !== "")
        id = obj.id;
    else return undefined; // esse ID não é real, mas ainda é importante para conectar as subtarefas, vou ver ainda se dá pra passar

    const titulo =
        typeof obj.titulo === "string"
            ? obj.titulo
            : "Sem título";

    // O estado é computado, não é necessário
    /*const estado =
        obj.estado === "NaoIniciado" ||
            obj.estado === "EmProgresso" ||
            obj.estado === "Finalizado"
            ? obj.estado
            : "NaoIniciado";*/

    const categorias =
        Array.isArray(obj.categorias)
            ? obj.categorias.filter(c => typeof c === "string")
            : undefined;

    const descricao_geral =
        typeof obj.descricao_geral === "string"
            ? obj.descricao_geral
            : undefined;

    const data_criado =
        Number.isFinite(obj.data_criado) && obj.data_criado > 0
            ? obj.data_criado
            : Date.now();

    const data_vencimento =
        Number.isFinite(obj.data_vencimento)
            ? obj.data_vencimento
            : Date.now();

    const data_finalizado =
        Number.isFinite(obj.data_finalizado)
            ? obj.data_finalizado
            : undefined;

    const subtarefas =
        Array.isArray(obj.subtarefas)
            ? obj.subtarefas.filter(s => typeof s === "string")
            : undefined;

    const isSubtarefa =
        typeof obj.isSubtarefa === "boolean"
            ? obj.isSubtarefa
            : false;

    let res = await CreateTarefa(id, titulo, data_criado, data_vencimento, isSubtarefa, categorias, descricao_geral, subtarefas, data_finalizado)

    return res;
}

/**
 * Verifica por subtarefas sem apontadores para si, e de apontadores de subtarefa com IDs inexistentes.
 * @param tarefas 
 * @returns 
 */
function LimparTarefas(tarefas: Tarefa[]): Tarefa[] {
    const tarefasRecord: Record<string, Tarefa> = {};
    const subtaskRefCount: Record<string, number> = {};

    for (const t of tarefas) {
        tarefasRecord[t.id] = t;
        subtaskRefCount[t.id] = 0;
    }

    for (const t of tarefas) {
        if (!t.subtarefas) continue;

        const validSubtasks: string[] = [];

        for (const s of t.subtarefas) {
            if (s in tarefasRecord) {
                subtaskRefCount[s]++;
                validSubtasks.push(s);
            } else {
                console.log("[LIMPARTAREFAS] subtarefa inexistente:", s);
            }
        }

        t.subtarefas = validSubtasks;
    }

    for (const [id, count] of Object.entries(subtaskRefCount)) {
        const tarefa = tarefasRecord[id];
        if (!tarefa) continue;

        tarefa.isSubtarefa = count > 0;
    }

    return tarefas;
}

async function RealIds(tarefas: Tarefa[]): Promise<Tarefa[]> {
    const IDMap: Record<string, string> = {};
    const used = new Set<string>();

    for (const t of tarefas) {
        let newId: string;

        do {
            newId = await GetUniqueID();
        } while (used.has(newId));

        used.add(newId);
        IDMap[t.id] = newId;
    }

    for (const t of tarefas) {
        const oldId = t.id;
        const newId = IDMap[oldId];
        if (!newId) {
            console.log("[RealIDs] Failure on mapping id ", oldId);
            continue;
        }
        t.id = newId;
        if (t.subtarefas) {
            t.subtarefas = t.subtarefas.map(id => IDMap[id] ?? id);
        }
    }

    return tarefas;
}

export async function GetUniqueID(): Promise<string> {
    let id = uuidv4();
    let tarefas = await StorageAPI.CarregarTarefas();
    while (tarefas && tarefas[id]) { // certificar que o ID é único, pelo menos por usuário.
        id = uuidv4();
    }
    return id;
}

/**
 * Obtém as subtarefas diretas de uma tarefa específica.
 * @param id ID da tarefa cujas subtarefas se deseja obter.
 * @returns array de subtarefas, ou null se a tarefa não tiver subtarefas ou se ocorrer algum erro durante o processo.
 */
export async function GetSubtarefasById(id: string): Promise<Tarefa[] | null> {
    let tarefas = await StorageAPI.CarregarTarefas();
    let t;
    if (!tarefas) return null;
    t = tarefas[id];
    if (!t) return null;

    return GetSubtarefas(t);
}

/**
 * Obtém as subtarefas diretas (somente uma camada de filhos) de uma tarefa específica.
 * @param tarefa 
 * @returns array de subtarefas, ou null se a tarefa não tiver subtarefas ou se ocorrer algum erro durante o processo.
 */
export async function GetSubtarefas(tarefa: Tarefa): Promise<Tarefa[] | null> {
    if (!tarefa.subtarefas || tarefa.subtarefas.length === 0) return null;

    let tarefas = await StorageAPI.CarregarTarefas();
    if (!tarefas) return null;

    let subtarefas: Tarefa[] = [];

    for (let subId of tarefa.subtarefas) {
        let sub = tarefas[subId];
        if (sub) subtarefas.push(sub);
        else console.log(`Subtarefa com id ${subId} não encontrada para a tarefa ${tarefa.id}`);
    }

    console.log("[TAREFASERVICE] Subtarefas encontradas para a tarefa ", tarefa.titulo, ":", subtarefas);
    return subtarefas;
}

/**
 * Obtém todas as subtarefas de uma tarefa específica, inclusive as subtarefas de subtarefas
 * @param tarefa 
 * @returns array de subtarefas, ou null se a tarefa não tiver subtarefas ou se ocorrer algum erro durante o processo.
 */
export async function GetAllSubtarefas(tarefa: Tarefa): Promise<Tarefa[] | null> {
    let subtarefas: Tarefa[] = [];

    let tempsub = await GetSubtarefas(tarefa);
    if (!tempsub) return [];
    subtarefas = subtarefas.concat(tempsub);
    for (let s of subtarefas)
    {
        let subsub = await GetAllSubtarefas(s);
        if (subsub)
        subtarefas = subtarefas.concat(subsub);
    };

    //console.log("[TAREFASERVICE] Subtarefas encontradas para a tarefa ", tarefa.titulo, ":", subtarefas);
    return subtarefas;
}

export async function GetSubtarefasFinalizadas(tarefa: Tarefa): Promise<Tarefa[]> {
    if (!tarefa.subtarefas || tarefa.subtarefas.length === 0) return [];
    let t = await StorageAPI.CarregarTarefas();
    let subtarefas: Tarefa[] = [];

    for (let subId of tarefa.subtarefas) {
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
export function LocaleStringToTimestamp(dateString: string): number | null {
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

function GetDummyJSON1(): string {
    let date = Date.now();
    let res = `{
        "id": "11111",
        "titulo": "dummyJson",
        "estado": "NaoIniciado",
        "categorias": ["dummy", "dumdum"],
        "descricao_geral": "This is a dummmy task to check how good JSON parse is",
        "data_criado": ${date},
        "data_vencimento": ${date + (144000)},
        "isSubtarefa": false
    }
    
    `;
    //console.log(res);
    return res;
}

function GetDummyJSON2(): string {
    let date = Date.now();
    return `
    {"tarefas": [{
        "id": "1",
        "titulo": "dummy1",
        "estado": "NaoIniciado",
        "categorias": ["dummy", "dumdum"],
        "descricao_geral": "This is a dummmy task to check how good JSON parse is",
        "data_criado": ${date},
        "data_vencimento": ${date + (144000)},
        "subtarefas": ["2", "3"],
        "isSubtarefa": false
    },
    {
        "id": "2",
        "titulo": "dummy2",
        "estado": "NaoIniciado",
        "categorias": ["dummy", "dumdum"],
        "descricao_geral": "This is a dummmy task to check how good JSON parse is",
        "data_criado": ${date},
        "data_vencimento": ${date + (144000)},
        "subtarefas": ["4"],
        "isSubtarefa": true
    },
    {
        "id": "3",
        "titulo": "dummy3",
        "estado": "NaoIniciado",
        "categorias": ["dummy", "dumdum"],
        "descricao_geral": "This is a dummmy task to check how good JSON parse is",
        "data_criado": ${date},
        "data_vencimento": ${date + (144000)},
        "isSubtarefa": true
    },
    {
        "id": "4",
        "titulo": "dummy4",
        "estado": "NaoIniciado",
        "categorias": ["dummy", "dumdum"],
        "descricao_geral": "This is a dummmy task to check how good JSON parse is",
        "data_criado": ${date},
        "data_vencimento": ${date + (144000)},
        "subtarefas": ["5"],
        "isSubtarefa": true
    },
    {
        "id": "5",
        "titulo": "dummy5",
        "estado": "NaoIniciado",
        "categorias": ["dummy", "dumdum"],
        "descricao_geral": "This is a dummmy task to check how good JSON parse is",
        "data_criado": ${date},
        "data_vencimento": ${date + (144000)},
        "isSubtarefa": true
    }
    ]}
    `;
}