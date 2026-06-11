import notifee, { TimestampTrigger, TriggerType, RepeatFrequency, AndroidImportance } from '@notifee/react-native';
import LocalStorageService from './LocalStorageService';
import { OrdenarTarefas, GetFolhas } from './TarefaService';
import type { Tarefa } from '../types/tarefa';
import type { USettings, HourMinute } from '../types/usettings';

/*await notifee.requestPermission();

const channelId = await notifee.createChannel({
    id: 'smartAgenda',
    name: 'Smart Agenda Notifications'
});//*/

var channelId: string;

/**
 * Carregamento inicial e permissão
 */
export async function Init() {
    await notifee.requestPermission();
    //await notifee.deleteChannel('smartAgenda');
    channelId = await notifee.createChannel({
        id: 'smartAgenda',
        name: 'Smart Agenda Notifications',
        importance: AndroidImportance.HIGH,
        sound: 'default',
    });

    //const channels = await notifee.getChannels();
    //console.log(channels);
}

/**
 * Notifica instantaneamente, somente para teste
 */
async function Notify(title: string, body: string) {
    if (!channelId) { console.log("[NOTIFICATIONSERVICE] Não foi possível executar a notificação; Serviço não iniciado corretamente, verifique se o comando 'Init' do serviço foi rodado antes deste comando."); return; }
    try {
        await notifee.displayNotification({
            title: title,
            body: body,
            android: {
                channelId: channelId,
                smallIcon: 'ic_stat_check_box'
            }
        });//*/
    }
    catch (e) {
        console.log("[NOTIFICATIONSERVICE] Erro ao notificar: ", e);
    }
}

/**
 * Marca uma notificação para aparecer em uma data e hora específica, somente uma vez
 * @returns ID da notificação criada
 */
async function Schedule(title: string, body: string, Timestamp: TriggerType.TIMESTAMP, tarefaid?: string): Promise<string> {
    if (!channelId) await Init();//{ console.log("[NOTIFICATIONSERVICE] Não foi possível executar a notificação; Serviço não iniciado corretamente, verifique se o comando 'Init' do serviço foi rodado antes deste comando."); return ""; }
    if (Timestamp < Date.now()) { console.log("[NOTIFICATIONSERVICE] Não é possível marcar uma notificação para uma data que já passou."); return ""; }
    let trigger: TimestampTrigger = { type: TriggerType.TIMESTAMP, timestamp: Timestamp };
    let notificationId = await notifee.createTriggerNotification(
        {
            title: title,
            body: body,
            android: {
                channelId: channelId,
                smallIcon: 'ic_stat_check_box'
            },
            data: {
                ...(tarefaid && { taskId: tarefaid })
            }
        },
        trigger
    );
    console.log("[NOTIFICATIONSERVICE] Notificação com titulo '", title, "' corpo '", body, "' foi marcada para ", new Date(Timestamp).toLocaleDateString(), new Date(Timestamp).toTimeString(), ' ', notificationId);
    console.log('total notifications:', (await notifee.getTriggerNotificationIds()).length);
    return notificationId;
}

/**
 * Marca uma notificação para aparecer em uma data e hora específica Semanalmente
 * @param InitialTimestamp Data e hora inicial, que se repetirá diariamente.
 * @returns ID da notificação criada
 */
