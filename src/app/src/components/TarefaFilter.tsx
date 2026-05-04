import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export type FiltroEstado = 'Todas' | 'Pendentes' | 'Concluídas';

interface TarefaFilterProps {
  selectedState: FiltroEstado;
  selectedCategories: string[];
  categoriasDisponiveis: string[];
  onSelectState: (state: FiltroEstado) => void;
  onToggleCategory: (category: string) => void;
}

const TarefaFilter: React.FC<TarefaFilterProps> = ({
  selectedState,
  selectedCategories,
  categoriasDisponiveis,
  onSelectState,
  onToggleCategory,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.container}>
      {/* Filtros de Estado */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {(['Todas', 'Pendentes', 'Concluídas'] as FiltroEstado[]).map((estado) => {
          const isActive = selectedState === estado;
          return (
            <TouchableOpacity
              key={estado}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => onSelectState(estado)}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{estado}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Filtros de Categorias (se houver categorias disponíveis) */}
      {categoriasDisponiveis.length > 0 && (
        <View style={styles.categoriesSection}>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setIsExpanded(!isExpanded)}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionLabel}>Categorias</Text>
            <Text style={styles.sectionIcon}>{isExpanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.wrapContainer}>
              {categoriasDisponiveis.map((categoria) => {
                const isActive = selectedCategories.includes(categoria);
                return (
                  <TouchableOpacity
                    key={categoria}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => onToggleCategory(categoria)}
                  >
                    <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{categoria}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export const aplicarFiltros = (tarefas: any[], estado: FiltroEstado, categorias: string[]) => {
  return tarefas.filter(t => {
    // Filtro de Estado
    if (estado === 'Pendentes' && t.estado === 'Finalizado') return false;
    if (estado === 'Concluídas' && t.estado !== 'Finalizado') return false;

    // Filtro de Categorias
    if (categorias.length > 0) {
      if (!t.categorias || t.categorias.length === 0) return false;
      const temCategoria = categorias.some(c => t.categorias.includes(c));
      if (!temCategoria) return false;
    }

    return true;
  });
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 24,
  },
  categoriesSection: {
    paddingHorizontal: 24,
    gap: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#3D3D3D',
    marginVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  sectionLabel: {
    color: '#A59EC0',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionIcon: {
    color: '#A59EC0',
    fontSize: 10,
  },
  wrapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#2D2D2D',
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  filterChipActive: {
    backgroundColor: 'rgba(159, 124, 250, 0.2)',
    borderColor: '#9F7CFA',
  },
  filterText: {
    color: '#A59EC0',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#9F7CFA',
    fontWeight: 'bold',
  },
});

export default TarefaFilter;
