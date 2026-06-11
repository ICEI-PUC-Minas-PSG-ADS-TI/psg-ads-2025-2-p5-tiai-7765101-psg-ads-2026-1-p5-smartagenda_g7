
# 3. Especificações do Projeto

Nesta seção serão detalhados:

- ✅ Requisitos Funcionais  
- ✅ Histórias de Usuário  
- ✅ Requisitos Não Funcionais  
- ✅ Restrições do Projeto  

O objetivo é organizar claramente as funcionalidades, qualidades e limites da solução.

---

# 3.1 Requisitos Funcionais

### Tabela de Requisitos Funcionais

| ID    | Módulo | Descrição do Requisito | Prioridade |
|-------|--------|------------------------|------------|
| RF-01 | Autenticação | O sistema deve permitir que os usuários realizem cadastro e login informando e-mail e senha. | 🔴 ALTA |
| RF-02 | Gerenciamento | O sistema deve permitir que os usuários gerenciem tarefas, com Título, Data de Criação, Data de Validade, Categoria(s) (tags) e Descrição geral. | 🔴 ALTA |
| RF-03 | Gerenciamento | O sistema deve permitir que o usuário navegue para a página de edição da tarefa a partir da sua respectiva página de detalhes. | 🟡 MÉDIA |
| RF-04 | Gerenciamento | O sistema deve permitir que o usuário marque uma tarefa como completa, com um menu de confirmação, na listagem de tarefas e em sua página de detalhes. | 🔴 ALTA |
| RF-05 | Visualização | O sistema deve permitir que os usuários visualizem as tarefas registradas em forma de lista, ordenadas pela data de validade mais próxima. | 🔴 ALTA |
| RF-06 | Visualização | O sistema deve permitir que os usuários selecionem as tarefas, em listas ou calendários, exibindo mais detalhes sobre elas. | 🔴 ALTA |
| RF-07 | Visualização | O sistema deve permitir que os usuários visualizem as tarefas registradas em forma de calendário, onde as tarefas são exibidas nos dias de sua data de vencimento. | 🔴 ALTA |
| RF-08 | Visualização | O sistema deve permitir que os usuários selecionem uma tarefa específica ao clicar em um dia do calendário onde mais de uma tarefa tem seu vencimento, exibindo uma lista agrupada. | 🔴 ALTA |
| RF-09 | IA | O sistema deve permitir a criação de tarefas através de inserção de texto em linguagem natural (ex: "Estudar IA sexta às 14h"), utilizando um Motor de IA em nuvem para extrair a data e título. | 🔴 ALTA |
| RF-10 | IA | O sistema deve disponibilizar uma função de IA em nuvem que sugira e realize a decomposição de tarefas em subtarefas menores e gerenciáveis. | 🔴 ALTA |
| RF-11 | Sistema | O sistema deve garantir a operação base offline, salvando tarefas no banco de dados local e agendando a sincronização com a nuvem/IA quando houver conectividade. | 🔴 ALTA |
| RF-12 | Notificações | O sistema deve disparar alertas automáticos baseados em regras de antecedência para lembrar o usuário de iniciar ou finalizar seus afazeres. | 🔴 ALTA |
| RF-13 | Visualização | O sistema deve exibir um indicador visual do status de conectividade, informando ao usuário quando as funcionalidades avançadas de IA em nuvem estiverem temporariamente indisponíveis. | 🟡 MÉDIA |
| RF-14 | Gerenciamento | O sistema deve permitir que o usuário Crie, edite, remova uma Sub-tarefa vinculada a uma outra tarefa já existente | 🔴 ALTA |
| RF-15 | Gerenciamento | Se a tarefa possui Sub-tarefas, o sistema deve atualizar o estado de conclusão da tarefa a partir do estado de conclusão de todas suas sub-tarefas. | 🔴 ALTA |
| RF-16 | Notificações | O sistema deve permitir que o usuário opte ou não por notificações Diárias, notificações de dias específicos da semana, e notificações de aviso de vencimento | 🔴 ALTA |
| RF-17 | Notificações | O sistema deve permitir que o usuário personalize horários para ser notificado diáriamente ou em certos dias da semana | 🔴 ALTA |
| RF-18 | Notificações | O sistema deve disponibilizar notificações que destaquem as 3 tarefas mais urgentes, se houverem | 🔴 ALTA |
| RF-19 | Notificações | O sistema deve disponibilizar notificações avisem o usuário sobre o vencimento de uma tarefa, de 7, 3 e 2 dias antes do vencimento | 🔴 ALTA |
| RF-20 | Visualização | O sistema deve disponibilizar um visualizador de árvore para tarefas, exibindo todo o contexto da tarefa com suas subtarefas, sendo cada nó selecionável e editável | 🔴 ALTA |
---