export async function ScheduleDayOfTheWeek(title: string, body: string, InitialTimestamp: TriggerType.TIMESTAMP): Promise<string> {
    if (!channelId) await Init();// { console.log("[NOTIFICATIONSERVICE] Não foi possível executar a notificação; Serviço não iniciado corretamente, verifique se o comando 'Init' do serviço foi rodado antes deste comando."); return "";}
    if (InitialTimestamp < Date.now()) { console.log("[NOTIFICATIONSERVICE] Não é possível marcar uma notificação para uma data que já passou."); return ""; }
    let trigger: TimestampTrigger = { type: TriggerType.TIMESTAMP, timestamp: InitialTimestamp, repeatFrequency: RepeatFrequency.WEEKLY };
    let notificationId = await notifee.createTriggerNotification(
        {
            title: title,
            body: body,
            android: {
                channelId: channelId,
                smallIcon: 'ic_stat_check_box'
            }
        },
        trigger
    );
    console.log("[NOTIFICATIONSERVICE] Notificação de dia da semana com titulo '", title, "' corpo '", body, "' foi marcada para ", new Date(InitialTimestamp).toLocaleDateString(), new Date(InitialTimestamp).toTimeString(), ' ', notificationId);
    console.log('total notifications:', (await notifee.getTriggerNotificationIds()).length);
    return notificationId;
}

/**
 * Marca uma notificação para aparecer em uma data e hora específica Diariamente
 * @param InitialTimestamp Data e hora inicial, que se repetirá diariamente.
 * @returns ID da notificação criada
 */
export async function ScheduleDaily(title: string, body: string, InitialTimestamp: number): Promise<string> {
    if (!channelId) await Init();// { console.log("[NOTIFICATIONSERVICE] Não foi possível executar a notificação; Serviço não iniciado corretamente, verifique se o comando 'Init' do serviço foi rodado antes deste comando."); return "";}
    if (InitialTimestamp < Date.now()) { console.log("[NOTIFICATIONSERVICE] Não é possível marcar uma notificação para uma data que já passou."); return ""; }
    let trigger: TimestampTrigger = { type: TriggerType.TIMESTAMP, timestamp: InitialTimestamp, repeatFrequency: RepeatFrequency.DAILY };
    let notificationId = await notifee.createTriggerNotification(
        {
            title: title,
            body: body,
            android: {
                channelId: channelId,
                smallIcon: 'ic_stat_check_box'
            }
        },
        trigger
    );
    console.log("[NOTIFICATIONSERVICE] Notificação Diária com titulo '", title, "' corpo '", body, "' foi marcada para ", new Date(InitialTimestamp).toLocaleDateString(), new Date(InitialTimestamp).toTimeString(), ' ', notificationId);
    console.log('total notifications:', (await notifee.getTriggerNotificationIds()).length);
    return notificationId;
}

/**
 * Cancela a notificação marcada com o ID especificado.
 */
export async function CancelNotification(scheduledId: string) {
    if (scheduledId) {
        console.log("[NOTIFICATIONSERVICE] Notificação de ID ", scheduledId, " Cancelada.");
        await notifee.cancelTriggerNotification(
            scheduledId
        );
    }
    console.log('total notifications:', await notifee.getTriggerNotificationIds());
    //console.log('total notifications:', (await notifee.getTriggerNotificationIds()).length);
}

export async function ForceCancelAllNotifications() {
    let not = await notifee.getTriggerNotificationIds();
    console.log(not);
    for (const n of not) await CancelNotification(n);
}

function GetNextTime(times: { hour: number, minute: number }): Date {
    const now = new Date();

    const next = new Date(now);
    next.setHours(times.hour, times.minute, 0, 0);

    if (next <= now) next.setDate(next.getDate() + 1);

    return next;
}

function GetNextWeekDay(weekday: number, times: { hour: number, minute: number }): Date {
    //console.log("finding next day of the week that is ", [weekday], " and todays time is ", times.hour, ':', times.minute);
    const date = new Date();

    date.setHours(times.hour, times.minute, 0, 0);

    const daysUntil =
        (weekday - date.getDay() + 7) % 7;

    date.setDate(date.getDate() + daysUntil);

    if (date <= new Date()) {
        date.setDate(date.getDate() + 7);
    }

    return date;
}

function ParseWeekDay(weekday: string): number {
    switch (weekday) {
        case 'sunday': return 0;
        case 'monday': return 1;
        case 'tuesday': return 2;
        case 'wednesday': return 3;
        case 'thursday': return 4;
        case 'friday': return 5;
        case 'saturday': return 6;
        default:
            console.error("INVALID DAY OF THE WEEK");
            return -1;
    }
}

