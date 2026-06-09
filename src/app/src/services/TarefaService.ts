// Funções relacionadas às Tarefas

import type { Tarefa } from '../types/tarefa';
import StorageAPI, { SalvarTarefas } from './LocalStorageService';
import { v4 as uuidv4 } from 'uuid'; // para geração de ID
import { TrySalvarTarefa } from './SaveControlService';
import { ScheduleDaily, Schedule, CancelNotification } from './NotificationService';
import LocalStorageService from './LocalStorageService';

export function CreateTarefa(id: string, titulo: string, data_criado: number, data_vencimento: number, parentId?: string, categorias?: string[], descricao_geral?: string, subtarefas?: string[], data_finalizado?: number): Tarefa {
    return {
        id,
        titulo,
        data_criado,
        data_vencimento,
        parentId,
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
    else if (obj.subtarefas && obj.subtarefas.length > 0) {
        let i = 0;
        for (let o of obj.subtarefas) {
            i += o;
        }
        id = `${i}`
    }
    else id = "1";
    //return undefined; // esse ID não é real, mas ainda é importante para conectar as subtarefas, vou ver ainda se dá pra passar

    const titulo =
        typeof obj.titulo === "string"
            ? obj.titulo
            : "Tarefa";

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
        typeof obj.data_criado === "string"
            ? new Date(obj.data_criado).getTime()
            : Date.now();

    let finalVal = typeof obj.data_vencimento === "string" ? (new Date(obj.data_vencimento).getTime())
        : (typeof obj.vence_dias_de_hoje === "number" ? Date.now() + (obj.vence_dias_de_hoje * 86400000)
            : (typeof obj.vence_data_DDMMYYYY === "string" ? LocaleStringToTimestamp(obj.vence_data_DDMMYYY)
                : Date.now() + (7 * 86400000)))
    if (!finalVal) finalVal = Date.now() + (7 * 86400000)

    const data_vencimento = finalVal;

    const data_finalizado =
        typeof obj.data_finalizado === "string"
            ? new Date(obj.data_finalizado).getTime()
            : undefined;

    const subtarefas =
        Array.isArray(obj.subtarefas)
            ? obj.subtarefas.filter(s => typeof s === "string")
            : undefined;

    const parentId =
        typeof obj.parentId === "string"
            ? obj.parentId
            : undefined;

    let res = await CreateTarefa(id, titulo, data_criado, data_vencimento, parentId, categorias, descricao_geral, subtarefas, data_finalizado)

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

        if (count > 0 && !tarefa.parentId) {
            let p = TryFindParent(tarefa, tarefasRecord);
            if (p) tarefa.parentId = p.id;
            else throw new Error(`Tarefa ${tarefa.titulo} (${tarefa.id}) é referenciada como subtarefa, mas não tem parentId definido.`); // e eu n sei como concertar por agora
        }
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

// this is a last resort
function TryFindParent(tarefa: Tarefa, tarefasRecord: Record<string, Tarefa>): Tarefa | null {
    for (const t of Object.values(tarefasRecord)) {
        if (t.subtarefas && t.subtarefas.includes(tarefa.id)) {
            return t;
        }
    }
    return null;
}

/**
 * Sincroniza o estado do pai de acordo com os estados dos filhos
 * @param parent 
 * @returns O pai
 */
export async function SyncState(parent: Tarefa): Promise<Tarefa> {
    //if (!parent.subtarefas || parent.subtarefas.length === 0) return parent;
    console.log("syncing state");
    let subtasks = await GetSubtarefas(parent);
    if (!subtasks || subtasks.length === 0) return parent;

    let updatedStatus: Tarefa['estado'] = 'EmProgresso';
    if (subtasks) {
        if (subtasks.every(t => t.estado === 'Finalizado'))
            updatedStatus = 'Finalizado';
        else if (subtasks.every(t => t.estado === 'NaoIniciado'))
            updatedStatus = 'NaoIniciado';
    }
    parent.estado = updatedStatus;
    if (parent.estado == 'Finalizado') {
        parent.data_finalizado = Date.now();
    }
    await TrySalvarTarefa(parent);

    if (parent.parentId) {
        let tarefas = await StorageAPI.CarregarTarefas();
        if (tarefas && tarefas[parent.parentId]) {
            await SyncState(tarefas[parent.parentId]);
        }
    }

    //console.log("updated state for ", parent.titulo, ": ", parent.estado);

    return parent;
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

    //console.log("----- from ", tarefa.subtarefas.length, " sub IDS");
    for (let subId of tarefa.subtarefas) {
        let sub = tarefas[subId];
        if (sub) subtarefas.push(sub);
        else console.log(`Subtarefa com id ${subId} não encontrada para a tarefa ${tarefa.id}`);
    }

    //console.log("[TAREFASERVICE] Subtarefas encontradas para a tarefa ", tarefa.titulo, ":", subtarefas);
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
    for (let s of subtarefas) {
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

    for (const t of tarefas) {
        if (!t.parentId) {
            if (onlyMaintasks) {
                res.push(t);
                //console.log("parent");
            }
        }
        else if (!onlyMaintasks) {
            res.push(t);
            //console.log("sub");
        }
    }

    return res;
}

/**
 * Filtra todas as tarefas para retornar apenas as tarefas principais/raiz ou apenas as subtarefas, dependendo do valor de onlyMaintasks. Retorna null se ocorrer algum erro durante o processo.
 * @param tarefas array das tarefas
 * @param onlyMaintasks true = returna somente principais/raiz, false = retorna somente subtarefas
 * @returns Dicionário das tarefas filtradas, indexado por ID.
 */
export async function FilterSubTarefas(tarefas: Tarefa[], onlyMaintasks: boolean): Promise<Record<string, Tarefa>> {
    let res = {} as Record<string, Tarefa>;

    for (const t of tarefas) {
        if (!t.parentId) {
            if (onlyMaintasks) {
                res[t.id] = t;
                //console.log("parent");
            }
        }
        else if (!onlyMaintasks) {
            res[t.id] = t;
            //console.log("sub");
        }
    }

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

export async function CleanupSubtaskReferences(tarefas: Record<string, Tarefa>): Promise<Record<string, Tarefa>> {
    for (const v of Object.values(tarefas)) {
        if (v.subtarefas) {
            v.subtarefas = v.subtarefas.filter((s) => {
                const exists = s in tarefas;

                if (!exists) {
                    console.log(
                        `[CLEANUPSUBTASKREFERENCES] Removed subtask with id '${s}' from task '${v.titulo}', as it was not found.`
                    );
                }

                return exists;
            }
            );
        }
        if (v.parentId !== undefined && !(v.parentId in tarefas)) {
            console.log("[CLEANUPSUBTASKREFERENCES] Removed parent with id '", v.parentId, " from task ", v.titulo, ", as it was not found.");
            v.parentId = undefined;
        }
    }

    return tarefas;
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

/**
 * Retorna somente as tarefas que não possuem sub-tarefas
 */
export async function GetFolhas(tarefas: Tarefa[]): Promise<Tarefa[]> {
    let res: Tarefa[] = [];
    //console.log(tarefas);
    for (const t of tarefas) {
        if (t.subtarefas && t.subtarefas.length > 0) {
            let sub = await GetSubtarefas(t)
            if (sub) res.concat(await GetFolhas(sub))
            else console.error("couldn't get subtarefas of ", t.titulo);
        }
        else res.push(t);
    }
    return res;
}

/**
 * Marca notificações para a tarefa selecionada (Por enquanto 7 dias antes, 2 dias antes, 1 dia antes)
 */
export async function BuildScheduledNotifications(tarefa: Tarefa) {
    await RemoveNotifications(tarefa, false);
    let newNoti: Record<string, string> = {};
    const day = 86400000;
    // TODO: Integrar com a IA para os textos de notificação
    newNoti['7days'] = await Schedule(tarefa.titulo, "Falta somente uma semana para essa tarefa vencer!", tarefa.data_vencimento - (day * 7));
    newNoti['2days'] = await Schedule(tarefa.titulo, "Falta somente dois dias para essa tarefa vencer!", tarefa.data_vencimento - (day * 2));
    newNoti['1day'] = await Schedule(tarefa.titulo, "Último dia até o vencimento da tarefa!", tarefa.data_vencimento - (day));
    //newNoti['10sec'] = await Schedule(tarefa.titulo, "lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum", Date.now() + 10000);
    if (tarefa.notificacoesIds) tarefa.notificacoesIds = { ...tarefa.notificacoesIds, ...newNoti };
    else tarefa.notificacoesIds = newNoti;
    for (const [key, val] of Object.entries(tarefa.notificacoesIds)) {
        if (val == '') { delete tarefa.notificacoesIds[key] };
    }
}

/**
 * Define notificações diárias para a tarefa selecionada (Por enquanto todos os dias ao Meio Dia)
 */
export async function BuildTaskSpecificDailyNotifications(tarefa: Tarefa) {
    await RemoveNotifications(tarefa, true);
    let newNoti: Record<string, string> = {};
    // TODO: Integrar com a IA para os textos de notificação
    // TODO: Deixar o usuário definir o horário diário, e os dias da semana.
    let time = new Date();
    time.setHours(12, 0, 0, 0);
    if (time.getTime() <= Date.now()) {
        time.setDate(time.getDate() + 1);
    }

    newNoti['Daily_1'] = await ScheduleDaily(tarefa.titulo, "Faça um pouquinho hoje!", time.getTime());
    if (tarefa.notificacoesIds) tarefa.notificacoesIds = { ...tarefa.notificacoesIds, ...newNoti };
    else tarefa.notificacoesIds = newNoti;
    for (const [key, val] of Object.entries(tarefa.notificacoesIds)) {
        if (val == '') { delete tarefa.notificacoesIds[key] };
    }
}

/**
 * Define notificações diárias gerais, para as tarefas mais urgentes.
 */
export async function BuildGeneralDailyNotifications(): Promise<string[]> {
    let overallTasks = await LocalStorageService.CarregarTarefasArray();
    //console.log(overallTasks);
    if (!overallTasks) { console.log("Couldn't build general daily notifications, no tasks found"); return []; }
    let leaves = await GetFolhas(overallTasks)
    let tasks = leaves.filter((t) => t.estado !== 'Finalizado');
    tasks = OrdenarTarefas(tasks);

    if (tasks.length <= 0) {
        console.log("No tasks in progress for the daily notification.");
        return [];
    }
    //console.log(tasks);

    let notiIds = [];

    // A integrar com a IA, por enquanto destaca as 3 tarefas mais urgentes, pode ser o fallback.
    try {
        let body = `Que tal dar progresso em ${tasks[0].titulo}`;
        if (tasks.length > 2) body += `, ${tasks[1].titulo} ou ${tasks[2].titulo}`;
        else if (tasks.length > 1) body += ` ou ${tasks[1].titulo}`;
        body += '?';

        let time = new Date();
        time.setHours(9, 0, 0, 0);
        if (time.getTime() <= Date.now()) {
            time.setDate(time.getDate() + 1);
        }

        notiIds.push(await ScheduleDaily("Faça um pouquinho hoje!", body, time.getTime()));
    }
    catch (e) { console.error('[BUILDGENERALDAILYNOTIFICATIONS] Couldnt set up daily notification: ', e); }
    return notiIds;

}

/**
 * Função mais geral para atualizar todos os tipos de notificações, com os dados atuais e configuração atual
 */
export async function RefreshNotifications() {
    let cfg = await LocalStorageService.CarregarConfiguracao();
    let tasks = await LocalStorageService.CarregarTarefasArray();
    if (tasks) {
        if (cfg.EnableDailyNotify !== undefined) {
            if (cfg.EnableDailyNotify) await RefreshDailyNotifications(tasks);
            else await DisableAllDailyNotifications(tasks);
        }
        if (cfg.EnableScheduledNotify !== undefined) {
            if (cfg.EnableScheduledNotify) await RefreshScheduledNotifications(tasks);
            else await DisableAllScheduledNotifications(tasks);
        }
    }
}

/**
 * Atualiza as notificações marcadas definidas em todas as tarefas passadas.
 */
export async function RefreshScheduledNotifications(tarefas: Tarefa[]) {
    let filtered = tarefas.filter((t) => t.estado !== 'Finalizado')
    for (const t of filtered) {
        await BuildScheduledNotifications(t);
        //console.log(t.notificacoesIds);
    }
}

/**
 * Atualiza as notificações diárias definidas em todas as tarefas passadas.
 */
export async function RefreshDailyNotifications(tarefas?: Tarefa[]) {
    let noti = await BuildGeneralDailyNotifications();
    if (noti.length > 0) {
        let cfg = await LocalStorageService.CarregarConfiguracao();
        if (cfg.ActiveDailyNotifications) cfg.ActiveDailyNotifications = cfg.ActiveDailyNotifications.concat(noti);
        else cfg.ActiveDailyNotifications = noti;
        await LocalStorageService.SalvarConfiguracao(cfg);
    }
    else DisableAllDailyNotifications([]);
    /*for (const t of tarefas) {
        await BuildTaskSpecificDailyNotifications(t);
        console.log(t.notificacoesIds);
    }*/
}

/**
 * Desabilita as notificações diárias definidas em todas as tarefas passadas.
 */
export async function DisableAllDailyNotifications(tarefas?: Tarefa[]) {
    if (tarefas) {
        for (const t of tarefas) {
            await RemoveNotifications(t, true);
        }
    }
    let cfg = await LocalStorageService.CarregarConfiguracao();
    if (cfg.ActiveDailyNotifications) {
        for (const n of cfg.ActiveDailyNotifications) await CancelNotification(n);
        cfg.ActiveDailyNotifications = undefined;
    }
    await LocalStorageService.SalvarConfiguracao(cfg);
}

/**
 * Desabilita as notificações marcadas definidas em todas as tarefas passadas.
 */
export async function DisableAllScheduledNotifications(tarefas: Tarefa[]) {
    for (const t of tarefas) {
        await RemoveNotifications(t, false);
    }
}

/**
 * Remove notificações de uma tarefa, especifique se somente as diárias ou somente as marcadas
 */
async function RemoveNotifications(tarefa: Tarefa, daily: boolean) {
    if (tarefa.notificacoesIds) {
        for (const [key, noti] of Object.entries(tarefa.notificacoesIds)) {
            if (daily) {
                if (key.startsWith("Daily")) {
                    await CancelNotification(noti);
                    delete tarefa.notificacoesIds[key];
                }
            }
            else if (!key.startsWith("Daily")) {
                await CancelNotification(noti);
                delete tarefa.notificacoesIds[key];
            }
        }
    }
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