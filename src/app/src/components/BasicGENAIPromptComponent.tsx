// Esse componente é somente para teste. Funções podem ser encontradas em services/GENAIService.ts
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { localGenerateText } from '../services/GENAIService';

export default function AIScreen() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(''); // Resposta da IA
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(""); // Texto de Loading

  const handleSend = async () => {
    if (!prompt.trim()) return;

    //console.log("Sending prompt");

    setLoading(true);
    setResponse('');

    try {
      const start = Date.now(); // tempo de inicio, para ver o tempo de demora
      const result = await localGenerateText(prompt, setLoadingText); // o setLoadingText é alterado para mostrar o progresso da geração
      setResponse(result);
      const end = Date.now(); // tempo de fim, para ver o tempo de demora
      setLoadingText("Gerado em " + ((end - start)/1000)+ " segundos")
    } catch (err) {
      console.error(err);
      setResponse('AI had a meltdown: ' + err);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Local LLM Test</Text>

      <TextInput
        style={styles.input}
        placeholder="Write your prompt..."
        value={prompt}
        onChangeText={setPrompt}
        multiline
      />

      <Button title="Send" onPress={handleSend} />

      <Text style={styles.loadingText}>{loadingText}</Text>
      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}

      <ScrollView style={styles.resultBox}>
        <Text style={styles.resultText}>{response}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 50,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    color: "white",
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    minHeight: 80,
    marginBottom: 10,
  },
  resultBox: {
    marginTop: 20,
    flex: 1,
  },
  resultText: {
    color: "white",
    fontSize: 16,
  },
  loadingText: {
    color: "white",
    fontSize: 12,
  },
});