# 3.2 Histórias de Usuário

## Histórias do Projeto

### História 1 (relacionada ao RF-01)
Como usuário, eu quero criar uma conta e realizar login no sistema, para que eu possa associar meus dados localmente e sincronizá-los com segurança na nuvem.

### História 2 (relacionada ao RF-02 e RF-03)
Como usuário, eu quero criar, editar, atualizar e excluir tarefas, para que eu possa me programar e manter um registro preciso dos meus afazeres.

### História 3 (relacionada ao RF-04)
Como usuário, eu quero poder marcar rapidamente minhas tarefas como concluídas com um menu de confirmação, para que eu tenha a sensação de progresso e limpe minha lista de pendências.

### História 4 (relacionada ao RF-05 e RF-06)
Como usuário, eu quero visualizar a lista das minhas tarefas ordenadas por vencimento e acessar seus detalhes, para que eu não me esqueça do que precisa ser feito primeiro.

### História 5 (relacionada ao RF-07 e RF-08)
Como usuário, eu quero visualizar minhas tarefas distribuídas em um calendário mensal interativo, para que eu tenha uma visão mais ampla dos meus prazos e do volume de entregas durante o mês.

### História 6 (relacionada ao RF-09)
Como usuário, eu quero registrar uma tarefa digitando apenas uma frase em linguagem natural, para que o processo de anotação seja rápido e evite que eu desista de anotar por preguiça.

### História 7 (relacionada ao RF-10)
Como usuário, eu quero que o sistema utilize IA para dividir um projeto muito grande em partes menores, para que minha sensação de sobrecarga diminua e eu consiga iniciar o trabalho com mais facilidade.

### História 8 (relacionada ao RF-11)
Como usuário, eu quero poder registrar e consultar minha agenda mesmo sem acesso à internet, para que eu não dependa de redes móveis e garanta que o aplicativo seja sempre responsivo.

### História 9 (relacionada ao RF-12)
Como usuário, eu quero receber notificações automáticas sobre minhas tarefas e seus prazos, para que eu não precise checar o aplicativo constantemente para me lembrar do que preciso fazer.

### História 10 (relacionada ao RF-13)
Como usuário, eu quero visualizar um aviso claro na interface quando meu celular estiver sem internet, para que eu entenda o motivo da opção decompor com IA estar desabilitada naquele momento.

### História 11 (relacionada ao RF-14 e RF-15)
Como usuário, eu quero poder criar sub-tarefas dentro de uma tarefa determinada, para que possa dividir as atividades do processo e definir datas de vencimento para cada uma.

## História 12 (relacionada ao RF-16 a RF-19
Como usuário, eu quero receber notificações de lembrete sobre minhas tarefas registradas em horários e dias, para que me atente em um horário que esteja realmente disposto para realiza-las.

## História 13 (relacionada ao RF-20)
Como usuário, eu quero ter uma visão geral sobre uma tarefa, em forma de árvore, para entender melhor o contexto geral de progresso na tarefa e suas subtarefas.

