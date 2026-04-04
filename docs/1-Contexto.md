# 1. Introdução

O SmartAgenda é um aplicativo que deseja aumentar a produtividade do usuário, com um gerenciamento personalizado de suas tarefas, e grande interatividade através da sua integração com a Inteligência Artificial.

---

## 1.1 Problema   

​As ferramentas de gestão de tempo atuais dependem da disciplina do usuário para a inserção manual de dados e a consulta constante de prazos. Isto contribui para a procrastinação e o atraso de entregas, por conta que o esforço burocrático de registro desanima o usuário a usar a ferramenta para compromissos. Além disso, a falta de uma estrutura que auxilie na organização de grandes volumes de trabalho gera fadiga de decisão, onde o usuário se sente sobrecarregado por tarefas extensas, que poderiam ser decompostas em etapas acionáveis.

---

## 1.2 Objetivos  
**Geral:** O objetivo é desenvolver uma agenda pessoal inteligente que otimize o planejamento da rotina e reduza a procrastinação por meio da automação de registros e da análise contextual de tempo, ou seja, aumentar a produtividade do usuário e incentivá-lo a planejar tarefas de maneira prática e contínua.

**Objetivos Específicos:**
  - Integrar uma API de Inteligência Artificial Generativa para interpretar entradas em linguagem natural e decompor automaticamente projetos complexos em subtarefas menores e acionáveis.
  - Implementar o gerenciamento local de tarefas (offline-first) com e sem datas finais definidas.
  - Desenvolver um sistema proativo de alertas automáticos e notificações locais baseados em regras de antecedência para combater o esquecimento.

---

## 1.3 Justificativa  
As agendas tradicionais costumam focar somente na data limite de execução da tarefa , geralmente com poucos lembretes, onde é fácil de uma tarefa ser esquecida até sua data de expiração estar próxima. Além da inserção de tarefas ser muito manual, os usuários se sentem menos motivados por conta da necessidade de esforço para organização.

Pesquisas publicadas no periódico Psychological Bulletin demonstram que cerca de 20% dos adultos são procrastinadores crônicos. Além disso, levantamentos comportamentais da YouGov apontam que, de modo geral, uma pessoa comum chega a gastar em média 218 minutos por dia adiando tarefas, ou seja, 55 dias inteiros perdidos por ano. No ambiente acadêmico, esse cenário é pior ainda: estatísticas da American Psychological Association indicam que entre 80% e 95% dos estudantes universitários procrastinam de forma consistente, especialmente no que tange às atividades extraclasse. Nacionalmente, estudos conduzidos por pesquisadores brasileiros publicados na revista Estudos de Psicologia confirmam essa tendência, revelando que aproximadamente 82% dos discentes admitem adiar compromissos e tarefas acadêmicas com frequência.

O SmartAgenda busca solucionar isto, com a aplicação o usuário seria lembrado constantemente das tarefas, mesmo longe da data limite, para a produção constante e incremental de tarefas. A integração com IA torna a agenda mais conveniente e motiva os usuários a usarem e se organizarem. Esta agenda seria acessível para pessoas de qualquer idade, é um avanço em relação às agendas tradicionais.

---

## 1.4 Público-Alvo  

O público-alvo inicial concentra-se em estudantes universitários e jovens adultos. 

Como dito na justificativa, este é o nicho demográfico que apresenta os índices mais alarmantes de procrastinação crônica (atingindo até 95%) e que enfrenta o maior desafio na conciliação de demandas acadêmicas, profissionais e pessoais. Esse público possui alta familiaridade com soluções mobile e necessita de uma ferramenta que combata ativamente a sobrecarga cognitiva e a fadiga de decisão na organização de suas rotinas.

---

## 1.5 Lista Macro de Funcionalidades

Para atender aos objetivos e solucionar o problema proposto, o sistema é tem os seguintes módulos principais:

* **Autenticação e Sincronização:** Cadastro e login de usuários, com suporte ao armazenamento de dados seguindo a abordagem offline-first e sincronização em background.
* **Motor de Inteligência Artificial:** Processamento de inputs em linguagem natural para criação de tarefas e também decomposição de tarefas complexas em subtarefas.
* **Gerenciador de Tarefas (CRUD):** Criação, edição, exclusão e conclusão de tarefas e subtarefas, permitindo o uso de tags, descrições e controle de status.
* **Visualização de tarefas:** Interface interativa contendo listagem de prioridades (ordenada por urgência) e calendário mensal para visão panorâmica de prazos.
* **Alertas e Notificações:** Automatização de lembretes locais preventivos para o usuário antes do vencimento das atividades.