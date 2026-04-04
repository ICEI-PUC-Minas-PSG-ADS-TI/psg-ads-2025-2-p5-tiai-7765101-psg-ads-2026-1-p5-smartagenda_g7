
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
| RF-09 | IA | O sistema deve permitir a criação de tarefas através de inserção de texto em linguagem natural (ex: "Estudar IA sexta às 14h"), interpretando a data e título automaticamente. | 🔴 ALTA |
| RF-10 | IA | O sistema deve disponibilizar uma função de IA que sugira e realize a decomposição de tarefas em subtarefas menores e gerenciáveis. | 🔴 ALTA |
| RF-11 | Sistema | O sistema deve garantir a operação base offline, salvando tarefas no banco de dados local e agendando a sincronização com a nuvem/IA quando houver conectividade. | 🔴 ALTA |
| RF-12 | Sistema | O sistema deve disparar alertas automáticos baseados em regras de antecedência para lembrar o usuário de iniciar ou finalizar seus afazeres. | 🔴 ALTA |

---

# 3.2 Histórias de Usuário

## Histórias do Projeto

### História 1 (relacionada ao RF-01)
Como usuário, eu quero criar uma conta e realizar login no sistema, para que eu possa associar meus dados localmente e sincronizá-los com segurança na nuvem

### História 2 (relacionada ao RF-02 e RF-03)
Como usuário, eu quero criar, editar, atualizar e excluir tarefas, para que eu possa me programar e manter um registro preciso dos meus afazeres

### História 3 (relacionada ao RF-04)
Como usuário, eu quero poder marcar rapidamente minhas tarefas como concluídas com um menu de confirmação, para que eu tenha a sensação de progresso e limpe minha lista de pendências

### História 4 (relacionada ao RF-05 e RF-06)
Como usuário, eu quero visualizar a lista das minhas tarefas ordenadas por vencimento e acessar seus detalhes, para que eu não me esqueça do que precisa ser feito primeiro

### História 5 (relacionada ao RF-07 e RF-08)
Como usuário, eu quero visualizar minhas tarefas distribuídas em um calendário mensal interativo, para que eu tenha uma visão mais ampla dos meus prazos e do volume de entregas durante o mês

### História 6 (relacionada ao RF-09)
Como usuário, eu quero registrar uma tarefa digitando apenas uma frase em linguagem natural, para que o processo de anotação seja rápido e evite que eu desista de anotar por preguiça

### História 7 (relacionada ao RF-10)
Como usuário, eu quero que o sistema utilize IA para dividir um projeto muito grande em partes menores, para que minha sensação de sobrecarga diminua e eu consiga iniciar o trabalho com mais facilidade

### História 8 (relacionada ao RF-11)
Como usuário, eu quero poder registrar e consultar minha agenda mesmo sem acesso à internet, para que eu não dependa de redes móveis e garanta que o aplicativo seja sempre responsivo

### História 9 (relacionada ao RF-12)
Como usuário, eu quero receber notificações automáticas sobre minhas tarefas e seus prazos, para que eu não precise checar o aplicativo constantemente para me lembrar do que preciso fazer

# 3.3 Requisitos Não Funcionais

## Tabela de Requisitos Não Funcionais

| ID     | Descrição do Requisito | Prioridade |
|--------|------------------------|------------|
| RNF-01 | O sistema deve proteger as informações e credenciais dos usuários utilizando criptografia para senhas e comunicação segura via protocolo HTTPS para sincronização. | 🔴 ALTA |
| RNF-02 | As funções de leitura e gravação no banco de dados devem funcionar de forma ininterrupta, garantindo a manipulação de dados localmente sem depender de rede. | 🔴 ALTA |
| RNF-03 | O aplicativo deve carregar sua interface inicial e a listagem local de tarefas em um tempo máximo de 2 segundos. | 🟡 MÉDIA |
| RNF-04 | As requisições assíncronas enviadas para a API de IA devem ter um tempo limite máximo de 10 segundos, fornecendo feedback visual ao usuário, para não travar a interface. | 🟡 MÉDIA |
| RNF-05 | A interface do sistema deve seguir as heurísticas de design para dispositivos móveis, como áreas de toque com tamanho mínimo adequado e contraste de cores legível. | 🟡 MÉDIA |
| RNF-06 | O banco de dados local deve ser otimizado para suportar o armazenamento de até 200 tarefas ativas simultaneamente sem degradação de performance na renderização do calendário ou das listas. | 🟢 BAIXA |

## Tabela de Restrições

| ID  | Restrição |
|-----|-----------|
| R-01 | O projeto deverá ser entregue até o final do semestre. |
| R-02 | O sistema deve funcionar apenas dentro da rede interna da empresa. |
| R-03 | O software deve ser compatível com Windows e Linux. |
| R-04 | (Descreva aqui a restrição 4 do seu projeto) |
| R-05 | (Descreva aqui a restrição 5 do seu projeto) |
| R-06 | (Descreva aqui a restrição 6 do seu projeto) |
| R-07 | (Descreva aqui a restrição 7 do seu projeto) |
| R-08 | (Descreva aqui a restrição 8 do seu projeto) |

---
## 3.5 Regras de Negócio

> Regras de Negócio definem as condições e políticas que o sistema deve seguir para garantir o correto funcionamento alinhado ao negócio.  
>  
> Elas indicam **quando** e **como** certas ações devem ocorrer, usando o padrão:  
>  
> **Se (condição) for verdadeira, então (ação) deve ser tomada.**  
>  
> Exemplo:  
> - "Um usuário só poderá finalizar um cadastro se todos os dados forem inseridos e validados com sucesso."  
>  
> Também pode ser escrito assim (if/then):  
> - "Se o usuário tem saldo acima de X, então a opção de empréstimo estará liberada."

---

 A tabela abaixo deve ser preenchida com as regras de negócio que **impactam seu projeto**. Os textos no quadro são apenas ilustrativos.

|ID    | Regra de Negócio                                                       |
|-------|-----------------------------------------------------------------------|
|RN-01 | Usuário só pode cadastrar até 10 tarefas por dia.                      |
|RN-02 | Apenas administradores podem alterar permissões de usuários.           |
|RN-03 | Tarefas vencidas devem ser destacadas em vermelho no sistema.          |
|RN-04 | *(Descreva aqui a restrição 4 do seu projeto)*                         |
|RN-05 | *(Descreva aqui a restrição 5 do seu projeto)*                         |

💡 **Dica:** Explique sempre o motivo ou impacto da regra no sistema.

---
> **Links Úteis**:
> - [O que são Requisitos Funcionais e Requisitos Não Funcionais?](https://codificar.com.br/requisitos-funcionais-nao-funcionais/)
> - [O que são requisitos funcionais e requisitos não funcionais?](https://analisederequisitos.com.br/requisitos-funcionais-e-requisitos-nao-funcionais-o-que-sao/)
