import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Tarefa } from '../types/tarefa';

/**
 * Helper centralizado para obter a referência correta do usuário logado.
 * Garante que cada usuário acesse apenas as suas próprias tarefas.
 */
const getTarefasRef = () => {
  const user = auth().currentUser;
  if (!user) throw new Error('Usuário não autenticado');
  
  return firestore()
    .collection('usuarios')
    .doc(user.uid)
    .collection('tarefas');
};

export async function salvarTarefaFirestore(tarefa: Tarefa): Promise<void> {
  try {
    // Mapeamento exato dos dados locais para os tipos do Firestore
    const dadosFirestore = {
      titulo: tarefa.titulo,
      descricao_geral: tarefa.descricao_geral || '',
      data_criado: firestore.Timestamp.fromMillis(tarefa.data_criado),
      data_vencimento: firestore.Timestamp.fromMillis(tarefa.data_vencimento),
      data_finalizado: tarefa.data_finalizado ? firestore.Timestamp.fromMillis(tarefa.data_finalizado) : null,
      categorias: tarefa.categorias || [],
      estado: tarefa.estado,
      updatedAt: firestore.FieldValue.serverTimestamp()
    };

    // Como o ID sempre é gerado no app (offline-first), usamos sempre o set com merge
    await getTarefasRef().doc(tarefa.id).set(dadosFirestore, { merge: true });
    
  } catch (error) {
    console.error('[FirestoreService] Erro ao salvar tarefa:', error);
    throw error;
  }
}

export async function buscarTarefasFirestore(): Promise<Tarefa[]> {
  try {
    const snapshot = await getTarefasRef().orderBy('data_vencimento', 'asc').get();
    const tarefas: Tarefa[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      tarefas.push({
        id: doc.id,
        titulo: data.titulo,
        descricao_geral: data.descricao_geral || data.descricao || '', 
        data_criado: data.data_criado ? data.data_criado.toMillis() : Date.now(),
        data_vencimento: data.data_vencimento ? data.data_vencimento.toMillis() : Date.now(),
        data_finalizado: data.data_finalizado ? data.data_finalizado.toMillis() : undefined,
        categorias: data.categorias || [],
        estado: data.estado || 'NaoIniciado'
      });
    });

    return tarefas;
  } catch (error) {
    console.error('[FirestoreService] Erro ao buscar tarefas:', error);
    return []; // Retorna array vazio em caso de erro para não quebrar a UI
  }
}

export async function atualizarTarefaFirestore(id: string, dados: Partial<Tarefa>): Promise<void> {
  try {
    const updateData: any = {};
    
    if (dados.titulo) updateData.titulo = dados.titulo;
    if (dados.descricao_geral) updateData.descricao_geral = dados.descricao_geral;
    if (dados.data_vencimento) updateData.data_vencimento = firestore.Timestamp.fromMillis(dados.data_vencimento);
    if (dados.categorias) updateData.categorias = dados.categorias;
    if (dados.estado) updateData.estado = dados.estado;
    if (dados.data_finalizado) updateData.data_finalizado = firestore.Timestamp.fromMillis(dados.data_finalizado);
    
    updateData.updatedAt = firestore.FieldValue.serverTimestamp();

    await getTarefasRef().doc(id).update(updateData);
  } catch (error) {
    console.error('[FirestoreService] Erro ao atualizar tarefa:', error);
    throw error;
  }
}

export async function deletarTarefaFirestore(id: string): Promise<void> {
  try {
    await getTarefasRef().doc(id).delete();
  } catch (error) {
    console.error('[FirestoreService] Erro ao deletar tarefa:', error);
    throw error;
  }
}

export async function sincronizarTarefas(tarefasLocais: Record<string, Tarefa>): Promise<void> {
  try {
    const tarefasFirestore = await buscarTarefasFirestore();
    const tarefasFirestoreMap = new Map();
    
    tarefasFirestore.forEach(t => tarefasFirestoreMap.set(t.id, t));
    
    const promises = [];
    
    // Sincronizar: envia para o Firebase as tarefas locais que não estão lá
    for (const [id, tarefa] of Object.entries(tarefasLocais)) {
      if (!tarefasFirestoreMap.has(id)) {
        promises.push(salvarTarefaFirestore(tarefa));
      }
    }
    
    // Dispara todas as requisições de salvamento em paralelo (muito mais rápido)
    if (promises.length > 0) {
      await Promise.all(promises);
      console.log(`[FirestoreService] Sincronização concluída: ${promises.length} tarefas enviadas.`);
    }
    
  } catch (error) {
    console.error('[FirestoreService] Erro na sincronização:', error);
  }
}