// ----------------- FUNÇÕES DE NIVEL ALTO ---------------------

/**
 * Função mais geral para atualizar todos os tipos de notificações, com os dados atuais e configuração atual
 */
export async function RefreshNotifications() {
    let cfg = await LocalStorageService.CarregarConfiguracao();
    let tasks = await LocalStorageService.CarregarTarefasArray();
    let removeallquota = 0;
    if (tasks) {
        if (cfg.EnableDailyNotify !== undefined) {
            if (cfg.EnableDailyNotify) await RefreshDailyNotifications();
            else { await DisableAllDailyNotifications(); removeallquota++; }
        }
        else { await DisableAllDailyNotifications(); removeallquota++; }

        if (cfg.EnableScheduledNotify !== undefined) {
            if (cfg.EnableScheduledNotify) await RefreshScheduledNotifications(tasks);
            else { await DisableAllScheduledNotifications(tasks); removeallquota++; }
        }
        else { await DisableAllScheduledNotifications(tasks); removeallquota++; }

        if (cfg.EnableDayOfTheWeekNotify !== undefined) {
            if (cfg.EnableDayOfTheWeekNotify &&
                cfg.DayOfTheWeekNotificationSets &&
                Object.values(cfg.DayOfTheWeekNotificationSets).some(v => v.length > 0)) await RefreshDayOfTheWeekNotifications();
            else { await DisableAllDayOfTheWeekNotifications(); removeallquota++; }
        }
        else { await DisableAllDayOfTheWeekNotifications(); removeallquota++; }
    }
    if (removeallquota >= 3) await ForceCancelAllNotifications();
}

/**
 * Atualiza as notificações marcadas definidas em todas as tarefas passadas.
 */
export async function RefreshScheduledNotifications(tarefas: Tarefa[]) {
    console.log('scheduled refresh');
    let cfg = await LocalStorageService.CarregarConfiguracao();
    let filtered = tarefas.filter((t) => t.estado !== 'Finalizado')
    for (const t of filtered) {
        let wd = cfg.ScheduledWarningDays ?? [2, 3, 7]
        await BuildScheduledNotifications(t, wd);
        //console.log(t.notificacoesIds);
    }
}

/**
 * Atualiza as notificações diárias definidas em todas as tarefas passadas.
 */
export async function RefreshDailyNotifications() {
    console.log('daily refresh');
    let cfg = await LocalStorageService.CarregarConfiguracao();
    if (cfg.EnableDailyNotify && cfg.DailyNotificationTime !== undefined && cfg.DailyNotificationTime.length > 0) {
        for (const id of cfg.ActiveDailyNotifications ?? []) {
            await CancelNotification(id);
        }
        let noti = await BuildGeneralDailyNotifications(cfg.DailyNotificationTime);
        cfg.ActiveDailyNotifications = noti.length ? noti : [];
    }
    else {
        console.log('[NOTIFICATIONSERVICE] Disabling daily notifications, if you intended to turn them on, theres an error on the set times.');
        await DisableAllDailyNotifications();
    }
    await LocalStorageService.SalvarConfiguracao(cfg);
    /*for (const t of tarefas) {
        await BuildTaskSpecificDailyNotifications(t);
        console.log(t.notificacoesIds);
    }*/
}

/**
 * Atualiza as notificações de dia da semana definidas em todas as tarefas atuais
 */
