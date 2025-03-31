// src/screens/SplashScreen.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/Splash-logo.png')} // 이미지 파일 경로 확인
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>BOOKMARK</Text>
      <Text style={styles.slogan}>읽고, 기록하고, 나누다!</Text>
      <Text style={styles.subtitle}>더 스마트한 독서 습관</Text>
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
    marginBottom: 16,
  },
  slogan: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
});
