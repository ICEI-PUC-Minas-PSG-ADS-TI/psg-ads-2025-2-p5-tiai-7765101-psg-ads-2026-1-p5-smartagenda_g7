import { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Rect, Text, G } from 'react-native-svg';

import { Tarefa } from '../types/tarefa';
import { GetAllSubtarefas } from '../services/TarefaService';
import { CarregarTarefas } from '../services/LocalStorageService';

// Tipos que representam os nós e arestas
type PositionedNode = {
  id: string;
  title: string;
  x: number;
  y: number;
};

type Edge = {
  parentId: string;
  childId: string;
};

type Props = {
  tarefa: Tarefa;
};

// Constantes do canvas, somente para o esqueleto, depois serão substituidas por um componente
const NODE_W = 110;
const NODE_H = 40;
const H_GAP = 30;
const V_GAP = 70;

// Criação gráfica da árvore
// um cursor decide em qual lado colocar o nó filho
// nós pais se centralizam entre seus filhos
function buildGraph(rootId: string, taskMap: Map<string, Tarefa>, viewportWidth: number) {
  const nodes: PositionedNode[] = [];
  const edges: Edge[] = [];

  // Diz a posição do próximo nó filho
  let leafCursor = 0;

  // função que retorna a posição central de um nó, recyrsivamente
  function walk(taskId: string, depth = 0): number {
    const t = taskMap.get(taskId);
    if (!t) { console.log("didn't find task with id ", taskId, " when building tree"); return 0; }

    const y = depth * (NODE_H + V_GAP);
    //console.log("depth: ", depth, "y: ", y);
    const children = t.subtarefas ?? [];

    // folha
    if (children.length === 0) {
      const x = leafCursor * (NODE_W + H_GAP);
      leafCursor += 1;

      nodes.push({ id: t.id, title: t.titulo, x, y });

      return x + NODE_W / 2;
    }

    // galho
    const childCenters = children.map((child) => {
      edges.push({ parentId: t.id, childId: child });
      return walk(child, depth + 1);
    });

    // centralizar o pai
    const centerX =
      childCenters.reduce((sum, value) => sum + value, 0) / childCenters.length;

    nodes.push({
      id: t.id,
      title: t.titulo,
      x: centerX - NODE_W / 2,
      y,
    });

    return centerX;
  }

  walk(rootId);

  // Calcular as margens da árvore
  const minX = Math.min(...nodes.map((n) => n.x));
  const maxX = Math.max(...nodes.map((n) => n.x + NODE_W));
  const treeWidth = maxX - minX;

  // Centralização da árvore
  const shift = Math.max(0, (viewportWidth - treeWidth) / 2 - minX);

  return {
    nodes: nodes.map((n) => ({ ...n, x: n.x + shift })),
    edges,
  };
}

export default function TaskTreeView({ tarefa }: Props) {
  const { width, height } = Dimensions.get('window');

  const [task] = useState(tarefa);
  const [root, setRoot] = useState<Tarefa>(tarefa);
  const [subtasks, setSubtasks] = useState({});
  const [taskmap, setTaskmap] = useState<Map<string, Tarefa>>();

  // Carregamento Inicial
  useEffect(() => {
    const initialize = async () => {
      let tarefas = await CarregarTarefas();
      if (tarefas) {
        let root = GetRootTask(tarefa, tarefas);
        setRoot(root);
        console.log("root task for treeview: ", root.titulo);
        const res = await GetAllSubtarefas(root);
        let array: Tarefa[] = [];
        array.push(root);
        if (res) {
          setSubtasks(res);
          array = array.concat(res);
        }
        console.log("taskMap OG array: ", array.length);
        let mapped = ToTaskMap(array);
        console.log(mapped.size);
        setTaskmap(mapped);
      }
    };

    initialize();
  }, [tarefa]);

  function GetRootTask(tarefa: Tarefa, tarefas: Record<string, Tarefa>): Tarefa {
    if (tarefa.parentId) {
      let parent = tarefas[tarefa.parentId];
      if (parent) return GetRootTask(parent, tarefas);
      else return tarefa;
    }
    else return tarefa;
  }

  function ToTaskMap(tarefa: Tarefa[]): Map<string, Tarefa> {
    return new Map(tarefa.map(t => [t.id, t]));
  }

  // Arvore mock somente para Teste
  /*const mocktree: TaskNode = {
    id: 1,
    title: 'Main Task',
    subTasks: [
      {
        id: 2,
        title: 'Sub A',
        subTasks: [
          { id: 3, title: 'Sub A1', subTasks: [] },
          { id: 4, title: 'Sub A2', subTasks: [] },
        ],
      },
      {
        id: 5,
        title: 'Sub B',
        subTasks: [],
      },
    ],
  };

  // USADO SOMENTE PARA TESTE, SUBSTITUIR PELA ÁRVORE REAL QUANDO POSSÍVEL
  //const tree = mocktree;*/



  // construção da árvore (atualiza se mudar a arvore ou largura da arvore)
  const { nodes, edges } = useMemo(() => {
    if (!taskmap) return { nodes: [], edges: [] };
    return buildGraph(root.id, taskmap, width);
  }, [taskmap, width]);

  // Mapa de nós de tarefas
  const nodeMap = useMemo(
    () => new Map(nodes.map((n) => [n.id, n])),
    [nodes]
  );

  const maxX = Math.max(...nodes.map(n => n.x + NODE_W));
  const maxY = Math.max(...nodes.map(n => n.y + NODE_H));

  if (!taskmap) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal>
        <ScrollView>
          <Svg width={maxX + 50} height={maxY + 50}>


            {/* Exibição das linhas entre nós */}
            {edges.map((e, i) => {
              const parent = nodeMap.get(e.parentId);
              const child = nodeMap.get(e.childId);

              if (!parent || !child) return null;

              return (
                <Line
                  key={i}
                  x1={parent.x + NODE_W / 2}
                  y1={parent.y + NODE_H}
                  x2={child.x + NODE_W / 2}
                  y2={child.y}
                  stroke="white"
                  strokeWidth={2}
                />
              );
            })}

            {/* Exibição dos nós, substituir por SubTarefaMinimal assim que possível */}
            {nodes.map((n) => (
              <G key={n.id} transform={`translate(${n.x}, ${n.y})`}>
                <Rect
                  width={NODE_W}
                  height={NODE_H}
                  rx={8}
                  ry={8}
                  fill="gray"
                />
                <Text x={10} y={25} fill="white">
                  {n.title}
                </Text>
              </G>
            ))}
          </Svg>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'purple',
  },
});