export async function RefreshDayOfTheWeekNotifications() {
    console.log('DOTW refresh');
    let cfg = await LocalStorageService.CarregarConfiguracao();
    if (cfg.EnableDayOfTheWeekNotify && cfg.DayOfTheWeekNotificationSets && Object.entries(cfg.DayOfTheWeekNotificationSets).length > 0) {

        let active = cfg.ActiveDayOfTheWeekNotifications ?? {}
        for (const val of Object.values(active)) {
            for (const v of val) await CancelNotification(v);
        }
        let noti = await BuildGeneralDayOfTheWeekNotifications(cfg.DayOfTheWeekNotificationSets);
        if (Object.values(noti).some(v => v.length > 0)) {
            cfg.ActiveDayOfTheWeekNotifications = noti;
            await LocalStorageService.SalvarConfiguracao(cfg);
        }
        else DisableAllDayOfTheWeekNotifications();
    }
    else console.error("There are no sets to be followed for Day of the Week notifications");
}

/**
 * Marca notificações para a tarefa selecionada (Por enquanto 7 dias antes, 2 dias antes, 1 dia antes)
 */
export async function BuildScheduledNotifications(tarefa: Tarefa, warningdays: number[]) {
    //console.log(JSON.stringify(tarefa, null, 2));
    let currentIds = tarefa.notificacoesIds;
    if (currentIds) {
        await RemoveNotifications(currentIds);
        tarefa.notificacoesIds = tarefa.notificacoesIds?.filter((e) => currentIds.includes(e))
    }

    let newNoti: string[] = [];
    const day = 86400000;

    // TODO: Integrar com a IA para os textos de notificação
    for (const wd of warningdays) {
        let midtext = wd > 7 ? " Faltam " : wd > 1 ? " Faltam somente " : " Falta somente ";
        let mutableid = await Schedule(tarefa.titulo, (midtext + wd + " Dias para essa tarefa vencer!"), tarefa.data_vencimento - (day * wd), tarefa.id);
        if (mutableid) newNoti.push(mutableid);
    }

    tarefa.notificacoesIds = [...(tarefa.notificacoesIds ?? []), ...newNoti.filter(val => val !== '')];
    if (tarefa.notificacoesIds.length > warningdays.length) {
        const removed = tarefa.notificacoesIds.slice(0, tarefa.notificacoesIds.length - warningdays.length);
        tarefa.notificacoesIds = tarefa.notificacoesIds.slice(-warningdays.length);
        await RemoveNotifications(removed);
    }

    // sim tem muita verificação aqui que foi pra tentar resolver um problema com Async, mas resolvi de outra forma

    LocalStorageService.SalvarTarefa(tarefa);

    console.log(JSON.stringify(tarefa, null, 2));
}

/**
 * Define notificações diárias para a tarefa selecionada (Deprecated)
 *//*
export async function BuildTaskSpecificDailyNotifications(tarefa: Tarefa) {
 await RemoveNotifications(tarefa, 'Daily');
 let newNoti: Record<string, string> = {};
 // TODO: Integrar com a IA para os textos de notificação
 // TODO: Deixar o usuário definir o horário diário, e os dias da semana.
 let time = new Date();
 time.setHours(12, 0, 0, 0);
 if (time.getTime() <= Date.now()) {
     time.setDate(time.getDate() + 1);
 }

 let id = await ScheduleDaily(tarefa.titulo, "Faça um pouquinho hoje!", time.getTime());
 if (id) newNoti['Daily_1'] = id;

 if (tarefa.notificacoesIds) tarefa.notificacoesIds = { ...tarefa.notificacoesIds, ...newNoti };
 else tarefa.notificacoesIds = newNoti;
 for (const [key, val] of Object.entries(tarefa.notificacoesIds)) {
     if (val == '') { delete tarefa.notificacoesIds[key] };
 }
}//*/

/**
 * Define notificações diárias gerais, para as tarefas mais urgentes.
 */
export async function BuildGeneralDailyNotifications(times: HourMinute[]): Promise<string[]> {
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
    let body = `Que tal dar progresso em ${tasks[0].titulo}`;
    if (tasks.length > 2) body += `, ${tasks[1].titulo} ou ${tasks[2].titulo}`;
    else if (tasks.length > 1) body += ` ou ${tasks[1].titulo}`;
    body += '?';

    for (const time of times) {
        try {
            let t = GetNextTime(time)

            let id = await ScheduleDaily("Faça um pouquinho hoje!", body, t.getTime())
            if (id) notiIds.push(id);
        }
        catch (e) { console.error('[BUILDGENERALDAILYNOTIFICATIONS] Couldnt set up daily notification: ', e); }
    }

    return notiIds;
}

