# SmartAgenda

`Tecnologia em Análise e Desenvolv. Sistemas`

`Trabalho Interdiciplinar: Aplicações Inovadoras`

`5° SEMESTRE`

O Projeto SmartAgenda é um aplicativo mobile desenvolvido para organização de calendário, tarefas com datas determinadas, e designando um agente de IA para escolher a carga de trabalho diária para completar as tarefas no prazo esperado.

ODS Alinhados: 8.2

## Integrantes

* Isaque Caetano Nascimento (isaque.nascimento.dev@gmail.com)
* Nitai Nandi Rodrigues da Silva (nitainandi1@gmail.com)
* Maria Caroline Alves Silva (mariaalvescaroline@gmail.com)

## Orientador

* Juliana Padilha

## Instruções de utilização

### Instalação Rápida

Se você deseja apenas instalar e testar o aplicativo no seu celular Android sem configurar o ambiente de desenvolvimento, siga estas instruções:

1. **Onde encontrar o APK:**

   Colocamos o APK do app em [src/apk/SmartAgenda.zip](/src/apk/SmartAgenda.zip)
   
   Após a descompressão, você pode baixar este arquivo diretamente para o seu celular.

2. **Como instalar no dispositivo:**
   * Transfira ou baixe o arquivo `SmartAgenda.apk` para o seu dispositivo Android.
   * Abra o gerenciador de arquivos do celular, encontre o APK e toque no arquivo para iniciar a instalação.

3. **Avisos de Segurança (Play Protect):**
   * Como este é um projeto acadêmico e não foi publicado na Google Play Store, o Android exibirá um aviso de segurança do Play Protect.
   * Para prosseguir, toque em **"Mais detalhes"** e depois selecione **"Instalar assim mesmo"**, caso seja uma verificação de segurança, não há problema em verificar.
   * Caso o sistema peça permissão para "Instalar apps desconhecidos" ou "Fontes desconhecidas", conceda a permissão para o seu navegador ou gerenciador de arquivos concluir a instalação.

### Instalação para Desenvolvimento

