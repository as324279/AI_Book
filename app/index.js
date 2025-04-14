// index.js - 앱의 시작 화면
// 이 파일은 앱의 루트 경로('/')에 해당하는 화면을 정의합니다.
import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function StartScreen() {
  // Expo Router의 useRouter 훅을 사용하여 화면 간 이동을 관리합니다.
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* 앱 로고 이미지 */}
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      {/* 로그인 버튼 - 클릭 시 로그인 화면으로 이동 */}
      <Pressable style={styles.button} onPress={() => router.push('/login')}>
        <Text style={styles.buttonText}>로그인</Text>
      </Pressable>
      {/* 회원가입 버튼 - 클릭 시 회원가입 화면으로 이동 */}
      <Pressable style={styles.button} onPress={() => router.push('/signup')}>
        <Text style={styles.buttonText}>회원가입</Text>
      </Pressable>
    </View>
  );
}

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF6F0', // 베이지색 배경
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#6B4B39', // 브라운 계열 버튼
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