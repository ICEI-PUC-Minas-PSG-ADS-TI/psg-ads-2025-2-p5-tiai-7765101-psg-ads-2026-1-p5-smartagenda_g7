# 2. Planejamento do Projeto

# 2.1 Sprints do Projeto

O projeto será realizado em **4 Sprints**, com entregas contínuas de código e documentação.

---

## 📅 Visão Geral

### 🟢 Sprint 1 – Setup, Hello World e Visão do Produto
- README com descrição do projeto
- ODS escolhida
- Backlog macro
- Repositório criado
- Banco de dados instanciado (vazio)
- Tela "Hello World" conectada à API

---

### 🟡 Sprint 2 – MVP (Primeira Fatia Vertical)
- Requisitos Funcionais documentados
- Script do Banco de Dados
- 1ª funcionalidade completa funcionando
- Dados sendo salvos no banco


---

### 🔵 Sprint 3 – Core e Regras de Negócio
- Implementação das regras de negócio
- Validações no backend
- DER atualizado via Engenharia Reversa
- Diagrama de Classes atualizado

---

### 🔴 Sprint 4 – Finalização e Deploy
- Correção de bugs
- Testes finais ponta a ponta
- Documentação final consolidada
- Relatório preenchido no APC
- Sistema pronto para Arguição

---

# 👥 Papéis de Gestão

Todos programam.  
Os papéis abaixo são apenas para organização do time.

- 👨‍💻 **Tech Lead (Git Master)**  
  Responsável pelo repositório e merges.

- 🗄️ **Arquiteto de Dados (DBA Guard)**  
  Responsável pela modelagem e padronização do banco.

- 🧪 **Gerente de Qualidade (QA & Code Reviewer)**  
  Responsável por revisar código e validar testes.

- 📋 **Facilitador Ágil (PO / Scrum Master)**  
  Responsável por prazos, Kanban e priorização do backlog.

---

##  Definição dos Papéis

- 👨‍💻 Tech Lead: Nitai
- 🗄️ Arquiteto de Dados: Carol
- 🧪 Gerente de Qualidade: Nitai
- 📋 Facilitador Ágil: Isaque

---

# 2.2 Execução e Controle

## 🗂️ Kanban (OBRIGATÓRIO)

### Estrutura obrigatória do Board:

- A Fazer
- Desenvolver
- Fila para Teste
- Teste
- Feito

### Regras

- Cada cartão deve representar uma Fatia Vertical.
- Todo cartão deve conter:
  - Responsável
  - Descrição
  - Prazo
- A avaliação individual considerará:
  - Histórico de commits
  - Movimentação no Kanban

⚠️ Se não está no Git, não foi feito.

---

# 📋 Acompanhamento das Sprints

## Legenda de Status

- [x] ✔️ Concluído
- [ ] 📝 Em andamento
- [ ] ⌛ Atrasado
- [ ] ❌ Não iniciado

---

# 🟢 Sprint 1 – Setup

| Responsável | Papel | Tarefa | Início | Prazo | Status |
|-------------|--------|--------|--------|--------|--------|
|   Nitai     |  Tech Lead  | Preencher Readme | 05/03 | 12/03 | ✔️ |
|  Nitai, Isaque, Carol |  Conjunto | Preencher arquivo 1-Contexto | 05/03 | 12/03 | ✔️ |
|  Nitai, Isaque, Carol | Conjunto | Divisao de papeis | 05/03 | 12/03 | ✔️ |
|   Carol          | Arquiteto de Dados       | Configurar Firebase | 09/03 | 12/03 | ✔️ |
|  Nitai      |   Tech Lead     | Configurar Base React-Native | 02/03 | 12/03 | ✔️ |
|  Isaque     | Facilitador Ágil       | Implementar Página Log-in | 07/03 | 12/03 | ✔️ |
|  Isaque, Carol     |  Conjunto      | Conectar Log-in com a API firebase | 12/03 | 12/03 | ✔️ |
|  Isaque     |  Facilitador Ágil  | Exportação do APK | 12/03 | 12/03 | ✔️ |

---

# 🟡 Sprint 2 – MVP

