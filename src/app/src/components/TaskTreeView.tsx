import { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Line, Rect, Text, G } from 'react-native-svg';

import { Tarefa } from '../types/tarefa';
import { GetAllSubtarefas } from '../services/TarefaService';
import { CarregarTarefas } from '../services/LocalStorageService';
import { SubTarefaMinimalSVG } from './SubTarefaMinimal';
import { useTheme } from '../theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTaskModals } from './TarefaList';

// Tipos que representam os nós e arestas
type PositionedNode = {
  tarefa: Tarefa;
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
  modalMode?: 'details' | 'edit';
};

// Constantes do canvas, somente para o esqueleto, depois serão substituidas por um componente
const NODE_W = 110;
const NODE_H = 40;
const H_GAP = 30;
const V_GAP = 70;

// Criação gráfica da árvore
// um cursor decide em qual lado colocar o nó filho
// nós pais se centralizam entre seus filhos
function buildGraph(rootId: string, taskMap: Map<string, Tarefa>, viewportWidth: number, zoom: number) {
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

      nodes.push({ tarefa: t, id: t.id, title: t.titulo, x, y });

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
      tarefa: t,
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
  const miny = Math.min(...nodes.map((n) => n.y));
  const maxy = Math.max(...nodes.map((n) => n.y + NODE_H));
  const treeHeight = maxy - miny;

  // Centralização da árvore
  const shiftx = Math.max(30, (viewportWidth - (treeWidth * zoom)) / 2 - minX * zoom);
  const shifty = Math.max(30, ((treeHeight * zoom)) / 2 - miny * zoom);

  return {
    nodes: nodes.map((n) => ({ ...n, x: n.x + shiftx, y: n.y + shifty })),
    edges,
  };
}

export default function TaskTreeView({ tarefa, modalMode }: Props) {
  const { width, height } = Dimensions.get('window');

  const { theme } = useTheme();

  const [task] = useState(tarefa);
  const [root, setRoot] = useState<Tarefa>(tarefa);
  const [subtasks, setSubtasks] = useState({});
  const [taskmap, setTaskmap] = useState<Map<string, Tarefa>>();
  const [zoom, setZoom] = useState(1);

  const onRefresh = async () => {
    await initialize();
  }

  const { handleOpenDetails, handleOpenEdit, modals } = useTaskModals(onRefresh);

  const initialize = async () => {
      let tarefas = await CarregarTarefas();
      if (tarefas) {
        let root = GetRootTask(tarefa, tarefas);
        if (root == tarefa) root = tarefas[tarefa.id];
        setRoot(root);
        const res = await GetAllSubtarefas(root);
        let array: Tarefa[] = [];
        array.push(root);
        if (res) {
          setSubtasks(res);
          array = array.concat(res);
          setZoom((1/array.length) + 0.7); // Zoom automático baseado na quantidade de nós, para tentar manter a árvore visível (ajustar fórmula depois)
        }
        console.log("taskMap OG array: ", array.length);
        let mapped = ToTaskMap(array);
        console.log(mapped.size);
        setTaskmap(mapped);
      }
    };

  // Carregamento Inicial
  useEffect(() => {
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
    return buildGraph(root.id, taskmap, width, zoom);
  }, [taskmap, width]);

  // Mapa de nós de tarefas
  const nodeMap = useMemo(
    () => new Map(nodes.map((n) => [n.id, n])),
    [nodes]
  );

  const maxX = Math.max(...nodes.map(n => n.x + NODE_W));
  const maxY = Math.max(...nodes.map(n => n.y + NODE_H));

  function changeZoom(delta: number) {
    setZoom((prev) => Math.min(1.5, Math.max(0.3, prev + delta)));
  }

  if (!taskmap) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {modals}
      <ScrollView horizontal  >
        <ScrollView>
          <Svg width={(maxX + 100)*zoom} height={(maxY + 100) * zoom}>
            <G transform={`scale(${zoom})`}>

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
                  stroke={theme.colors.textSecondary}
                  strokeWidth={2}
                />
              );
            })}

            {/* Exibição dos nós, substituir por SubTarefaMinimal assim que possível */}
            {nodes.map((n) => (
              <G key={n.id} transform={`translate(${n.x}, ${n.y})`}>
                <SubTarefaMinimalSVG tarefa={n.tarefa} basewidth={NODE_W} baseheight={NODE_H} onPress={(e) => modalMode == 'details' ? handleOpenDetails(e, true) : handleOpenEdit(e, true)} />
              </G>
            ))}
            </G>
          </Svg>
        </ScrollView>
      </ScrollView>
      <View>
        <TouchableOpacity style={[styles.fab2, { backgroundColor: theme.colors.primary }]} onPress={() => changeZoom(-0.1)} activeOpacity={0.8}>
          <Icon
            name="remove"
            size={28}
            color="#ffffff"
            style={styles.fabIcon2}
          />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fab, { backgroundColor: theme.colors.primary }]} onPress={() => changeZoom(0.1)} activeOpacity={0.8}>
          <Icon
            name="add"
            size={28}
            color="#ffffff"
            style={styles.fabIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 30
  },
  fab: {
    position: 'absolute',
    bottom: 60,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5
  },
  fabIcon: {
    fontSize: 32,
    lineHeight: 34
  },
  fab2: {
        position: 'absolute',
        bottom: 60,
        right: 105, // Posicionado à esquerda do FAB principal (60 largura + 30 direita + 15 de gap)
        backgroundColor: '#2D2D2D',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        borderWidth: 1,
        borderColor: '#3D3D3D'
    },
    fabIcon2: {
        fontSize: 32,
        color: '#FFFFFF'
    }
});