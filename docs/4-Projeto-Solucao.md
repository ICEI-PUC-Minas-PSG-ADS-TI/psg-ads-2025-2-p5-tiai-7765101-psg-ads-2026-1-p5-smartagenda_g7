
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
| **Inteligência Artificial em Nuvem** | Gemini. |
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

### Tela de Cadastro (RF-01)

**História associada:** Como usuário, eu quero criar uma conta no sistema, para que eu possa acessar minhas tarefas de forma personalizada e sincronizá-las na nuvem.

<img width="30%" src="https://github.com/user-attachments/assets/c391d602-5894-43d8-b456-4719043f2a87" />

<img width="30%" src="https://github.com/user-attachments/assets/46bd565d-360b-4453-ab12-7f5063a27817" />

**Descrição:** Tela de cadastro de novos usuários. O usuário informa nome, e-mail e senha. Após o cadastro, o sistema cria automaticamente o usuário no Firebase Authentication e no Firestore, com sua coleção de tarefas.

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

O sistema utiliza Firebase Firestore como banco de dados NoSQL, integrado com Firebase Authentication para gerenciamento de usuários.

---

### 4.4.1 Script Físico (Entrega na Sprint 2 - MVP)

Coleção usuarios:

<img  width="30%" src="https://github.com/user-attachments/assets/38eac7e6-95c6-423d-8930-3c55b55d3e3f" />



Subcoleção tarefas (dentro de cada usuário):

<img  width="30%" src="https://github.com/user-attachments/assets/c8f585d0-3060-4df6-8709-9bf70c801723" />



Estrutura no Firebase:

<img  width="30%" src="https://github.com/user-attachments/assets/b10bd4e3-f514-4242-b7ab-60bc2aa0b81c" />



### 📁 Obrigatório

O arquivo .sql ou .js deve ser salvo na pasta: src/bd

 - É permitido colar um trecho do script no README apenas para visualização rápida.
 
---
### 4.4.2 Representação do Modelo Físico de Dados (Entrega na Sprint 3 - Core)

<img width="1600" height="1449" alt="image" src="https://github.com/user-attachments/assets/f23812ee-d30d-4471-9feb-fac11f12fab1" />


---

### 📎 Representação do Modelo Físico de Dados
🚨 O grupo deverá inserir aqui a imagem do diagrama físico de dados.

---
🔧**Ferramentas Sugeridas**
- MySQL Workbench (engenharia reversa automática)
- DbDesigner
- Lucidchart