| Responsável | Papel | Tarefa | Início | Prazo | Status |
|-------------|--------|--------|--------|--------|--------|
| Isaque | Facilitador Agil | Correção de Contexto.md e Lista Macro de Funcionalidades | 03/04 | 06/04 | ✔️ |
| Isaque | Facilitador Agil | Tecnologias Utilizadas e Diagrama de Arquitetura | 03/04 | 06/04 | ✔️ |
| Isaque | Facilitador Agil | Requisitos Não Funcionais, Restrições e Regras de Negócio | 03/04 | 06/04 |  ✔️ |
| Nitai, Isaque | Conjunto | Requisitos Funcionais | 19/03 | 06/04 | ✔️ |
| Nitai, Isaque, Carol | Conjunto | Histórias de Usuário | 19/03 | 06/04 |  ✔️ |
| Carol | Arquiteto de Dados | Documentação das Tabelas do Banco de Dados | 05/04 | 06/04 | ✔️ |
| Carol | Arquiteto de Dados | WireFrame/Mockup da Página de Cadastro | 05/04 | 06/04 | ✔️ |
| Carol, Isaque | Conjunto | Desenvolvimento da Página de Cadastro | 05/04 | 06/04 | ✔️ |
| Carol, Isaque | Conjunto | Integração dos dados ao Firebase | 05/04 | 06/04 | ✔️ |
| Isaque | Facilitador Agil | Implementação do salvamento híbrido no Firebase (Offline-first) | 05/04 | 06/04 | ✔️ |
| Isaque | Facilitador Agil | WireFrame/Mockup da Página de Lista de Tarefas | 05/04 | 06/04 | ✔️ |
| Isaque | Facilitador Agil | Desenvolvimento da Página de Lista de Tarefas | 05/04 | 06/04 | ✔️ |
| Isaque | Facilitador Agil | WireFrame/Mockup da Página de Detalhes de Tarefa | 05/03 | 06/04 | ✔️ |
| Isaque | Facilitador Ágil | Desenvolvimento da Página de Detalhes de Tarefa | 05/04 | 06/04 | ✔️ |
|  Nitai | Tech Lead | WireFrame/Mockup da Página de Gerenciamento de Tarefa | 23/03 | 06/04 | ✔️ |
|  Nitai | Tech Lead | Desenvolvimento da Página de Gerenciamento de Tarefa | 20/03 | 06/04 | ✔️ |
| Isaque | Facilitador Ágil | Exportação do APK | 06/04 | 06/04 | ✔️ |

---

# 🔵 Sprint 3 – Core

| Responsável | Papel | Tarefa | Início | Prazo | Status |
|-------------|--------|--------|--------|--------|--------|
|  Nitai           |  Tech Lead      | Implementação de Subtarefas no Gerenciamento de Tarefas | 13/04 | 07/05 | ✔️ |
|  Nitai           |  Tech Lead      | Implementação de Funções para Importação de tarefas por JSON (para o uso de IA) | 20/04 | 07/05 | ✔️ |
|  Nitai           |  Tech Lead      | Implementação Inicial da página de configurações | 02/04 | 07/05 | ✔️ |
|  Nitai           |  Tech Lead      | Implementação Inicial da Visualização em Árvore | 30/04 | 07/05 | ✔️ |
| Isaque | Facilitador Agil | Implementação de footer com navegação | 29/04 | 10/05 | ✔️ |
| Isaque | Facilitador Agil | Implementação da página de calendário com agenda | 29/04 | 10/05 | ✔️ |
| Isaque | Facilitador Agil | Componentização e melhoria de filtros e lista de tarefas | 29/04 | 10/05 | ✔️ |
| Isaque | Facilitador Agil | Implementação da página de Chat IA e IA integrada (Gemini) | 29/04 | 10/05 | ✔️ |
| Isaque | Facilitador Agil | Criação e integração da IA com CRUD de tarefas do aplicativo | 29/04 | 10/05 | ✔️ |
| Isaque | Facilitador Agil | Tornando login/cadastro opcional, salvamento local como base  | 29/04 | 10/05 | ✔️ |
| Isaque | Facilitador Agil | Atualização de instruções de uso e tecnologias utilizadas  | 10/05 | 10/05 | ✔️ |
| Isaque | Facilitador Agil | Criação de APK e envio da Sprint  | 10/05 | 10/05 | ✔️ |
|  Carol           |  Arquiteto de Dados     | Atualizar Diagrama de Classes | 16/04 | 10/05 | ✔️ |
|  Carol           |  Arquiteto de Dados     | integração IA com o firebase | 06/05 | 10/05 | ✔️ |
|  Carol           |  Arquiteto de Dados     | criação da tela de historico de integração da IA | 10/05 | 10/05 | ✔️ |

---

# 🔴 Sprint 4 – Finalização

| Responsável | Papel | Tarefa | Início | Prazo | Status |
|-------------|--------|--------|--------|--------|--------|
| Nitai | Tech Lead       | Sistema de Notificações | 08/06 | 11/06 | ✔️ |
| Nitai | Tech Lead       | Ícone do App | 11/06 | 11/06 | ✔️ |
| Isaque | Facilitador Agil | Repasse de Integração visual | 09/06 | 11/06 | ✔️ |
| Isaque | Facilitador Agil | Funcionalidade de gerenciamento de conversas de IA | 09/06 | 11/06 | ✔️ |
| Isaque | Facilitador Agil | Funcionalidade de pesquisa em conversas de IA | 09/06 | 11/06 | ✔️ |
| Isaque | Facilitador Agil | Criação do APK | 09/06 | 11/06 | ✔️ |
| Isaque | Facilitador Agil | Vídeo demonstrativo | 09/06 | 11/06 | ✔️ |
| Isaque | Facilitador Agil | Atualização de design das telas de Criar tarefa/Editar tarefa | 09/06 | 11/06 | ✔️ |
| Carol  | Arquiteto de Dados   | Dashboards das tarefas | 11/06 | 11/06 | ✔️ |

---
