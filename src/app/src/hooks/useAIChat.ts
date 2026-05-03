import { useState, useRef } from 'react';
import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';
import { GEMINI_API_KEY } from '@env';
import { aiTools } from '../tools/aiToolSchemas';
import { CreateTarefaJSON } from '../services/TarefaService';

const INITIAL_TEXT = "Olá! Sou seu assistente de Agenda IA. Como posso te ajudar a organizar suas tarefas e rotina hoje?";
const AI_MODEL = 'gemini-2.5-flash-lite';
const AI_SYSTEM_PROMPT = `
Você é um assistente proativo de produtividade para um aplicativo. Seu objetivo é ajudar a gerenciar a rotina do usuário e criar tarefas complexas quebrando em subtarefas.
CONTEXTO: A data de hoje é ${new Date().toLocaleString()}. 
REGRAS IMPORTANTES:
1. Ao usar a tool de criar tarefas, lembre-se de passar corretamente os timestamps de data_vencimento em milissegundos.
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

export function useAIChat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: INITIAL_TEXT,
            sender: 'assistant',
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    // Armazenando a sessão do chat para reter o histórico
    const chatSessionRef = useRef<ChatSession | null>(null);

    const initChat = () => {
        if (!chatSessionRef.current) {
            const model = genAI.getGenerativeModel({
                model: AI_MODEL,
                tools: aiTools,
                systemInstruction: AI_SYSTEM_PROMPT,
            });

            chatSessionRef.current = model.startChat({
                history: [],
            });
        }
        return chatSessionRef.current;
    };

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
            const chat = initChat();

            // Envia a mensagem do usuário para a IA
            let result = await chat.sendMessage(inputText);

            // Tenta pegar o texto que vem JUNTO com a chamada de função
            try {
                const initialText = result.response.text();
                if (initialText) {
                    setMessages((prev) => [...prev, {
                        id: Date.now().toString() + '-init',
                        text: initialText,
                        sender: 'assistant',
                    }]);
                }
            } catch (e) {
                // Se deu aqui, é porque não veio texto. Ignoramos.
            }

            // Verifica se a resposta pede para invocar funções do sistema
            let functionCalls = result.response.functionCalls();

            while (functionCalls && functionCalls.length > 0) {
                for (const call of functionCalls) {
                    if (call.name === 'gerenciar_tarefas') {
                        try {
                            // A chamada extrai os argumentos em JSON (Object), convertemos para String
                            const argsJson = JSON.stringify(call.args);

                            console.log("[useAIChat] Invocando TarefaService com:", argsJson);

                            // O TarefaService aceita e interpreta a string formatada em JSON com a lista de tarefas
                            const tarefasCriadas = await CreateTarefaJSON(argsJson);

                            // Após processar, mandamos a resposta de execução de volta pro Gemini
                            result = await chat.sendMessage([{
                                functionResponse: {
                                    name: 'gerenciar_tarefas',
                                    response: {
                                        status: 'success',
                                        message: AI_SUCCESS_MESSAGE,
                                        count: tarefasCriadas?.length || 0
                                    }
                                }
                            }]);
                        } catch (err) {
                            console.error("[useAIChat] Erro no gerenciar_tarefas:", err);
                            // Envia o erro de volta para que a IA saiba e relate o problema
                            result = await chat.sendMessage([{
                                functionResponse: {
                                    name: 'gerenciar_tarefas',
                                    response: { status: 'error', message: String(err) }
                                }
                            }]);
                        }
                    }
                }

                // Em casos onde a IA responde com mais uma chamada de função (ex: chamou tool errada e tenta dnv)
                functionCalls = result.response.functionCalls();
            }

            // Após sair do loop das tools, pegamos a resposta final
            let botText = "";
            try {
                botText = result.response.text();
            } catch (e) {
                // Se falhar ao extrair o texto, usamos um fallback para não deixar o usuário no vácuo
                botText = "Pronto! Suas tarefas foram processadas.";
            }

            if (botText) {
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
