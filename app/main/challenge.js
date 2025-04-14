import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChallengeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>챌린지 화면</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF6F0',
  },
  text: {
    fontSize: 18,
    color: '#6B4B39',
  },
}); 