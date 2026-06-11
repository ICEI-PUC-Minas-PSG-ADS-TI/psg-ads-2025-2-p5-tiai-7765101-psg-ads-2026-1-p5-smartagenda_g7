import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { Tarefa } from '../types/tarefa';

export async function ExportDashboardPDF(
  tarefas: Tarefa[]
) {

  try {

    const total = tarefas.length;

    const finalizadas =
      tarefas.filter(
        t => t.estado === 'Finalizado'
      ).length;

    const emProgresso =
      tarefas.filter(
        t => t.estado === 'EmProgresso'
      ).length;

    const naoIniciadas =
      tarefas.filter(
        t => t.estado === 'NaoIniciado'
      ).length;

    const atrasadas =
      tarefas.filter(
        t =>
          t.estado !== 'Finalizado' &&
          t.data_vencimento < Date.now()
      ).length;

    const percentual =
      total > 0
        ? Math.round(
            (finalizadas / total) * 100
          )
        : 0;

    const html = `
    <html>

    <head>

    <style>

    body{
      font-family: Arial, sans-serif;
      padding:20px;
      color:#333;
    }

    .header{
      background:#9F7CFA;
      color:white;
      padding:20px;
      border-radius:12px;
      text-align:center;
      margin-bottom:20px;
    }

    .card{
      background:#F7F7F7;
      border-radius:10px;
      padding:15px;
      margin-bottom:20px;
    }

    table{
      width:100%;
      border-collapse:collapse;
      margin-top:10px;
    }

    th{
      background:#9F7CFA;
      color:white;
    }

    th,td{
      border:1px solid #DDD;
      padding:8px;
      text-align:left;
    }

    .progress{
      width:100%;
      height:20px;
      background:#DDD;
      border-radius:10px;
      overflow:hidden;
      margin-top:10px;
    }

    .progress-bar{
      height:20px;
      background:#4CAF50;
    }

    .insight{
      margin-bottom:8px;
      font-size:14px;
    }

    </style>

    </head>

    <body>

    <div class="header">
      <h1>SmartAgenda</h1>
      <h3>Relatório de Produtividade</h3>
    </div>

    <div class="card">

      <h2>Visão Geral</h2>

      <p>
        <strong>Data de geração:</strong>
        ${new Date().toLocaleString()}
      </p>

      <table>

        <tr>
          <th>Indicador</th>
          <th>Valor</th>
        </tr>

        <tr>
          <td>Total de tarefas</td>
          <td>${total}</td>
        </tr>

        <tr>
          <td>Finalizadas</td>
          <td>${finalizadas}</td>
        </tr>

        <tr>
          <td>Em progresso</td>
          <td>${emProgresso}</td>
        </tr>

        <tr>
          <td>Não iniciadas</td>
          <td>${naoIniciadas}</td>
        </tr>

        <tr>
          <td>Atrasadas</td>
          <td>${atrasadas}</td>
        </tr>

        <tr>
          <td>Produtividade</td>
          <td>${percentual}%</td>
        </tr>

      </table>

      <div class="progress">
        <div
          class="progress-bar"
          style="width:${percentual}%"
        ></div>
      </div>

    </div>

    <div class="card">

      <h2>Próximos Vencimentos</h2>

      <table>

        <tr>
          <th>Tarefa</th>
          <th>Vencimento</th>
        </tr>

        ${tarefas
          .filter(
            t => t.estado !== 'Finalizado'
          )
          .sort(
            (a, b) =>
              a.data_vencimento -
              b.data_vencimento
          )
          .slice(0, 5)
          .map(
            t => `
            <tr>
              <td>${t.titulo}</td>
              <td>
                ${new Date(
                  t.data_vencimento
                ).toLocaleDateString()}
              </td>
            </tr>
          `
          )
          .join('')}

      </table>

    </div>

    <div class="card">

      <div style="page-break-before: always;"></div>

      <h1>Detalhamento das Tarefas</h1>

      <table>

        <tr>
          <th>Tarefa</th>
          <th>Status</th>
          <th>Vencimento</th>
          <th>Criação</th>
        </tr>

        ${tarefas
          .map(
            t => `
            <tr>

              <td>${t.titulo}</td>

              <td>${t.estado}</td>

              <td>
                ${new Date(
                  t.data_vencimento
                ).toLocaleDateString()}
              </td>

              <td>
                ${new Date(
                  t.data_criado
                ).toLocaleDateString()}
              </td>

            </tr>
          `
          )
          .join('')}

      </table>

    </div>

    <div class="card">

      <h2>Resumo de Produtividade</h2>

      <p class="insight">
        ✅ Você concluiu ${percentual}% das tarefas cadastradas.
      </p>

      <p class="insight">
        ⚠️ Existem ${naoIniciadas} tarefas não iniciadas.
      </p>

      <p class="insight">
        📅 Existem ${atrasadas} tarefas atrasadas.
      </p>

      <p class="insight">
        🏆 Total de tarefas concluídas: ${finalizadas}.
      </p>

      <p class="insight">
        📋 Total de tarefas registradas: ${total}.
      </p>

    </div>

    </body>

    </html>
    `;

    const pdf = await generatePDF({
      html,
      fileName: 'smartagenda_relatorio',
    });

    if (!pdf?.filePath) {
      throw new Error(
        'PDF criado sem filePath'
      );
    }

    await Share.open({
      url: `file://${pdf.filePath}`,
      type: 'application/pdf',
    });

  } catch (error) {

    console.log(
      'ERRO PDF:',
      error
    );

    throw error;

  }

}