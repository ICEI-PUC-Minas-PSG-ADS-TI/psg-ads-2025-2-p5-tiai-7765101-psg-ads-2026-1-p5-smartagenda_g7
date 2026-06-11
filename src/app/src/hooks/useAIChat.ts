import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';
import { GEMINI_API_KEY } from '@env';
import { aiTools } from '../tools/aiToolSchemas';
import { CreateTarefaJSON } from '../services/TarefaService';
import LocalStorageService from '../services/LocalStorageService';
import SaveControlService from '../services/SaveControlService';
import IAInteracaoService from '../services/IAInteracaoService';
import { GeminiProvider, AIprovider, LocalProvider } from '../services/HybridAIService';
import { useNetInfo } from '@react-native-community/netinfo';

const INITIAL_TEXT = "Olá! Sou seu assistente de Agenda IA. Como posso te ajudar a organizar suas tarefas e rotina hoje?";
const AI_MODEL = 'gemini-2.5-flash';
const AI_SYSTEM_PROMPT = `
Você é um assistente proativo de produtividade para um aplicativo. Seu objetivo é ajudar a gerenciar a rotina do usuário e criar tarefas complexas quebrando em subtarefas.
CONTEXTO: A data atual é ${new Date().toLocaleString()}. Horário BRT, fuso horário UTC-3 
REGRAS IMPORTANTES:
1. Ao usar a tool de criar tarefas, lembre-se de passar corretamente as datas no formato ISO 8601 string.
2. APÓS usar qualquer ferramenta, você DEVE enviar uma mensagem amigável ao usuário confirmando em texto natural o que foi feito.`;

const AI_SUCCESS_MESSAGE = "As tarefas foram integradas com sucesso no sistema!";
const AI_ERROR_MESSAGE = "Desculpe, ocorreu um erro de comunicação com os servidores. Verifique sua conexão e tente novamente.";

export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'assistant';
}