Leia as seguintes instruções: [Guia de Configuração e Instalação para Desenvolvimento](src/app/README.md#guia-de-configuração-e-instalação-para-desenvolvimento)

# Documentação

<ol>
<li><a href="docs/1-Contexto.md"> Documentação de Contexto</a></li>
<li><a href="docs/2-Planejamento-Projeto.md"> Planejamento do Projeto</a></li>
<li><a href="docs/3-Especificação.md"> Especificação do Projeto</a></li>
<li><a href="docs/4-Projeto-Solucao.md"> Projeto da solução</a></li>
<li><a href="docs/5-Interface-Sistema.md"> Interface do Sistema</a></li>
<li><a href="docs/6-Conclusão.md"> Conclusão</a></li>
<li><a href="docs/7-Referências.md"> Referências</a></li>
</ol>

# Código

<li><a href="src/README.md"> Código Fonte</a></li>

# Apresentação

<li><a href="presentation/README.md"> Apresentação da solução</a></li>


## Histórico de versões

* 0.4 (Sprint 4)
    * 0.4.1 Integração com serviço de tema (ThemeProvider)
    * 0.4.2 Desenvolvimento visual do Visualizador em Árvore, e interação de modal com os nós
    * 0.4.3 Suporte de IA Local para o chat de IA, integrado à Página de Configurações, e ajustes ao Gerenciador de Tarefas
    * 0.4.4 Removido opção de IA Local (Considerada inviável após testes)
    * 0.4.5 Configuração inicial de Notificações
    * 0.4.6 Correção de Notificações serem Silenciosas
    * 0.4.7 Notificações agora se corrigem ao atualizar as tarefas, e outros concertos de backend
    * 0.4.8 Menu lateral para conversas individuais do Chat de IA
    * 0.4.9 Ajustes de integração da IA com o firebase, refinando menu lateral de conversas e removendo Página de Histório de IA (se torna obsoleto com o menu)
    * 0.4.10 Funcionalidade de busca em conversas
    * 0.4.11 Adequação visual das páginas e ajustes de formatação
    * 0.4.12 Suporte a horários customizados de notificações, concertos de cancelamento de notificações
    * 0.4.13 Botão para visualizar em árvore em Detalhes da Tarefa
    * 0.4.14 Adicionado Ícone do app e em notificações

* 0.3 (Sprint 3)
    * 0.3.1 Integração inicial de sub-tarefas (Novos campos no tipo Tarefa, componentes SubtaskMinimal e SubTaskList
    * 0.3.2 Serviço para carregamento e salvamento híbrido (SaveControlService), com suporte de escolha sobre qual base de dados utilizar em situações de conflito
    * 0.3.3 Suporte a importação de tarefas por strings JSON, para a integração com a IA
    * 0.3.4 Atualização da documentação em relação à subtarefas
    * 0.3.5 Footer de navegação e esqueleto da Página de Configuração e Página de Calendário
    * 0.3.6 Página de calendário simples
    * 0.3.7 Componentização da Lista de Tarefas para uso em outros componentes além da Página de Listagem de Tarefas
    * 0.3.8 Funcionalidade de filtros de tarefas em listas e no calendário
    * 0.3.9 Otimização do Calendário
    * 0.3.10 Implementação básica do chat IA
    * 0.3.11 Integração com GEMINI 2.5 Flash-lite com chamadas de função
    * 0.3.12 Página de Visualizador em Árvore básica
    * 0.3.13 Funcionalidades de CRUD de tarefas utilizando a IA em nuvem
    * 0.3.14 Concertos das funções de IA, e verificação de conexão para seu uso
    * 0.3.15 Desenvolvimento da página de configurações, agora é opcional estar autenticado e realizar backup em nuvem
    * 0.3.16 Refinado resolução de conflitos de dados ao fazer log-in
    * 0.3.17 Modelo físico dos dados
    * 0.3.18 Concertos de carregamento e alteração do tipo Tarefa (agora guarda o ID do pai)
    * 0.3.19 Concertos de consistência de estado e Funcionalidade de exclusão de tarefas
    * 0.3.20 Histórico de interações com a IA
    * 0.3.21 Adição das telas na documentação
    * 0.3.22 Concerto de bugs
   
* 0.2 (Sprint 2)
    * 0.2.1 - Definição de casos de uso, e fatias de tarefas a serem realizadas na sprint
    * 0.2.2 - Preenchimento inicial do Quadro de Sprint, Requisitos funcionais e Histórias de usuário
    * 0.2.3 - Definição do tipo 'Tarefa' e esqueleto de páginas e componentes
    * 0.2.4 - Versão inicial de Lista de tarefas, Gerenciador de Tarefas, e componente de Tarefa Mínima
    * 0.2.5 - Backend para salvamento local dos dados
    * 0.2.6 - Definição dos requisitos funcionais 04-07
    * 0.2.7 - Funcionalidade de finalizar e re-abrir uma tarefa no Gerenciador de Tarefas
    * 0.2.8 - Mockup de Gerenciador de Tarefas
    * 0.2.9 - Adesão visual ao mockup do Gerenciador de Tarefas
    * 0.2.10 - Tratamento de erros de preenchimento no Gerenciador de Tarefas, e adição de um novo campo 'categorias'
    * 0.2.11 - Requisitos funcionais 08-12, Histórias de Usuário 2-9, Requisitos não funcionais 1-6, Restrições 1-6, Regras de Negócio 1-5
    * 0.2.12 - Correções baseadas em feedback na documentação, adicionado tecnologias utilizadas e lista macro de funcionalidades
    * 0.2.13 - Diagrama de arquitetura da solução
    * 0.2.14 - Desenvolvimento da página de Lista de Tarefas
    * 0.2.15 - Integração do firebase para salvamento de Tarefas em nuvem
    * 0.2.16 - Modal de detalhes de tarefa
    * 0.2.17 - Suporte para troca de usuário
    * 0.2.18 - Wireframes da tela de cadastro
    * 0.2.19 - Refinamento da Página de cadastro e log-in
   
* 0.1 (Sprint 1)
    * 0.1.1 - Preenchimento Inicial do Readme, contexto e divisão de papeis
    * 0.1.2 - Adicionado Prova de conceito de IA Local, com instruções para o desenvolvimento
    * 0.1.3 - Adicionado Página de Log-in
    * 0.1.4 - Aprofundamento do Contexto
    * 0.1.5 - Configuração do Firebase
    * 0.1.6 - Integração do Firebase com a Página de log-in
    * 0.1.7 - Ajustes na documentação