# 3.3 Requisitos Não Funcionais

## Tabela de Requisitos Não Funcionais

| ID     | Descrição do Requisito | Prioridade |
|--------|------------------------|------------|
| RNF-01 | O sistema deve proteger as informações e credenciais dos usuários utilizando criptografia para senhas e comunicação segura via protocolo HTTPS para sincronização. | 🔴 ALTA |
| RNF-02 | As funções de leitura e gravação no banco de dados devem funcionar de forma ininterrupta, garantindo a manipulação de dados localmente sem depender de rede. | 🔴 ALTA |
| RNF-03 | O modelo de Inteligência Artificial processado localmente deve garantir que seu tamanho de armazenamento não ultrapasse 2GB na memória interna do dispositivo. | 🔴 ALTA |
| RNF-04 | O aplicativo deve carregar sua interface inicial e a listagem local de tarefas em um tempo máximo de 2 segundos. | 🟡 MÉDIA |
| RNF-05 | As requisições assíncronas enviadas para a API de IA devem ter um tempo limite máximo de 10 segundos, fornecendo feedback visual ao usuário, para não travar a interface. | 🟡 MÉDIA |
| RNF-06 | A interface do sistema deve seguir as heurísticas de design para dispositivos móveis, como áreas de toque com tamanho mínimo adequado e contraste de cores legível. | 🟡 MÉDIA |
| RNF-07 | O banco de dados local deve ser otimizado para suportar o armazenamento de até 200 tarefas ativas simultaneamente sem degradação de performance do calendário ou das listas. | 🟢 BAIXA |

## Tabela de Restrições

| ID  | Restrição |
|-----|-----------|
| R-01 | O projeto deverá ser entregue de forma funcional e documentada até o final do semestre letivo. |
| R-02 | O aplicativo será desenvolvido para execução e distribuição exclusivamente no sistema operacional Android. |
| R-03 | O desenvolvimento da interface mobile deve ser feito utilizando o React Native. |
| R-04 | O projeto não deverá gerar custos financeiros para a equipe, limitando o uso de serviços em nuvem e Inteligência Artificial aos pacotes gratuitos das APIs utilizadas. |
| R-05 | A persistência primária de dados deve ocorrer obrigatoriamente de forma local, sendo a arquitetura restrita a abordagem offline-first. |
| R-06 | O escopo das funcionalidades de Inteligência Artificial será restrito ao processamento de linguagem natural, não abrangendo processamento de imagem ou áudio. |

---
## 3.5 Regras de Negócio

| ID | Regra de Negócio |
|--------|--------|
| RN-01  | Se o dispositivo estiver sem conexão à internet no momento da criação ou edição de uma tarefa, então os dados devem ser salvos com o status pendente e sincronizados automaticamente quando a rede retornar. |
| RN-02  | Se o usuário marcar uma tarefa principal como "Concluída", então todas as subtarefas vinculadas a ela devem ser marcadas como concluídas automaticamente. |
| RN-03  | Se a data e hora atuais ultrapassarem a data de validade de uma tarefa incompleta, então seu status deve ser alterado para "Atrasada" e ela deve ser fixada com prioridade máxima.  |
| RN-04  | Se uma tarefa já for classificada como uma "Subtarefa", então a opção de decompor com IA deverá ser desabilitada para aquele item específico. |
| RN-05 | Se o dispositivo estiver offline, a opção de decompor com IA deverá ser desabilitada, enquanto a criação de tarefas com inserção de texto natural funcionará localmente. |
| RN-06 | Ao realizar uma troca total de dados ao optar por fazer backup em nuvem, ou ao renunciar do backup em nuvem sem manter os dados, todas as notificações marcadas devem ser canceladas. |
| RN-06  | Se uma tarefa principal possuir subtarefas pendentes, então ela só poderá ser excluída mediante a exibição e aceitação de um alerta adicional de confirmação em duas etapas. |
