
# 4. Projeto da Solução

> ⚠️ **Aviso aos Squads (Software House)**
>
> Esta seção **não deve ser preenchida integralmente antes da codificação**.
> Trata-se de um **Documento Vivo**, que deverá ser atualizado **incrementalmente a cada Sprint**, refletindo fielmente o código real implementado.

---

## 4.1 Arquitetura da Solução (Sprint 1 e 2)

A arquitetura do SmartAgenda foi projetada sob um paradigma Híbrido e Serverless, com o objetivo de oferecer máxima performance e funcionamento offline

### Diagrama de Arquitetura do Projeto
 
 ![Diagrama de arquitetura da solução](./images/Diagrama_Arquitetura_SmartAgenda.png)

## 4.2 Tecnologias Utilizadas

Descreva as tecnologias, linguagens, frameworks, bibliotecas e serviços escolhidos pelo Squad.

| Dimensão | Tecnologia Escolhida |
|----------|----------------------|
| **Banco de Dados (SGBD)** | Firebase Cloud Firestore (NoSQL) |
| **Back-end API** | Firebase, utilizando Firebase Auth para autenticação de usuários. |
| **Front-end / Mobile** | React Native e React. |
| **Inteligência Artificial Local** | Framework React Native AI (@react-native-ai/mlc). |
| **Ambiente e Emulação** | Android Studio (Android SDK) atuando em conjunto com o Metro Bundler. |
| **Gestão e Versionamento** | GitHub. |

 ⚠️ **Observação:**
 - O sistema não requer hospedagem ou deploy de um servidor próprio por conta do Firebase.

---

##  4.3 Wireframes ou Mockups (A partir da Sprint 2)

Apresente os protótipos das telas (Wireframes/Mockups) apenas das funcionalidades que estão sendo implementadas na Sprint atual.

Cada Wireframe ou Mockups devem estar associados a pelo menos:

- Um Requisito Funcional (RF-XX)
- Uma História de Usuário


### Tela de Gerenciamento de Tarefa (RF-01)

**História associada:** Como usuário, eu quero criar, editar, atualizar e excluir tarefas, para que eu possa me programar e manter um registro preciso dos meus afazeres.

<img src="images/mockup_gerenciamento.png" width="30%">

**Descrição:** Página ou Modal que permite a alteração das informações de uma tarefa, a serem salvas no AsyncStorage, depois salvas no dispositivo local, depois salvas como backup no Firebase.

### Tela de Login (RF-01)

**História associada:** Como usuário, eu quero criar uma conta e realizar login no sistema, para que eu possa associar meus dados localmente e sincronizá-los com segurança na nuvem.

<img src="images/Login.jpeg" width="30%">

**Descrição:** Tela de autenticação onde o sistema permite que os usuários realizem cadastro e login informando e-mail e senha. Serve como porta de entrada para a sincronização dos dados locais com o Firebase.

---

### Tela da Lista de Tarefas (RF-05 e RF-06)

**História associada:** Como usuário, eu quero visualizar a lista das minhas tarefas ordenadas por vencimento e acessar seus detalhes, para que eu não me esqueça do que precisa ser feito primeiro.

<img src="images/Lista de Tarefas.jpeg" width="30%">

**Descrição:** Página principal que permite aos usuários visualizarem as tarefas registradas em forma de lista, ordenadas pela data de validade mais próxima. Inclui filtros dinâmicos para alternar entre "Pendentes" e "Concluídas".

---

### Tela de Detalhes da Tarefa (RF-03, RF-04 e RF-06)

**Histórias associadas:** 
- Como usuário, eu quero visualizar a lista das minhas tarefas ordenadas por vencimento e acessar seus detalhes, para que eu não me esqueça do que precisa ser feito primeiro.
- Como usuário, eu quero poder marcar rapidamente minhas tarefas como concluídas com um menu de confirmação, para que eu tenha a sensação de progresso e limpe minha lista de pendências.

<img src="images/Detalhes da Tarefa.jpeg" width="30%">

**Descrição:** Modal que permite aos usuários selecionarem as tarefas exibindo mais detalhes sobre elas. A partir desta tela, o sistema permite que o usuário navegue para a página de edição da tarefa ou marque a tarefa como completa.

---

## 4.4 Modelagem de Dados (Sprint 2 e 3)

O sistema exige persistência de dados.

A documentação do banco seguirá a abordagem de **entrega contínua**, sendo expandida conforme evolução do projeto.

---

### 4.4.1 Script Físico (Entrega na Sprint 2 - MVP)

Para a primeira fatia vertical (MVP), o Squad deverá entregar o **script de criação das tabelas ou coleções utilizadas**.

#### 🔹 Para Banco Relacional (SQL)

Incluir:

- Comandos `CREATE TABLE`
- Definição de chave primária (PK)
- Definição de chaves estrangeiras (FK)

**Exemplo:**

```sql
CREATE TABLE Usuario (
    Id INT PRIMARY KEY,
    Nome VARCHAR(100),
    Email VARCHAR(150) UNIQUE,
    Senha VARCHAR(200)
);
```

---

### Para Banco NoSQL

Incluir a estrutura dos documentos JSON (Schema).

**Exemplo:**

```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "hash_da_senha"
}
```

### 📁 Obrigatório

O arquivo .sql ou .js deve ser salvo na pasta: src/bd

 - É permitido colar um trecho do script no README apenas para visualização rápida.
 
---
### 4.4.2 Representação do Modelo Físico de Dados (Entrega na Sprint 3 - Core)


> **Fundamentação:** Os modelos de dados físicos fornecem detalhes minuciosos que auxiliam administradores e desenvolvedores na implementação da lógica de negócios em um banco de dados real.
> Eles incluem elementos não especificados no modelo lógico, como:
> - Tipos de dados específicos da plataforma
> - Restrições
> - Índices
> - Triggers (quando aplicável)
> - Procedimentos armazenados (quando aplicável)
>
>Por representarem um banco real, devem respeitar:
> - Convenções de nomenclatura
> - Restrições da plataforma
> - Uso adequado de palavras reservadas <br>


**Exemplo:**

<img src="https://d2908q01vomqb2.cloudfront.net/b6692ea5df920cad691c20319a6fffd7a4a766b8/2021/11/09/BDB-1321-image005.png" width="85%">

**FONTE:** <https://aws.amazon.com/pt/compare/the-difference-between-logical-and-physical-data-model/>

<br>O grupo deverá gerar um diagrama físico do banco de dados (estrutura real das tabelas), evidenciando PKs, FKs e relacionamentos, conforme implementado no código.

Este modelo deve exibir:
- Tabelas ou coleções existentes
- Atributos com seus respectivos tipos de dados
- Chaves Primárias (PK)
- Chaves Estrangeiras (FK)
- Relacionamentos entre tabelas
- Restrições implementadas (quando aplicável)

---

### 📌 Requisitos Obrigatórios

- O diagrama deve representar fielmente o banco já implementado.
- Deve refletir exatamente o que foi criado nas Sprints 2 e 3.
- Não incluir tabelas que não existam no código.
- Deve contemplar o controle de acesso de usuários, quando implementado.
- Deve respeitar as convenções e restrições da plataforma utilizada.

---

### 📎 Representação do Modelo Físico de Dados
🚨 O grupo deverá inserir aqui a imagem do diagrama físico de dados.

---
🔧**Ferramentas Sugeridas**
- MySQL Workbench (engenharia reversa automática)
- DbDesigner
- Lucidchart
