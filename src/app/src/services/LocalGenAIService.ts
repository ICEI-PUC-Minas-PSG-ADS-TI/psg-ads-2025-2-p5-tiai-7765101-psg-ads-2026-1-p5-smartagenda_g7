import { generateText } from 'ai';
import RNFS from 'react-native-fs';
import { mlc } from '@react-native-ai/mlc';
import { llama, downloadModel, isModelDownloaded, getModelPath } from '@react-native-ai/llama'

// Singleton do modelo
//let modelInstance: ReturnType<typeof mlc.languageModel> | null = null;
let modelInstance: ReturnType<typeof llama.languageModel> | null = null

const MODEL = 'ggml-org/SmolLM3-3B-GGUF/SmolLM3-Q4_K_M.gguf'

export async function IsDownloaded() {
  const modelId =
    MODEL;

  const alreadyDownloaded = await isModelDownloaded(modelId);

  return alreadyDownloaded;
}

// Setup LOCAL da LLM, deve rodar somente uma vez
export async function initLocalModel(onProgress?: (msg: string) => void) {
  if (modelInstance) return modelInstance;

  //modelInstance = mlc.languageModel('Llama-3.2-3B-Instruct'); // pode ser alterado para outro modelo

  console.log("Downloading LLM model...");
  const modelPath = await downloadModel(
    MODEL,
    (progress) => {
      const percent = progress.percentage

      onProgress?.(`Downloading model... (${percent}%)`)
    }
  )
  modelInstance = llama.languageModel(modelPath);

  // autodetecta se já está instalado, então as gerações seguintes demoram menos.
  /*await modelInstance.download((progress) => {
    const percent = Math.floor(progress.percentage * 100);

    onProgress?.(`Downloading model ${percent}%`);
  });//*/
  console.log("Preparing LLM model...");
  onProgress?.("Preparing model...");
  await modelInstance.prepare();

  isInitializing = false;

  return modelInstance;
}

export async function UninstallModel() {
  const path = getModelPath(MODEL);
  await RNFS.unlink(path);
}

let isInitializing = false;
let initPromise: Promise<any> | null = null;

// Para o carregamento ao iniciar
export async function preloadModel() {
  if (modelInstance) return Promise.resolve(modelInstance);
  if (isInitializing && initPromise) return initPromise;

  isInitializing = true;

  initPromise = initLocalModel()

  return initPromise;
}

// Geração de texto
export async function localGenerateText(prompt: string, onProgress?: (msg: string) => void): Promise<string> {
  console.log("Starting prompt with text '" + prompt + "'");
  const model = await initLocalModel(onProgress);
  console.log("AI Model Loaded!");
  onProgress?.("AI Model Loaded!");

  onProgress?.("Generating Text...");
  const { text } = await generateText({
    model: model,
    prompt: `
       You are an AI assistant.

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

args must contain the following fields with the following types: 
{
    "id": number, // required
    "titulo": string, // required. If unspecified, set simply as "task"
    "descricao_geral": string, // optional
    "vence_dias_de_hoje": number, // required if the user says a relative time-frame, example: "3 days from today", "two weeks from today (14 days)" IF NOT SPECIFIED IN THIS OR AS A DATE, SET THIS TO 7 DAYS
    "vence_data_DDMMYYYY": string, // required if the user says an exact date for the date, this is set as a string in the format "DD/MM/YYYY"
    "subtarefas": number[] // optional, only needed if the task has sub-tasks, if so, store the ID of those sub-tasks in this array.
}

Otherwise respond:

{
  "message": "..."
}

User: ${prompt}
Assistant:
  `
  });
  onProgress?.("");
  console.log("Prompt generated");

  return text;
}