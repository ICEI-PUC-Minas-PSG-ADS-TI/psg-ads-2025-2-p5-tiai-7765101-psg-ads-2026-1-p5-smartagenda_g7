
# 6. Conclusão

## 6.1 Síntese dos Resultados

O software pode sim auxiliar a aumentar a produtividade/evitar a procrastinação de quem utiliza (o objetivo principal relacionado a ODS 8.2), especialmente para tarefas mais complexas, que possuem várias subtarefas. Mas a automação ainda pode ser melhorada. <br><br>
Pôde ser utilizado para tarefas simples, sem subtarefas, como um lembrete comum, tanto quanto para tarefas complexas, com subtarefas que subdividem a tarefa pai, que disponibilizam um melhor senso de progresso e sequência das etapas, além de ser possível ver um relatório de sua produtividade até então, com lembretes customizáveis para atender os horários que o usuário estaria realmente disposto a realizar uma tarefa.

---
## 6.2 Limitações e Trabalhos Futuros
A ideia inicial de utilizar IA híbrida entre IA em nuvem e IA local teve que ser descartada, as LLMs para funcionamento local em um dispositivo móvel demandam muito tempo para conseguir uma resposta, e de qualidade significativamente pior do que a em nuvem. Entretanto, nessa tentativa de suporte, é mais simples trocar a IA utilizada do Gemini para outras. <br><br>
A IA não tem funções para absolutamente todas as partes do aplicativo, mais significativamente as notificações (Tanto gerenciar as notificações do software, quanto ter as mensagens geradas também por IA), e também tem certa dificuldade em fazer chamadas em sequência (um caso comum que foi visto falhas foi de pedir para subdividir uma tarefa com base na descrição dela, muitas vezes falhava).<br><br>
O suporte de um sistema de voz para texto seria benéfico para o uso dos chats de IA, pois sem ele, ainda é necessário escrever muitas das coisas que já seriam escritas manualmente.<br><br>
É possível também permitir o usuário personalizar se quer receber ou não uma notificação de uma tarefa específica, seja marcada ou diária. Também interessante permitir personalizar a quantidade de dias antes do vencimento que as notificações marcadas devem acionar.<br><br>
Seria interessante permitir fazer a ordenação manual das subtarefas quando são exibidas em lista, algo pequeno, mas que, quando são subtarefas a serem feitas em uma certa sequência definida, deixaria menos confuso o progresso da tarefa. <br><br>
Por mais que fuja levemente do escopo de uso individual, também seria interessante poder compartilhar tarefas para uso de outros usuários, por exemplo, se for uma tarefa representando um projeto em andamento, onde a equipe poderia utiliza-lo no seu ciclo de desenvolvimento.<br><br>

---
## 6.3 Lições Aprendidas
Com a implementação do SCRUM nesse projeto, os desenvolvedores se sentiram mais livres e autônomos, pensando em algumas funcionalidades no próprio tempo de desenvolvimento (o que veio em parte pelo 'cliente' do software ser um dos desenvolvedores), e a divisão em fatias resultou em pouca dependência entre os membros da equipe, logo cada pôde trabalhar em seu próprio tempo sem precisar esperar o trabalho do outro. <br><br>
Entretanto, foi visto um caso de retrabalho por falta de comunicação entre os membros, e também um grande gasto de tempo tentando implementar uma funcionalidade que não gera valor (IA Local), que poderia ser evitado ao testar suas capacidades com mais detalhe previamente. <br><br>
Com relação às técnicas aprendidas, a base do software foi feita em ferramentas já conhecidas (React native, firebase, vs code) (exceto que o React native foi desenvolvido em CLI ao invés de com Expo). Demais conhecimento ficou dividido entre cada membro da equipe, relativo a suas respectivas fatias que desenvolveram: bibliotecas do react native de armazenamento de dados locais e em cache, bibliotecas do react native de desenho em SVG (para a visualização em árvore), IA generativa local, IA generativa em nuvem, Geração de documentos (pdf).

---
