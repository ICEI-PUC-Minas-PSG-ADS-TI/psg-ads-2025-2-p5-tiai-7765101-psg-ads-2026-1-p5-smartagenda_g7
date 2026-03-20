export type Tarefa = {
    id: string;
    titulo: string;
    estado: string; // NÃO INICIADO; EM PROGRESSO; FINALIZADO
    categorias: string[];
    descricao_geral: string;
    data_criado: number; // milisegundos desde 01/01/1970. Traduza usando "new Date(numero).toLocaleString()"
    data_vencimento: number; // Ditto acima.
    data_finalizado: number; // Deve iniciar como -1 para tarefas não finalizadas.
}