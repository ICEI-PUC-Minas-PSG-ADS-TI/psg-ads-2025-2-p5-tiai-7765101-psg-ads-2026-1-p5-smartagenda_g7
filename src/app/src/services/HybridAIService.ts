import { useRef } from 'react';
import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';
import { GEMINI_API_KEY } from '@env';
import { aiTools } from '../tools/aiToolSchemas';
import { localGenerateText, preloadModel, initLocalModel } from './LocalGenAIService';

type ChatMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};

export interface AIToolCall {
    name: string;
    args: any;
}
export interface AIToolResult {
    toolName: string;
    result: any;
}

export interface AIresponse {
    text?: string;
    toolCalls?: AIToolCall[];
}

export interface AIprovider {
    sendMessage(message: string, history: ChatMessage[]): Promise<AIresponse>;

    sendToolResult(
        toolResult: AIToolResult
    ): Promise<AIresponse>;

    //initChat(): ChatSession;
}

// GEMINI --------------------------------------------------------------------------------------------------

const GEMINI_AI_MODEL = 'gemini-2.5-flash';
const GEMINI_AI_SYSTEM_PROMPT = `
Você é um assistente proativo de produtividade para um aplicativo. Seu objetivo é ajudar a gerenciar a rotina do usuário e criar tarefas complexas quebrando em subtarefas.
CONTEXTO: A data atual é ${new Date().toLocaleString()}. Horário BRT, fuso horário UTC-3 
REGRAS IMPORTANTES:
1. Ao usar a tool de criar tarefas, lembre-se de passar corretamente as datas no formato ISO 8601 string.
2. APÓS usar qualquer ferramenta, você DEVE enviar uma mensagem amigável ao usuário confirmando em texto natural o que foi feito.`;

export class GeminiProvider implements AIprovider {

    public genAI: GoogleGenerativeAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    public chatSession: ChatSession | null = null;

    initChat = () => {
        if (!this.chatSession) {
            const model = this.genAI.getGenerativeModel({
                model: GEMINI_AI_MODEL,
                tools: aiTools,
                systemInstruction: GEMINI_AI_SYSTEM_PROMPT,
            });

            this.chatSession = model.startChat({
                history: [],
            });
        }
        return this.chatSession;
    };

    async sendMessage(message: string, history: ChatMessage[]): Promise<AIresponse> {
        const chat = this.initChat();

        const result = await chat.sendMessage(message);

        return {
            text: result.response.text(),
            toolCalls: result.response.functionCalls()?.map(fc => ({
                name: fc.name,
                args: fc.args
            }))
        };
    }

    async sendToolResult(toolResult: AIToolResult): Promise<AIresponse> {

        const result = await this.chatSession!.sendMessage([
            {
                functionResponse: {
                    name: toolResult.toolName,
                    response: toolResult.result
                }
            }
        ]);

        return {
            text: result.response.text(),
            toolCalls: result.response.functionCalls()?.map(fc => ({
                name: fc.name,
                args: fc.args
            }))
        };
    }
}

// LOCAL ---------------------------------------------------------------------------------------------

export class LocalProvider implements AIprovider {

    history: ChatMessage[] = [];

    async initChat() {
        console.log("starting local model");
        return await initLocalModel();
    };

    async sendMessage(input: string, history: ChatMessage[]): Promise<AIresponse> {
        console.log("localprovider");
        this.AddToHistory({
            role: 'user',
            content: input
        });

        const fullPrompt = input;//const fullPrompt = buildPrompt(history, input);

        const raw = await localGenerateText(fullPrompt, (e) => console.log(e));
        console.log(raw);

        const result = this.SafeParse(raw);

        console.log(result);

        if (result && result.text) {
            try {
                this.AddToHistory({
                    role: 'assistant',
                    content: result.text ?? ''
                });

                return result;
            } catch (err) {
                console.error("Failed to parse AI JSON:", err);

                // fallback if model returns plain text
                this.AddToHistory({
                    role: 'assistant',
                    content: result.text
                });

                return {
                    text: result.text
                };
            }
        }

        console.log("Couldn't send local message.");

        return {
            text: "Sorry, an internal error occorred"
        }
    }

    async sendToolResult(toolResult: AIToolResult): Promise<AIresponse> {

        let returned = {}
        this.AddToHistory({
            role: 'system',
            content:
                `Tool "${toolResult.toolName}" executed. Result: ${JSON.stringify(toolResult.result)}`
        });

        //Não vale a pena fazer uma resposta separada para isso.
        return {
            text: toolResult.result
        }
        /*
        const raw = await localGenerateText(
            this.buildPrompt()
        );

        const parsed = this.SafeParse(raw);

        if (parsed && parsed.text) {
            this.AddToHistory({
                role: 'assistant',
                content: parsed.text
            });
            return parsed;
        }

        return {
            text: "Sorry, an internal error occorred"
        }*/
    }

    SafeParse(raw: string): AIresponse | null {
        if (raw) {
            try {
                let extracted = this.ExtractJson(raw);

                const cleaned = extracted.replace(/\/\/.*$/gm, "").replace('": undefined', '": null').replace('":undefined', '":null');

                let parsed = JSON.parse(cleaned);
                if (parsed) {
                    // 'ill do more stuff here later
                    parsed.text = parsed.message;
                    return parsed;
                }
            }
            catch (e) {
                console.error("Couldn't parse Local AI response! ", e);
            }
        }
        return null;
    }

    ExtractJson(raw: string): string {
        const start = raw.indexOf('{');
        const end = raw.lastIndexOf('}');

        if (start === -1 || end === -1)
            throw new Error("No JSON found");

        return raw.slice(start, end + 1);
    }

    buildPrompt(): string {
        let res = `You are an AI assistant.

Available tools:

1. gerenciar_tarefas
2. listar_tarefas
3. editar_tarefa
4. excluir_tarefa

When you need a tool, respond ONLY in JSON:

{
  "toolCalls": [
    {
      "name": "gerenciar_tarefas",
      "args": {
        ...
      }
    }
  ],
  "message": "..."
}

Otherwise respond:

{
  "message": "..."
}
  
Chats: ${this.history
                .map(m => `${m.role}: ${m.content}`)
                .join('\n\n')}`
        return res;
    }

    AddToHistory(message: ChatMessage) {
        this.history.push(message);
        if (this.history.length > 7) {
            this.history = this.history.slice(1);
        }
    }
}