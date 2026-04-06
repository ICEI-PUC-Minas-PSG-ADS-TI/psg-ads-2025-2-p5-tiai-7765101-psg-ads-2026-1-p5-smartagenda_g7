import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

/**
 * Verifica se o usuário existe no Firestore.
 * Se não existir, cria o documento e a subcoleção tarefas.
 */
export async function ensureUserInFirestore(userId: string, email: string | null) {
  try {
    const userRef = firestore().collection('usuarios').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Criar documento do usuário
      await userRef.set({
        email: email || '',
        nome: email?.split('@')[0] || 'Usuário',
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp()
      });
      
      // Criar subcoleção tarefas vazia para evitar problemas futuros
      await userRef.collection('tarefas').doc('_placeholder').set({ temp: 'temp' });
      await userRef.collection('tarefas').doc('_placeholder').delete();
      
      console.log('✅ Usuário criado no Firestore:', userId);
      return true;
    }
    
    console.log('✅ Usuário já existe no Firestore:', userId);
    return false;
  } catch (error) {
    console.error('❌ Erro ao verificar/criar usuário no Firestore:', error);
    throw error;
  }
}

/**
 * Função para ser chamada após o login ou cadastro
 */
export async function onUserAuthenticated(user: any) {
  if (user) {
    await ensureUserInFirestore(user.uid, user.email);
  }
}