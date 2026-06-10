import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const STORAGE_KEY = 'ia_interacoes';
const CONVERSACOES_KEY = 'ia_conversacoes_metadata';

export interface IAConversacao {
    id: string;
    titulo: string;
    dataAtualizacao: number;
    dataCriacao: number;
}

export interface IAInteracao {
    id: string;
    conversacaoId?: string;
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

    // ==========================================
    // CONVERSAÇÕES (METADADOS)
    // ==========================================

    static async CarregarConversacoesLocais(): Promise<Record<string, IAConversacao>> {
        try {
            const data = await AsyncStorage.getItem(CONVERSACOES_KEY);
            if (!data) return {};
            return JSON.parse(data);
        } catch (error) {
            console.error('[IAInteracaoService] Erro ao carregar conversações locais:', error);
            return {};
        }
    }

    static async SalvarConversacao(conversacao: IAConversacao, connected?: boolean): Promise<void> {
        try {
            const locais = await this.CarregarConversacoesLocais();
            locais[conversacao.id] = conversacao;
            await AsyncStorage.setItem(CONVERSACOES_KEY, JSON.stringify(locais));

            if (connected) {
                const user = auth().currentUser;
                if (user) {
                    await firestore()
                        .collection('usuarios')
                        .doc(user.uid)
                        .collection('ia_conversacoes')
                        .doc(conversacao.id)
                        .set(conversacao);
                }
            }
        } catch (error) {
            console.error('[IAInteracaoService] Erro ao salvar conversação:', error);
        }
    }

    static async DeletarConversacao(id: string, connected?: boolean): Promise<void> {
        try {
            const locais = await this.CarregarConversacoesLocais();
            delete locais[id];
            await AsyncStorage.setItem(CONVERSACOES_KEY, JSON.stringify(locais));

            if (connected) {
                const user = auth().currentUser;
                if (user) {
                    await firestore()
                        .collection('usuarios')
                        .doc(user.uid)
                        .collection('ia_conversacoes')
                        .doc(id)
                        .delete();
                }
            }
        } catch (error) {
            console.error('[IAInteracaoService] Erro ao deletar conversação:', error);
        }
    }

    static EscutarConversacoesFirebase(callback: (dados: IAConversacao[]) => void) {
        const user = auth().currentUser;
        if (!user) return () => { };

        return firestore()
            .collection('usuarios')
            .doc(user.uid)
            .collection('ia_conversacoes')
            .orderBy('dataAtualizacao', 'desc')
            .onSnapshot(snapshot => {
                const dados = snapshot.docs.map(doc => doc.data() as IAConversacao);
                callback(dados);
            }, error => {
                console.error('[IAInteracaoService] Erro ao escutar conversações:', error);
            });
    }

    // ==========================================
    // INTERAÇÕES (MENSAGENS)
    // ==========================================

    static async CarregarInteracoes(): Promise<Record<string, IAInteracao>> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            if (!data) return {};
            return JSON.parse(data);
        } catch (error) {
            console.error('[IAInteracaoService] Erro ao carregar interações:', error);
            return {};
        }
    }

    static async SalvarInteracao(interacao: IAInteracao, connected?: boolean): Promise<void> {
        try {
            const interacoes = await this.CarregarInteracoes();
            interacoes[interacao.id] = interacao;
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(interacoes));

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
        } catch (error) {
            console.error('[IAInteracaoService] Erro ao salvar interação:', error);
        }
    }

    static async ListarInteracoes(conversacaoId?: string): Promise<IAInteracao[]> {
        try {
            const interacoes = await this.CarregarInteracoes();
            const values = Object.values(interacoes);
            if (conversacaoId) {
                return values.filter(i => i.conversacaoId === conversacaoId);
            }
            return values;
        } catch (error) {
            console.error('[IAInteracaoService] Erro ao listar interações:', error);
            return [];
        }
    }

    static async LimparInteracoes(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
            await AsyncStorage.removeItem(CONVERSACOES_KEY);
            console.log('[IAInteracaoService] Histórico removido.');
        } catch (error) {
            console.error('[IAInteracaoService] Erro ao limpar histórico:', error);
        }
    }

    static async BuscarInteracoesFirebase(conversacaoId?: string): Promise<IAInteracao[]> {
        try {
            const user = auth().currentUser;
            if (!user) return [];

            let query = firestore()
                .collection('usuarios')
                .doc(user.uid)
                .collection('ia_interacoes')
                .orderBy('dataInteracao', 'desc');

            if (conversacaoId) {
                query = query.where('conversacaoId', '==', conversacaoId) as any;
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => doc.data() as IAInteracao);
        } catch (error) {
            console.error('[IAInteracaoService] Erro ao buscar interações Firebase:', error);
            return [];
        }
    }

    static EscutarInteracoesFirebase(callback: (dados: IAInteracao[]) => void, conversacaoId?: string) {
        const user = auth().currentUser;
        if (!user) return () => { };

        let query = firestore()
            .collection('usuarios')
            .doc(user.uid)
            .collection('ia_interacoes')
            .orderBy('dataInteracao', 'desc');

        if (conversacaoId) {
            query = query.where('conversacaoId', '==', conversacaoId) as any;
        }

        return query.onSnapshot(snapshot => {
            const dados = snapshot.docs.map(doc => doc.data() as IAInteracao);
            callback(dados);
        }, error => {
            if (!auth().currentUser) {
                console.log('[IAInteracaoService] Listener de interações encerrado devido a logout.');
                return;
            }
            console.error('[IAInteracaoService] Erro ao escutar interações:', error);
        });
    }
}