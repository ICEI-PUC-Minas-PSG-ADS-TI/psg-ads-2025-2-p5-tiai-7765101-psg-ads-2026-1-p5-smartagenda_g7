import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
const STORAGE_KEY = 'ia_interacoes';

export interface IAInteracao {
    id: string;

    usuarioId?: string | null;
    tarefaId?: string | null;

    tipo: string;

    prompt: string;
    resposta: string;

    alteracaoRealizada?: string | null;

    dataInteracao: number;

    executada: boolean;

    sincronizada: boolean;
    localOnly: boolean;
}

export default class IAInteracaoService {

    static async CarregarInteracoes(): Promise<Record<string, IAInteracao>> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);


            if (!data) {
                return {};
            }

            return JSON.parse(data);

        } catch (error) {
            console.error('[IAInteracaoService] Erro ao carregar interações:', error);
            return {};
        }
    }

    static async SalvarInteracao(interacao: IAInteracao, connected?: boolean): Promise<void> {
        try {

            // SALVA LOCALMENTE

            const interacoes = await this.CarregarInteracoes();

            interacoes[interacao.id] = interacao;

            await AsyncStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(interacoes)
            );


            // SALVA NO FIREBASE

            if (connected) {
                const user = auth().currentUser;

                if (user) {
                    await firestore()
                        .collection('usuarios')
                        .doc(user.uid)
                        .collection('ia_interacoes')
                        .doc(interacao.id)
                        .set(interacao);
                }
            }

            console.log('[IAInteracaoService] Interação salva localmente ', connected ? 'e no Firebase.' : '');

        } catch (error) {
            console.error('[IAInteracaoService] Erro ao salvar interação:', error);
        }
    }

    static async ListarInteracoes(): Promise<IAInteracao[]> {
        try {
            const interacoes = await this.CarregarInteracoes();

            return Object.values(interacoes);

        } catch (error) {
            console.error('[IAInteracaoService] Erro ao listar interações:', error);
            return [];
        }
    }

    static async LimparInteracoes(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);

            console.log('[IAInteracaoService] Histórico removido.');

        } catch (error) {
            console.error('[IAInteracaoService] Erro ao limpar histórico:', error);
        }
    }

    static async BuscarInteracoesFirebase(): Promise<IAInteracao[]> {
        try {
            const user = auth().currentUser;

            if (!user) {
                return [];
            }

            const snapshot = await firestore()
                .collection('usuarios')
                .doc(user.uid)
                .collection('ia_interacoes')
                .orderBy('dataInteracao', 'desc')
                .get();

            return snapshot.docs.map(doc => doc.data() as IAInteracao);

        } catch (error) {
            console.error('[IAInteracaoService] Erro ao buscar interações Firebase:', error);
            return [];
        }
    }
    static EscutarInteracoesFirebase(
        callback: (dados: IAInteracao[]) => void
    ) {

        const user = auth().currentUser;

        if (!user) {
            return () => { };
        }

        return firestore()
            .collection('usuarios')
            .doc(user.uid)
            .collection('ia_interacoes')
            .orderBy('dataInteracao', 'desc')
            .onSnapshot(snapshot => {

                const dados = snapshot.docs.map(doc =>
                    doc.data() as IAInteracao
                );

                callback(dados);

            }, error => {

                console.error(
                    '[IAInteracaoService] Erro ao escutar interações:',
                    error
                );
            });
    }
}


