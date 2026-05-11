export type Tarefa = {
    id: string;
    titulo: string;
    estado: "NaoIniciado" | "EmProgresso" | "Finalizado"; // O valor pode ser somente uma das três.
    categorias?: string[];
    descricao_geral?: string;
    data_criado: number; // milisegundos desde 01/01/1970. Traduza usando "new Date(numero).toLocaleString()" ou "new Date(numero).toLocaleDateString()"
    data_vencimento: number; // Ditto acima.
    data_finalizado?: number; // Ditto acima. Só deve ser preenchido quando a tarefa for finalizada.
    subtarefas?: string[]; // IDs das subtarefas, caso existam. O formato de cada tarefa é o mesmo.
    parentId?: string; // ID da tarefa pai, caso seja uma subtarefa. O formato é o mesmo de uma tarefa normal.
    //isSubtarefa: boolean; // Indica se a tarefa é uma subtarefa ou não. Principalmente para filtra-las na lista de tarefas.
}

