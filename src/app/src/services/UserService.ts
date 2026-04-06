import firestore from '@react-native-firebase/firestore';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

export const onUserAuthenticated = async (user: FirebaseAuthTypes.User) => {
    if (!user) return;

    try {
        const userRef = firestore().collection('usuarios').doc(user.uid);
        
        await userRef.set({
            nome: user.displayName || 'Usuário Novo',
            email: user.email || '',
            ultimoAcesso: firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

    } catch (error) {
        console.log("Erro ao criar usuario")
    }
};