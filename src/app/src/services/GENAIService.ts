import { generateText } from 'ai';
import { mlc } from '@react-native-ai/mlc';

// Singleton do modelo
let modelInstance: ReturnType<typeof mlc.languageModel> | null = null;

// Setup LOCAL da LLM, deve rodar somente uma vez
export async function initLocalModel(onProgress?: (msg: string) => void) {
  if (modelInstance) return modelInstance;

  modelInstance = mlc.languageModel('Llama-3.2-3B-Instruct'); // pode ser alterado para outro modelo

  console.log("Downloading LLM model...");
  // autodetecta se já está instalado, então as gerações seguintes demoram menos.
  await modelInstance.download((progress) => {
    const percent = Math.floor(progress.percentage * 100);

    onProgress?.(`Downloading model ${percent}%`);
  });
  console.log("Preparing LLM model...");
  onProgress?.("Preparing model...");
  await modelInstance.prepare();

  isInitializing = false;

  return modelInstance;
}

let isInitializing = false;
let initPromise: Promise<any> | null = null;

// Para o carregamento ao iniciar
export function preloadModel() {
  if (modelInstance) return Promise.resolve(modelInstance);
  if (isInitializing && initPromise) return initPromise;

  isInitializing = true;

  initPromise = initLocalModel()

  return initPromise;
}

// Geração de texto
export async function localGenerateText(prompt: string, onProgress?: (msg: string) => void): Promise<string> {
  console.log("Starting prompt with text " + prompt);
  const model = await initLocalModel(onProgress);
  console.log("AI Model Loaded!");
  onProgress?.("AI Model Loaded!");

  onProgress?.("Generating Text...");
  const { text } = await generateText({
    model: model,
    prompt: `
      You are an LLM based on Llama-3.2-3B-Instruct and you are being tested as a proof of concept for a project in the fifth semester of the ADS course in the PUC university.
  
      User: ${prompt}
        Assistant:
  `
  });
  onProgress?.("");
  console.log("Prompt generated");

  return text;
}