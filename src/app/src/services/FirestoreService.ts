import { FirebaseAuthTypes, getAuth, signOut } from '@react-native-firebase/auth';
import { Tarefa } from '../types/tarefa';
import { getApp } from '@react-native-firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  FirebaseFirestoreTypes,
  serverTimestamp,
} from '@react-native-firebase/firestore';

const app = getApp();
const db = getFirestore(app);
const auth = getAuth(app);

type FirestoreTarefa = {
  titulo: string;
  descricao_geral?: string;
  descricao?: string;
  data_criado?: Timestamp;
  data_vencimento?: Timestamp;
  data_finalizado?: Timestamp | null;
  categorias?: string[];
  estado?: "NaoIniciado" | "EmProgresso" | "Finalizado";
  subtarefas?: string[];
  parentId?: string;
};

/**
 * Helper centralizado para obter a referência correta do usuário logado.
 * Garante que cada usuário acesse apenas as suas próprias tarefas.
 */
const getTarefasRef = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');

  return collection(db, 'usuarios', user.uid, 'tarefas') as FirebaseFirestoreTypes.CollectionReference<FirestoreTarefa>;
};
export function GetCurrentUser(): FirebaseAuthTypes.User | null {
  try {
    return auth.currentUser;
  }
  catch {
    console.log("No user authenticated");
    return null;
  }
}

export function IsAuth(): boolean {
  let user = GetCurrentUser();
  if (!user) return false;
  return true;
}

export async function Signout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Erro no logout:', error);
    throw error;
  }
}

export async function salvarTarefaFirestore(tarefa: Tarefa): Promise<void> {
  try {
    // Mapeamento exato dos dados locais para os tipos do Firestore
    const dadosFirestore = {
      titulo: tarefa.titulo,
      descricao_geral: tarefa.descricao_geral || '',
      data_criado: Timestamp.fromMillis(tarefa.data_criado),
      data_vencimento: Timestamp.fromMillis(tarefa.data_vencimento),
      data_finalizado: tarefa.data_finalizado ? Timestamp.fromMillis(tarefa.data_finalizado) : null,
      categorias: tarefa.categorias || [],
      estado: tarefa.estado,
      subtarefas: tarefa.subtarefas || [],
      parentId: tarefa.parentId || null,
      updatedAt: serverTimestamp()
    };

    // Como o ID sempre é gerado no app (offline-first), usamos sempre o set com merge
    //await getTarefasRef().doc(tarefa.id).set(dadosFirestore, { merge: true });
    const tarefaRef = doc(getTarefasRef(), tarefa.id);

    await setDoc(tarefaRef, dadosFirestore, {
      merge: true,
    });

  } catch (error) {
    console.error('[FirestoreService] Erro ao salvar tarefa:', error);
    throw error;
  }
}

export async function buscarTarefasFirestore(): Promise<Tarefa[]> {
  try {
    const q = query(
      getTarefasRef(),
      orderBy('data_vencimento', 'asc')
    );

    const snapshot = await getDocs(q);
    const tarefas: Tarefa[] = [];

    snapshot.forEach((d: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirestoreTarefa>) => {
      const data = d.data();
      tarefas.push({
        id: d.id,
        titulo: data.titulo,
        descricao_geral: data.descricao_geral || data.descricao || '',
        data_criado: data.data_criado ? data.data_criado.toMillis() : Date.now(),
        data_vencimento: data.data_vencimento ? data.data_vencimento.toMillis() : Date.now(),
        data_finalizado: data.data_finalizado ? data.data_finalizado.toMillis() : undefined,
        categorias: data.categorias || [],
        estado: data.estado || 'NaoIniciado',
        subtarefas: data.subtarefas || [],
        parentId: data.parentId ? data.parentId : undefined,
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
    if (dados.data_vencimento) updateData.data_vencimento = Timestamp.fromMillis(dados.data_vencimento);
    if (dados.categorias) updateData.categorias = dados.categorias;
    if (dados.estado) updateData.estado = dados.estado;
    if (dados.data_finalizado) updateData.data_finalizado = Timestamp.fromMillis(dados.data_finalizado);
    if (dados.parentId) updateData.parentId = dados.parentId;

    updateData.updatedAt = serverTimestamp();

    //await getTarefasRef().doc(id).update(updateData);
    const tarefaRef = doc(getTarefasRef(), id);

    await updateDoc(tarefaRef, updateData);
  } catch (error) {
    console.error('[FirestoreService] Erro ao atualizar tarefa:', error);
    throw error;
  }
}

export async function deletarTarefaFirestore(id: string): Promise<void> {
  try {
    const tarefaRef = doc(getTarefasRef(), id);

    await deleteDoc(tarefaRef);
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