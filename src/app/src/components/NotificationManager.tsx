import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Switch,
    Pressable,
    TextInput,
    StyleSheet,
    ScrollView,
    Modal,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { HourMinute, USettings } from '../types/usettings';
import LocalStorageService from '../services/LocalStorageService';
import { CancelNotification, ForceCancelAllNotifications, RefreshNotifications } from '../services/NotificationService';

type DayKey =
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday'
    | 'daily'

interface DayConfig {
    enabled: boolean;
    times: string[];
}

interface ScheduleState {
    days: Record<DayKey, DayConfig>;
}

const DAYS: { key: DayKey; label: string }[] = [
    { key: 'monday', label: 'Segunda-Feira' },
    { key: 'tuesday', label: 'Terça-Feira' },
    { key: 'wednesday', label: 'Quarta-Feira' },
    { key: 'thursday', label: 'Quinta-Feira' },
    { key: 'friday', label: 'Sexta-Feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' },
];

type HigherProps = {
    onToggle: (key: string, value: boolean) => void;
    settings: USettings;
    onExit: (set: USettings) => void;
}

export default function WeeklyNotificationEditor({ onToggle, settings, onExit }: HigherProps) {
    const { theme } = useTheme();
    const [enableDailies, setEnableDailies] = useState(settings.EnableDailyNotify || settings.EnableDayOfTheWeekNotify);
    const [errortext, setErrortext] = useState("");

    const loadScheduleStates = (): ScheduleState => {
        let DOTWdata: Record<DayKey, DayConfig> = {
            sunday: { enabled: false, times: [] },
            monday: { enabled: true, times: ["08:00"] },
            tuesday: { enabled: false, times: [] },
            wednesday: { enabled: false, times: [] },
            thursday: { enabled: false, times: [] },
            friday: { enabled: false, times: [] },
            saturday: { enabled: false, times: [] },
            daily: { enabled: false, times: ["08:00"] },
        }
        if (settings.EnableDailyNotify !== undefined) {
            if (settings.EnableDailyNotify) {
                DOTWdata.daily.enabled = true;
                if (settings.DailyNotificationTime !== undefined) {
                    DOTWdata.daily.times = settings.DailyNotificationTime.map(hm =>
                        `${hm.hour.toString().padStart(2, '0')}:${hm.minute.toString().padStart(2, '0')}`);
                }
            }
        }
        if (settings.EnableDayOfTheWeekNotify !== undefined) {
            if (settings.EnableDayOfTheWeekNotify) {
                for (const [key, value] of Object.entries(DOTWdata)) {
                    if (settings.DayOfTheWeekNotificationSets !== undefined && settings.DayOfTheWeekNotificationSets[key] !== undefined) {
                        value.enabled = true;
                        value.times = settings.DayOfTheWeekNotificationSets[key].map(hm =>
                            `${hm.hour.toString().padStart(2, '0')}:${hm.minute.toString().padStart(2, '0')}`);
                    }
                }
            }
        }
        return ({
            days: {
                sunday: DOTWdata.sunday,
                monday: DOTWdata.monday,
                tuesday: DOTWdata.tuesday,
                wednesday: DOTWdata.wednesday,
                thursday: DOTWdata.thursday,
                friday: DOTWdata.friday,
                saturday: DOTWdata.saturday,
                daily: DOTWdata.daily
            },
        });
    }

    const [schedule, setSchedule] = useState<ScheduleState>(loadScheduleStates());

    function onToggleMiddleman(key: string, value: boolean) {
        Save();
        if (key === 'BothDaily') {
            setEnableDailies(value);
            if (!value) {
                onToggle('EnableDailyNotify', false);
                onToggle('EnableDayOfTheWeekNotify', false);
            }
            return;
        }
        if (key === 'EnableDailyNotify' && value) {
            setSchedule(prev => ({
                days: {
                    ...prev.days,
                    daily: {
                        ...prev.days.daily,
                        enabled: true,
                    }
                }
            }));
        }
        onToggle(key, value);


    }

    function Save() {
    let error = "";

    for (const [weekday, data] of Object.entries(schedule.days)) {
        try {
            if (data.enabled && data.times.length > 0) {
                let r: HourMinute[] = [];
                for (const Time of data.times) {
                    try {
                        let sp = Time.split(':');
                        if (sp.length !== 2) {
                            error = "Horários inseridos inválidos, revise-os. " + Time;
                            continue;
                        }
                        let hm = { hour: parseInt(sp[0]), minute: parseInt(sp[1]) };
                        if (
                            !Number.isInteger(hm.hour) ||
                            !Number.isInteger(hm.minute) ||
                            hm.hour < 0 || hm.hour > 23 ||
                            hm.minute < 0 || hm.minute > 59
                        ) {
                            error = "Horários inseridos inválidos, revise-os. " + Time;
                            continue;
                        }
                        r.push(hm);
                    }
                    catch (e) { error = "Horários inseridos inválidos, revise-os. " + Time; }
                }
                if (weekday === 'daily') {
                    if (r.length > 0) settings.DailyNotificationTime = r;
                    else error = "Horários inseridos inválidos, revise-os. ";
                } else {
                    if (settings.DayOfTheWeekNotificationSets === undefined) settings.DayOfTheWeekNotificationSets = {};
                    if (r.length > 0) settings.DayOfTheWeekNotificationSets[weekday] = r;
                    else error = "Horários inseridos inválidos, revise-os. ";
                }
            }
            else if (settings.DayOfTheWeekNotificationSets !== undefined)
                delete settings.DayOfTheWeekNotificationSets[weekday];
        }
        catch (e) { error = "Erro ao salvar as notificações, revise os horários inseridos. " + e; }
    }

    setErrortext(error);
    if (!error) LocalStorageService.SalvarConfiguracao(settings);
}

    useEffect(() => {
        Save();
    }, [schedule])

    const toggleDay = (day: DayKey) => {
        setSchedule(prev => ({
            ...prev,
            days: {
                ...prev.days,
                [day]: {
                    ...prev.days[day],
                    enabled: !prev.days[day].enabled,
                },
            },
        }));
    };

    const addTime = (day: DayKey) => {
        setSchedule(prev => ({
            ...prev,
            days: {
                ...prev.days,
                [day]: {
                    ...prev.days[day],
                    times: [...prev.days[day].times, '08:00'],
                },
            },
        }));
    };

    const removeTime = (day: DayKey, index: number) => {
        if (day === 'daily') {
            if (settings.ActiveDailyNotifications !== undefined && settings.ActiveDailyNotifications.length > index) {
                let toRemove = settings.ActiveDailyNotifications[index];
                if (toRemove) {
                    console.log("ahoy");
                    CancelNotification(toRemove).then(() => { delete settings.ActiveDailyNotifications![index] });
                }
            }
        }
        else {
            if (settings.ActiveDayOfTheWeekNotifications !== undefined &&
                settings.ActiveDayOfTheWeekNotifications[day] !== undefined &&
                settings.ActiveDayOfTheWeekNotifications[day].length > index) {
                let toRemove = settings.ActiveDayOfTheWeekNotifications[day][index];
                if (toRemove) {
                    CancelNotification(toRemove).then(() => { delete settings.ActiveDayOfTheWeekNotifications![day][index] });
                }
            }
        }
        setSchedule(prev => ({
            ...prev,
            days: {
                ...prev.days,
                [day]: {
                    ...prev.days[day],
                    times: prev.days[day].times.filter(
                        (k, i) => i !== index
                    ),
                },
            },
        }));
    };

    const updateTime = (day: DayKey, index: number, value: string) => {
        setSchedule(prev => ({
            ...prev,
            days: {
                ...prev.days,
                [day]: {
                    ...prev.days[day],
                    times: prev.days[day].times.map(
                        (t, i) => i === index ? value : t
                    ),
                },
            },
        }));
    };

    return (
        <View>
            <Modal visible={true} transparent={true} animationType='slide' onRequestClose={() => { Save(); onExit(settings) }}>
                <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                        <View style={{ margin: 20 }}>
                            <Text style={[styles.title, { color: theme.colors.text }]}>
                                Notificações
                            </Text>
                        </View>
                        <View style={[styles.option, { borderColor: theme.colors.border }]}>
                            <View style={[styles.compOption]}>
                                <Text style={[styles.Optiontext, { color: theme.colors.text }]}>Habilitar Notificações Marcadas</Text>
                                <Text style={[styles.OptionSubtext, { color: theme.colors.textSecondary }]}>Avisos quando a data de vencimento estiver próxima</Text>
                            </View>
                            <Switch value={settings.EnableScheduledNotify}
                                onValueChange={async (v) => await onToggleMiddleman("EnableScheduledNotify", v)}
                                trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }}
                                thumbColor={'white'} style={[styles.Slider]} />
                        </View>
                        {settings.EnableScheduledNotify && (
                            <View>
                            </View>
                        )}

                        <View style={[styles.option, { borderColor: theme.colors.border }]}>
                            <View style={styles.compOption}>
                                <Text style={[styles.Optiontext, { color: theme.colors.text }]}>Habilitar Notificações Diárias</Text>
                                <Text style={[styles.OptionSubtext, { color: theme.colors.textSecondary }]}>Lembretes em certos horários em certos dias</Text>
                            </View>
                            <Switch value={enableDailies}
                                onValueChange={async (v) => await onToggleMiddleman('BothDaily', v)}
                                trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }}
                                thumbColor={'white'} style={styles.Slider} />
                        </View>

                        {enableDailies && (
                            <View>
                                <View style={[styles.option, { flex: 1, flexDirection: 'row', alignItems: 'center', margin: 4, paddingStart: 40 }]}>
                                    <Text style={[styles.Optiontext, { color: theme.colors.text }]}>
                                        Notificar Todos os Dias
                                    </Text>
                                    <Switch
                                        value={settings.EnableDailyNotify}
                                        trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }}
                                        thumbColor={'white'}
                                        style={{ flex: 1 }}
                                        onValueChange={everyDay => onToggleMiddleman('EnableDailyNotify', everyDay)}
                                    />
                                </View>
                                {settings.EnableDailyNotify && (
                                    <View style={[styles.daysContainer]}>
                                        <DayEditor
                                            key={'daily'}
                                            label={'Diariamente'}
                                            config={schedule.days['daily']}
                                            onToggle={() =>
                                                onToggleMiddleman('EnableDailyNotify', false)
                                            }
                                            onAddTime={() => addTime('daily')}
                                            onRemoveTime={index => removeTime('daily', index)}
                                            onUpdateTime={(index, value) =>
                                                updateTime('daily', index, value)
                                            }
                                            noSwitch={true}
                                        />
                                    </View>
                                )}
                                <View style={[styles.option, { flex: 1, flexDirection: 'row', alignItems: 'center', margin: 4, paddingStart: 40 }]}>
                                    <Text style={[styles.Optiontext, { color: theme.colors.text }]}>
                                        Notificar em dias específicos da semana
                                    </Text>
                                    <Switch
                                        value={settings.EnableDayOfTheWeekNotify}
                                        trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }}
                                        thumbColor={'white'}
                                        style={{ flex: 1 }}
                                        onValueChange={everyDay => { onToggleMiddleman('EnableDayOfTheWeekNotify', everyDay); }}
                                    />
                                </View>
                                {settings.EnableDayOfTheWeekNotify && (
                                    <View style={[styles.everyDayRow]}>
                                        <View style={styles.daysContainer}>
                                            <View>
                                                <Text style={[styles.title, { color: theme.colors.error }]}>
                                                    {errortext}
                                                </Text>
                                            </View>

                                            {DAYS.map(day => (
                                                <DayEditor
                                                    key={day.key}
                                                    label={day.label}
                                                    config={schedule.days[day.key]}
                                                    onToggle={() =>
                                                        toggleDay(day.key)
                                                    }
                                                    onAddTime={() => addTime(day.key)}
                                                    onRemoveTime={index => removeTime(day.key, index)}
                                                    onUpdateTime={(index, value) =>
                                                        updateTime(day.key, index, value)
                                                    }
                                                />
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </ScrollView>
            </Modal>
        </View>
    );

}

interface DayEditorProps {
    label: string;
    config: DayConfig;

    onToggle: () => void;
    onAddTime: () => void;

    onRemoveTime: (index: number) => void;

    onUpdateTime: (
        index: number,
        value: string
    ) => void;

    noSwitch?: boolean;
    onError?: (text: string) => void;
}

function DayEditor({
    label,
    config,
    onToggle,
    onAddTime,
    onRemoveTime,
    onUpdateTime,
    noSwitch,
    onError,
}: DayEditorProps) {
    const { theme } = useTheme();
    return (
        <View style={[styles.dayCard, { borderColor: theme.colors.border }]}>
            <View style={styles.dayHeader}>
                <Text style={[styles.dayTitle, { color: theme.colors.text }]}>
                    {label}
                </Text>

                {!noSwitch && (

                    <Switch
                        value={config.enabled}
                        trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }}
                        thumbColor={'white'}
                        onValueChange={onToggle}
                    />
                )}
            </View>

            {config.enabled && (
                <>
                    {config.times.map(
                        (time, index) => (
                            <View key={index} style={styles.timeRow}>
                                <TextInput
                                    style={[styles.timeInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
                                    value={time}
                                    placeholder="08:00"
                                    onChangeText={text =>
                                        onUpdateTime(
                                            index,
                                            text
                                        )
                                    }
                                />

                                <Pressable
                                    onPress={() =>
                                        onRemoveTime(
                                            index
                                        )
                                    }
                                >
                                    <Text style={[styles.dayTitle, { color: theme.colors.text }]}>
                                        Remover
                                    </Text>
                                </Pressable>
                            </View>
                        )
                    )}

                    <Pressable
                        style={styles.addButton}
                        onPress={onAddTime}
                    >
                        <Text style={[styles.dayTitle, { color: theme.colors.text }]}>
                            + Adicionar Horário
                        </Text>
                    </Pressable>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
        width: '100%'
    },

    everyDayRow: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
    },

    title: {
        fontSize: 18,
        fontWeight: '600',
    },

    daysContainer: {
        gap: 12,
        width: '100%',
        paddingHorizontal: 20,
    },

    disabledContainer: {
        opacity: 0.5,
    },

    dayCard: {
        justifyContent: 'space-between',
        flex: 1,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        gap: 8,
    },

    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    dayTitle: {
        fontWeight: '600',
        fontSize: 16,
    },

    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    timeInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },

    addButton: {
        alignSelf: 'flex-start',
        paddingVertical: 6,
    },
    Optiontext: {
        alignItems: "flex-start",
        width: "70%"
    },
    OptionSubtext: {
        alignItems: "flex-start",
    },
    option: {
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "nowrap",
        width: "100%",
        borderBottomWidth: 1,
        paddingHorizontal: 20,
        paddingVertical: 20
    },
    compOption: {
        flexDirection: "column",
        flex: 1
    },
    Slider: {
        width: "15%",
        justifyContent: "flex-end",
        alignItems: "flex-end",
    },
});