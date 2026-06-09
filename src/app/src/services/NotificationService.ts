import notifee, { TimestampTrigger, TriggerType, RepeatFrequency, AndroidImportance } from '@notifee/react-native';

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
export async function Notify(title: string, body: string) {
    if (!channelId) { console.log("[NOTIFICATIONSERVICE] Não foi possível executar a notificação; Serviço não iniciado corretamente, verifique se o comando 'Init' do serviço foi rodado antes deste comando."); return; }
    try {
        await notifee.displayNotification({
            title: title,
            body: body,
            android: {
                channelId: channelId
            }
        });//*/
    }
    catch (e) {
        console.log("[NOTIFICATIONSERVICE] Erro ao notificar: ", e);
    }
}

/**
 * Marca uma notificação para aparecer em uma data e hora específica
 * @returns ID da notificação criada
 */
export async function Schedule(title: string, body: string, Timestamp: TriggerType.TIMESTAMP): Promise<string> {
    if (!channelId) await Init();//{ console.log("[NOTIFICATIONSERVICE] Não foi possível executar a notificação; Serviço não iniciado corretamente, verifique se o comando 'Init' do serviço foi rodado antes deste comando."); return ""; }
    if (Timestamp < Date.now()) { console.log("[NOTIFICATIONSERVICE] Não é possível marcar uma notificação para uma data que já passou."); return ""; }
    let trigger: TimestampTrigger = { type: TriggerType.TIMESTAMP, timestamp: Timestamp };
    let notificationId = await notifee.createTriggerNotification(
        {
            title: title,
            body: body,
            android: {
                channelId: channelId
            }
        },
        trigger
    );
    console.log("[NOTIFICATIONSERVICE] Notificação com titulo '", title, "' corpo '", body, "' foi marcada para ", new Date(Timestamp).toLocaleDateString(), new Date(Timestamp).toTimeString());
    return notificationId;
}

/**
 * Marca uma notificação para aparecer em uma data e hora específica Diariamente (Sem suporte para dias específicos da semana ainda)
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
                channelId: channelId
            }
        },
        trigger
    );
    console.log("[NOTIFICATIONSERVICE] Notificação Diária com titulo '", title, "' corpo '", body, "' foi marcada para ", new Date(InitialTimestamp).toLocaleDateString(), new Date(InitialTimestamp).toTimeString());
    return notificationId;
}

/**
 * Cancela a notificação marcada com o ID especificado.
 */
export async function CancelNotification(scheduledId: string) {
    console.log("[NOTIFICATIONSERVICE] Notificação de ID ", scheduledId, " Cancelada.");
    await notifee.cancelTriggerNotification(
        scheduledId
    );
}