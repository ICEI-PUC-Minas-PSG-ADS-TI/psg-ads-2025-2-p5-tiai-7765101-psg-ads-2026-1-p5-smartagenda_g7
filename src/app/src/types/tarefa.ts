export type Tarefa = {
    id: string;
    titulo: string;
    estado: "NaoIniciado" | "EmProgresso" | "Finalizado"; // O valor pode ser somente uma das três.
    categorias?: string[];
    descricao_geral?: string;
    data_criado: number; // milisegundos desde 01/01/1970. Traduza usando "new Date(numero).toLocaleString()" ou "new Date(numero).toLocaleDateString()"
    data_vencimento: number; // Ditto acima.
    data_finalizado?: number; // Ditto acima. Só deve ser preenchido quando a tarefa for finalizada.
}

// N: Provavelmente expandirei num sistema de subtarefas, onde cara tarefa pode ter várias tarefas filhas. 
// Nesse caso seria guardado no pai os IDs das tarefas filhas.