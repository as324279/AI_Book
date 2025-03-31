// src/screens/StartScreen.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';

export default function StartScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>BOOKMARK</Text>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>로그인</Text>
      </Pressable>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>회원가입</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF6F0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#1D1D1D',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#6B4B39',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
