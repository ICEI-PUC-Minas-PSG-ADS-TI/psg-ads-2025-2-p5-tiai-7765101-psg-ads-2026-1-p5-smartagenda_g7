# 2. Planejamento do Projeto

Esta seção apresenta como o grupo organizará o trabalho ao longo do semestre.  
O projeto adota uma metodologia ágil, simulando o ambiente de uma Software House.

---

### 🚨 Regra de Ouro: 

> ❗Não existe divisão entre “quem faz documento”, “quem faz Front-end” e “quem faz Back-end”.

<br>Todos os integrantes são **Desenvolvedores Full-Stack** e devem implementar **Fatias Verticais (Vertical Slices)**.

✔️ Cada membro deve entregar a funcionalidade completa:  
**Banco de Dados → API → Tela**

---

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

⚠️ Se não salvar no banco, não pontua.

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

##  Definição dos Papéis – Sprint 1

- 👨‍💻 Tech Lead: Nitai
- 🗄️ Arquiteto de Dados: Carol
- 🧪 Gerente de Qualidade: Nitai
- 📋 Facilitador Ágil: Isaque

> Caso os papéis mudem nas próximas Sprints, atualizar neste documento.

---

# 2.2 Execução e Controle

## 🗂️ Kanban (OBRIGATÓRIO)

O projeto pode utilizar a aba **Projects** do GitHub, porém é **OBRIGATÓRIO preencher os quadros Kanban de cada Sprint** (apresentados abaixo).

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
|   Carol          | Arquiteto de Dados       | Configurar Firebase | 09/03 | 12/03 | 📝 |
|  Nitai      |   Tech Lead     | Configurar Base React-Native | 02/03 | 12/03 | ✔️ |
|  Isaque     | Facilitador Ágil       | Implementar Página Log-in | 07/03 | 12/03 | ✔️ |
|  Isaque, Carol     |  Conjunto      | Conectar Log-in com a API firebase | 12/03 | 12/03 | 📝 |
|  Isaque     |   Facilitador Ágil     | Implementar a Home Page | 07/03 | 12/03 | ✔️  |

---

# 🟡 Sprint 2 – MVP

| Responsável | Papel | Tarefa | Início | Prazo | Status |
|-------------|--------|--------|--------|--------|--------|
|             |        | Gerar Script do Banco de Dados | 21/03 | 24/03 | ❌ |
|             |        | Desenvolver Fatia 1 (BD + API + Tela) | 22/03 | 30/03 | ❌ |
|             |        | Documentar Requisitos do MVP | 25/03 | 02/04 | ❌ |
|             |        | Revisão técnica e Merge | 02/04 | 05/04 | ❌ |

---

# 🔵 Sprint 3 – Core

| Responsável | Papel | Tarefa | Início | Prazo | Status |
|-------------|--------|--------|--------|--------|--------|
|             |        | Implementar Regra de Negócio Y | 06/04 | 15/04 | ❌ |
|             |        | Implementar Cálculo/Processo Z | 06/04 | 15/04 | ❌ |
|             |        | Atualizar DER via Engenharia Reversa | 16/04 | 20/04 | ❌ |
|             |        | Atualizar Diagrama de Classes | 16/04 | 23/04 | ❌ |

---

# 🔴 Sprint 4 – Finalização

| Responsável | Papel | Tarefa | Início | Prazo | Status |
|-------------|--------|--------|--------|--------|--------|
|             |        | Correção de bugs | 22/05 | 05/06 | ❌ |
|             |        | Finalizar relatórios e dashboards | 01/06 | 15/06 | ❌ |
|             |        | Preencher Relatório APC | 10/06 | 20/06 | ❌ |
|             |        | Testes finais e consolidar README | 15/06 | 25/06 | ❌ |

---
