import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Tarefa } from '../types/tarefa';

export async function salvarTarefaFirestore(tarefa: Tarefa) {
  try {
    const user = auth().currentUser;

    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar se a tarefa já existe (edição) ou é nova (criação)
    const tarefaRef = firestore()
      .collection('usuarios')
      .doc(user.uid)
      .collection('tarefas');

    if (tarefa.id) {
      // Atualizar tarefa existente
      await tarefaRef.doc(tarefa.id).set({
        titulo: tarefa.titulo,
        descricao: tarefa.descricao_geral,
        data_criado: firestore.Timestamp.fromDate(new Date(tarefa.data_criado)),
        data_vencimento: firestore.Timestamp.fromDate(new Date(tarefa.data_vencimento)),
        data_finalizado: tarefa.data_finalizado ? firestore.Timestamp.fromDate(new Date(tarefa.data_finalizado)) : null,
        categorias: tarefa.categorias || [],
        estado: tarefa.estado,
        updatedAt: firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      console.log('✅ Tarefa atualizada no Firestore!');
    } else {
      // Criar nova tarefa
      const docRef = await tarefaRef.add({
        titulo: tarefa.titulo,
        descricao: tarefa.descricao_geral,
        data_criado: firestore.Timestamp.fromDate(new Date(tarefa.data_criado)),
        data_vencimento: firestore.Timestamp.fromDate(new Date(tarefa.data_vencimento)),
        data_finalizado: tarefa.data_finalizado ? firestore.Timestamp.fromDate(new Date(tarefa.data_finalizado)) : null,
        categorias: tarefa.categorias || [],
        estado: tarefa.estado,
        createdAt: firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Tarefa salva no Firestore com ID:', docRef.id);
      return docRef.id;
    }
  } catch (error) {
    console.error('❌ Erro ao salvar tarefa:', error);
    throw error;
  }
}

export async function buscarTarefasFirestore() {
  try {
    const user = auth().currentUser;
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const snapshot = await firestore()
      .collection('usuarios')
      .doc(user.uid)
      .collection('tarefas')
      .orderBy('data_vencimento', 'asc')
      .get();

    const tarefas: Tarefa[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      tarefas.push({
        id: doc.id,
        titulo: data.titulo,
        descricao_geral: data.descricao || data.descricao_geral, // Compatibilidade com ambos os nomes
        data_criado: data.data_criado?.toDate().getTime() || Date.now(),
        data_vencimento: data.data_vencimento?.toDate().getTime() || Date.now(),
        data_finalizado: data.data_finalizado?.toDate().getTime(),
        categorias: data.categorias || [],
        estado: data.estado || 'NaoIniciado'
      });
    });

    return tarefas;
  } catch (error) {
    console.error('❌ Erro ao buscar tarefas:', error);
    return [];
  }
}

export async function atualizarTarefaFirestore(id: string, dados: Partial<Tarefa>) {
  try {
    const user = auth().currentUser;
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const updateData: any = {};
    if (dados.titulo) updateData.titulo = dados.titulo;
    if (dados.descricao_geral) updateData.descricao = dados.descricao_geral;
    if (dados.data_vencimento) updateData.data_vencimento = firestore.Timestamp.fromDate(new Date(dados.data_vencimento));
    if (dados.categorias) updateData.categorias = dados.categorias;
    if (dados.estado) updateData.estado = dados.estado;
    if (dados.data_finalizado) updateData.data_finalizado = firestore.Timestamp.fromDate(new Date(dados.data_finalizado));
    
    updateData.updatedAt = firestore.FieldValue.serverTimestamp();

    await firestore()
      .collection('usuarios')
      .doc(user.uid)
      .collection('tarefas')
      .doc(id)
      .update(updateData);
      
    console.log('✅ Tarefa atualizada no Firestore!');
  } catch (error) {
    console.error('❌ Erro ao atualizar tarefa:', error);
    throw error;
  }
}

export async function deletarTarefaFirestore(id: string) {
  try {
    const user = auth().currentUser;
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    await firestore()
      .collection('usuarios')
      .doc(user.uid)
      .collection('tarefas')
      .doc(id)
      .delete();
      
    console.log('✅ Tarefa deletada do Firestore!');
  } catch (error) {
    console.error('❌ Erro ao deletar tarefa:', error);
    throw error;
  }
}

// Função para sincronizar dados locais com Firebase
export async function sincronizarTarefas(tarefasLocais: Record<string, Tarefa>) {
  try {
    const tarefasFirestore = await buscarTarefasFirestore();
    const tarefasFirestoreMap = new Map();
    
    tarefasFirestore.forEach(t => tarefasFirestoreMap.set(t.id, t));
    
    // Sincronizar: salvar no Firebase as tarefas locais que não estão no Firebase
    for (const [id, tarefa] of Object.entries(tarefasLocais)) {
      if (!tarefasFirestoreMap.has(id)) {
        await salvarTarefaFirestore(tarefa);
      }
    }
    
    console.log('✅ Sincronização concluída!');
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  }
}