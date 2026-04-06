// Funções relacionadas às Tarefas

import type { Tarefa } from '../types/tarefa';

export function CreateTarefa(id:string, titulo: string, data_criado: number, data_vencimento: number, categorias?: string[], descricao_geral?: string, data_finalizado?: number): Tarefa
{
    return {
        id,
        titulo,
        data_criado,
        data_vencimento,
        categorias,
        descricao_geral,
        data_finalizado,
        estado: data_finalizado != undefined && data_finalizado > 0 ? "Finalizado" : "NaoIniciado"
    }
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

