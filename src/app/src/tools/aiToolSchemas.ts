import { FunctionDeclaration, SchemaType, Tool } from '@google/generative-ai';

export const gerenciamentoTarefasSchema: FunctionDeclaration = {
    name: "gerenciar_tarefas",
    description: "Cria tarefas e subtarefas no aplicativo. Recebe uma lista de tarefas. Para tarefas com subtarefas novas, utilize IDs temporários (ex: 'temp_1', 'temp_2') para conectá-las usando o array de 'subtarefas' da tarefa pai. O sistema vai resolver os IDs reais automaticamente." +  
    "Use esta ferramenta SEMPRE que o usuário pedir para criar, adicionar, planejar, agendar, montar, organizar ou cadastrar tarefas, compromissos, metas, lembretes, rotinas ou subtarefas. " ,
    
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
                            type: SchemaType.STRING,
                            description: "Data de criação no formato string ISO 8601 (ex: '2026-05-06T00:00:00Z'). Se omitido, o sistema usará a data atual."
                        },
                        data_vencimento: {
                            type: SchemaType.STRING,
                            description: "Data limite de vencimento da tarefa no formato string ISO 8601 (ex: '2026-05-06T00:00:00Z')."
                        },
                        data_finalizado: {
                            type: SchemaType.STRING,
                            description: "Data em string ISO 8601 indicando quando a tarefa foi concluída. Só deve ser preenchido se a tarefa for dada como finalizada."
                        },
                        subtarefas: {
                            type: SchemaType.ARRAY,
                            description: "Lista de IDs (temporários ou reais) das subtarefas associadas a esta tarefa principal.",
                            items: {
                                type: SchemaType.STRING
                            }
                        },
                        parentId: {
                            type: SchemaType.STRING,
                            description: "O ID do pai da tarefa, caso esta seja uma subtarefa. Para tarefas principais, este campo deve ser omitido ou nulo."
                        }
                    },
                    required: ["id", "titulo", "data_vencimento"]
                }
            }
        },
        required: ["tarefas"]
    }
};

export const listarTarefasSchema: FunctionDeclaration = {
    name: "listar_tarefas",
    description: "Recupera a lista de todas as tarefas e rotinas cadastradas no sistema. Use esta ferramenta sempre que o usuário perguntar sobre suas tarefas atuais, horários, prazos ou quiser saber como está a sua rotina.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {}
    }
};

export const editarTarefaSchema: FunctionDeclaration = {
    name: "editar_tarefa",
    description: "Edita uma tarefa existente. Somente o 'identificador' é obrigatório. Os demais campos enviados substituirão os valores atuais da tarefa.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            identificador: {
                type: SchemaType.STRING,
                description: "Nome exato (título) ou ID obrigatório da tarefa que será editada."
            },
            titulo: {
                type: SchemaType.STRING,
                description: "Novo título da tarefa."
            },
            descricao_geral: {
                type: SchemaType.STRING,
                description: "Nova descrição da tarefa."
            },
            data_vencimento: {
                type: SchemaType.STRING,
                description: "Nova data de vencimento em formato string ISO 8601 (ex: '2026-05-06T00:00:00Z')."
            },
            estado: {
                type: SchemaType.STRING,
                description: "Novo status da tarefa. Opções válidas estritas: 'NaoIniciado', 'EmProgresso', ou 'Finalizado'."
            }
        },
        required: ["identificador"]
    }
};

export const excluirTarefaSchema: FunctionDeclaration = {
    name: "excluir_tarefa",
    description: "Exclui permanentemente uma tarefa do sistema.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            identificador: {
                type: SchemaType.STRING,
                description: "Nome exato (título) ou ID obrigatório da tarefa a ser excluída."
            }
        },
        required: ["identificador"]
    }
};

export const aiTools: Tool[] = [
    {
        functionDeclarations: [
            gerenciamentoTarefasSchema,
            listarTarefasSchema,
            editarTarefaSchema,
            excluirTarefaSchema
        ]
    }
];