// Inicializando a instância do SDK do Gemini com a chave de API das variáveis de ambiente
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Não há verificações de conexão, só utilize LOCAL para forçar o uso da IA Local.
export function useAIChat(local?: Boolean, conversacaoId?: string | null) {
    const Provider = useRef<AIprovider | null>(null);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: INITIAL_TEXT,
            sender: 'assistant',
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const netInfo = useNetInfo();
    const isConnected = netInfo.isConnected ?? true;

    useEffect(() => {
        const loadMessages = async () => {
            if (!conversacaoId) {
                setMessages([{ id: '1', text: INITIAL_TEXT, sender: 'assistant' }]);
                return;
            }
            let interacoes: IAInteracao[] = [];
            if (isConnected && !local) {
                interacoes = await IAInteracaoService.BuscarInteracoesFirebase(conversacaoId);
            }
            if (!interacoes || interacoes.length === 0) {
                interacoes = await IAInteracaoService.ListarInteracoes(conversacaoId);
            }

            if (interacoes.length > 0) {
                interacoes.sort((a,b) => a.dataInteracao - b.dataInteracao);
                const loadedMessages = interacoes.map(i => ({
                    id: i.id,
                    text: i.tipo === 'pergunta' ? i.prompt : i.resposta,
                    sender: i.tipo === 'pergunta' ? 'user' : 'assistant'
                })) as Message[];
                setMessages(loadedMessages);
            } else {
                setMessages([{ id: '1', text: INITIAL_TEXT, sender: 'assistant' }]);
            }
        };
        loadMessages();
    }, [conversacaoId, isConnected, local]);

    // Armazenando a sessão do chat para reter o histórico
    //const chatSessionRef = useRef<ChatSession | null>(null);

    const initProvider = () => {
        if (!Provider.current) {

            if (local) {
                console.log("Using Local AI");
                Provider.current = new LocalProvider();
            }
            else Provider.current = new GeminiProvider();
        }
        return Provider.current;
    };

    useEffect(() => {
        if (local) {
                console.log("Using Local AI");
                Provider.current = new LocalProvider();
            }
            else Provider.current = new GeminiProvider();
    }, [local])

    const sendMessage = async (inputText: string) => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            sender: 'user',
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            //const chat = initChat();
            const provider = initProvider();

            await IAInteracaoService.SalvarInteracao({
                id: Date.now().toString(),
                conversacaoId: conversacaoId || undefined,

                tipo: 'pergunta',

                prompt: inputText.trim(),
                resposta: '',

                dataInteracao: Date.now(),

                executada: true,

                sincronizada: false,
                localOnly: true
            }, !local);

            // Envia a mensagem do usuário para a IA
            //console.log("sending it");
            let result = await provider.sendMessage(inputText, []);
            if (!result) {
                throw new Error("Resposta vazia do provedor de IA");
            }

            // Verifica se a resposta pede para invocar funções do sistema
            let functionCalls = result.toolCalls;

            while (functionCalls && functionCalls.length > 0) {
                for (const call of functionCalls) {
                    const callName = call.name;
                    let functionResponseData: any;

                    try {
                        if (callName === 'gerenciar_tarefas') {
                            const argsJson = JSON.stringify(call.args);
                            console.log("[useAIChat] Invocando TarefaService (Criar) com:", argsJson);
                            const tarefasCriadas = await CreateTarefaJSON(argsJson);

                            // Salvando as tarefas criadas ativamente
                            if (tarefasCriadas && tarefasCriadas.length > 0) {
                                for (const t of tarefasCriadas) {
                                    await SaveControlService.TrySalvarTarefa(t, true);
                                }
                            }

                            functionResponseData = {
                                status: 'success',
                                message: 'Tarefas criadas e persistidas com sucesso.',
                                count: tarefasCriadas?.length || 0
                            };
                        }
                        else if (callName === 'listar_tarefas') {
                            console.log("[useAIChat] Invocando LocalStorageService.CarregarTarefasArray()");
                            const tarefas = await LocalStorageService.CarregarTarefasArray();

                            // Extrair apenas o necessário para otimizar o contexto
                            const resumo = (tarefas || []).map(t => ({
                                id: t.id,
                                titulo: t.titulo,
                                estado: t.estado,
                                vencimento: t.data_vencimento ? new Date(t.data_vencimento).toLocaleString() : 'Sem prazo'
                            }));

                            functionResponseData = {
                                status: 'success',
                                tarefas: resumo
                            };
                        }
                        else if (callName === 'editar_tarefa') {
                            const args = call.args as Record<string, any>;
                            console.log("[useAIChat] Invocando edição com:", args);
                            const tarefasLocais = await LocalStorageService.CarregarTarefas() || {};
                            const identificador = args.identificador as string;
                            let tarefa = tarefasLocais[identificador];

                            if (!tarefa) {
                                const lista = Object.values(tarefasLocais);
                                tarefa = lista.find(t => t.titulo.toLowerCase() === identificador.toLowerCase()) as any;
                            }

                            if (tarefa) {
                                if (args.titulo) tarefa.titulo = args.titulo as string;
                                if (args.descricao_geral) tarefa.descricao_geral = args.descricao_geral as string;
                                if (args.data_vencimento) tarefa.data_vencimento = new Date(args.data_vencimento as string).getTime();
                                if (args.estado) tarefa.estado = args.estado as any;

                                await SaveControlService.TrySalvarTarefa(tarefa, true);

                                functionResponseData = {
                                    status: 'success',
                                    message: `Tarefa atualizada e persistida.`
                                };
                            } else {
                                functionResponseData = {
                                    status: 'error',
                                    message: `Tarefa com identificador ${args.identificador} não encontrada.`
                                };
                            }
                        }
                        else if (callName === 'excluir_tarefa') {
                            const args = call.args as Record<string, any>;
                            const identificador = args.identificador as string;
                            console.log("[useAIChat] Invocando exclusão para identificador:", identificador);

                            const tarefasLocais = await LocalStorageService.CarregarTarefas() || {};
                            let idParaExcluir = identificador;

                            if (!tarefasLocais[idParaExcluir]) {
                                const lista = Object.values(tarefasLocais);
                                const tarefaEnc = lista.find(t => t.titulo.toLowerCase() === identificador.toLowerCase());
                                if (tarefaEnc) idParaExcluir = tarefaEnc.id;
                            }

                            // Deleta localmente e limpa links de subtarefas
                            await LocalStorageService.DeletarTarefa(idParaExcluir);
                            // Sincroniza essa exclusão para refletir no Firebase
                            await SaveControlService.TrySalvar();

                            functionResponseData = {
                                status: 'success',
                                message: `Tarefa excluída e persistida.`
                            };
                        }

                        // Envia a resposta de volta ao Gemini após processar e salvar tudo
                        result = await provider.sendToolResult({
                            toolName: callName,
                            result: functionResponseData
                        });

                    } catch (err) {
                        console.error(`[useAIChat] Erro na tool ${callName}:`, err);
                        result = await provider.sendToolResult({
                            toolName: callName,
                            result: {
                                status: 'error',
                                message: String(err)
                            }
                        });
                    }
                }

                // Em casos onde a IA responde com mais uma chamada de função (ex: chamou tool errada e tenta dnv)
                functionCalls = result.toolCalls;
            }//*/

            // Após sair do loop das tools, pegamos a resposta final
            let botText = "";
            try {
                if (result.text) botText = result.text;
                else botText = "Pronto! Suas tarefas foram processadas.";

            } catch (e) {
                // Se falhar ao extrair o texto, usamos um fallback para não deixar o usuário no vácuo
                botText = "Pronto! Suas tarefas foram processadas.";
            }
            if (botText) {
                await IAInteracaoService.SalvarInteracao({
                    id: (Date.now() + 1).toString(),
                    conversacaoId: conversacaoId || undefined,

                    tipo: 'resposta',

                    prompt: inputText,
                    resposta: botText,

                    dataInteracao: Date.now(),

                    executada: true,

                    sincronizada: true,
                    localOnly: !!local
                }, !local);

                const botMessage: Message = {

                    id: (Date.now() + 1).toString(),
                    text: botText,
                    sender: 'assistant',
                };
                setMessages((prev) => [...prev, botMessage]);
            }

        } catch (error) {
            console.error('[useAIChat] Erro geral na comunicação:', error);
            setMessages((prev) => [...prev, {
                id: Date.now().toString(),
                text: AI_ERROR_MESSAGE,
                sender: 'assistant',
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return { messages, sendMessage, isLoading };
}
