import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Configuracoes = () => {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, styles.text]}>Configurações</Text>
      <Text style={styles.text}>Configurações do aplicativo.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    color: 'white'
  }
});

export default Configuracoes;