export async function BuildGeneralDayOfTheWeekNotifications(days: Record<string, HourMinute[]>): Promise<Record<string, string[]>> {
    let overallTasks = await LocalStorageService.CarregarTarefasArray();
    //console.log(overallTasks);
    if (!overallTasks) { console.log("Couldn't set general day-of-the-week notifications, no tasks found"); return {}; }
    let leaves = await GetFolhas(overallTasks)
    let tasks = leaves.filter((t) => t.estado !== 'Finalizado');
    tasks = OrdenarTarefas(tasks);

    if (tasks.length <= 0) {
        console.log("No tasks in progress for the day-of-the-week notification.");
        return {};
    }
    //console.log(tasks);

    let notiIds: Record<string, string[]> = {};

    let body = `Que tal dar progresso em ${tasks[0].titulo}`;
    if (tasks.length > 2) body += `, ${tasks[1].titulo} ou ${tasks[2].titulo}`;
    else if (tasks.length > 1) body += ` ou ${tasks[1].titulo}`;
    body += '?';

    for (const [weekday, times] of Object.entries(days)) {
        for (const time of times) {
            try {
                let t = GetNextWeekDay(ParseWeekDay(weekday), time);

                let id = await ScheduleDayOfTheWeek("Faça um pouquinho hoje!", body, t.getTime())
                if (id) {
                    if (!notiIds[weekday]) notiIds[weekday] = [];
                    notiIds[weekday].push(id);
                }

            }
            catch (e) { console.error('[BUILDGENERALDAYOFTHEWEEKNOTIFICATIONS] Couldnt set up day-of-the-week notification: ', e); }
        }
    }
    return notiIds;
}

/**
 * Desabilita as notificações diárias definidas em todas as tarefas passadas.
 */
export async function DisableAllDailyNotifications(tarefas?: Tarefa[]) {
    //console.log('Disabling daily');
    let cfg = await LocalStorageService.CarregarConfiguracao();
    if (cfg.ActiveDailyNotifications) {
        for (const n of cfg.ActiveDailyNotifications) await CancelNotification(n);
        cfg.ActiveDailyNotifications = undefined;
        await LocalStorageService.SalvarConfiguracao(cfg);
    }
}

/**
 * Desabilita as notificações marcadas definidas em todas as tarefas passadas.
 */
export async function DisableAllScheduledNotifications(tarefas: Tarefa[]) {
    //console.log('Disabling scheduled');
    for (const t of tarefas) {
        if (t.notificacoesIds) {
            await RemoveNotifications(Object.values(t.notificacoesIds));
            delete t.notificacoesIds;
            LocalStorageService.SalvarTarefa(t);
        }

    }
}

/**
 * Desabilita as notificações de dia de semana definidas (não remove a configuração das datas)
 */
export async function DisableAllDayOfTheWeekNotifications() {
    //console.log('Disabling DOTW');
    let cfg = await LocalStorageService.CarregarConfiguracao();
    if (cfg.ActiveDayOfTheWeekNotifications) {
        for (const ns of Object.values(cfg.ActiveDayOfTheWeekNotifications))
            for (const n of ns) await CancelNotification(n);
        cfg.ActiveDayOfTheWeekNotifications = undefined;
        await LocalStorageService.SalvarConfiguracao(cfg);
    }
}

/**
 * Remove notificações de uma tarefa, especifique se somente as diárias ou somente as marcadas
 */
async function RemoveNotifications(ids: string[]) {
    //console.log(ids);
    for (const noti of ids) {
        await CancelNotification(noti);
    }
}