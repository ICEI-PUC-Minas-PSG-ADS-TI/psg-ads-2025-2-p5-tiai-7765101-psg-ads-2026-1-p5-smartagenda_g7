import { FunctionDeclaration, SchemaType, Tool } from '@google/generative-ai';

export const gerenciamentoTarefasSchema: FunctionDeclaration = {
    name: "gerenciar_tarefas",
    description: "Cria ou edita tarefas e subtarefas no aplicativo. Recebe uma lista de tarefas. Para tarefas com subtarefas novas, utilize IDs temporários (ex: 'temp_1', 'temp_2') para conectá-las usando o array de 'subtarefas' da tarefa pai. O sistema vai resolver os IDs reais automaticamente.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            tarefas: {
                type: SchemaType.ARRAY,
                description: "Um array contendo as tarefas e/ou subtarefas a serem criadas ou modificadas.",
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        id: {
                            type: SchemaType.STRING,
                            description: "ID da tarefa. Para novas tarefas, gere um ID temporário único na requisição (ex: 'temp_1'). Para editar tarefas existentes, envie o ID real."
                        },
                        titulo: {
                            type: SchemaType.STRING,
                            description: "Título curto e claro da tarefa."
                        },
                        descricao_geral: {
                            type: SchemaType.STRING,
                            description: "Descrição estendida com os detalhes do que precisa ser feito na tarefa."
                        },
                        categorias: {
                            type: SchemaType.ARRAY,
                            description: "Lista de tags/categorias para organizar a tarefa (ex: ['Estudos', 'Trabalho']).",
                            items: {
                                type: SchemaType.STRING
                            }
                        },
                        data_criado: {
                            type: SchemaType.NUMBER,
                            description: "Data de criação em timestamp numérico (milisegundos desde 1970). Se omitido, o sistema usará a data atual."
                        },
                        data_vencimento: {
                            type: SchemaType.NUMBER,
                            description: "Data limite de vencimento da tarefa em timestamp numérico (milisegundos desde 1970). É um número inteiro fundamental para determinar o prazo."
                        },
                        data_finalizado: {
                            type: SchemaType.NUMBER,
                            description: "Timestamp em milisegundos indicando quando a tarefa foi concluída. Só deve ser preenchido se a tarefa for dada como finalizada."
                        },
                        subtarefas: {
                            type: SchemaType.ARRAY,
                            description: "Lista de IDs (temporários ou reais) das subtarefas associadas a esta tarefa principal.",
                            items: {
                                type: SchemaType.STRING
                            }
                        },
                        isSubtarefa: {
                            type: SchemaType.BOOLEAN,
                            description: "Define se esta tarefa é uma subtarefa de outra (true) ou se é uma tarefa principal (false)."
                        }
                    },
                    required: ["id", "titulo", "data_vencimento"]
                }
            }
        },
        required: ["tarefas"]
    }
};

export const aiTools: Tool[] = [
    {
        functionDeclarations: [gerenciamentoTarefasSchema]
    }
];
