// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    Alert.alert('로그인 성공!');
    navigation.navigate('Main'); // 로그인 후 메인인화면으로 이동
  };

  return (
    <View style={styles.container}>
      <Pressable 
        style={styles.backButton} 
        onPress={() => navigation.navigate('Start')}
      >
        <Text style={styles.backButtonText}>←</Text>
      </Pressable>

      <Text style={styles.title}>로그인</Text>
      <TextInput
        placeholder="이메일"
        style={styles.input}
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        placeholder="비밀번호"
        style={styles.input}
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>로그인</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#FFF1DE',
  },
  button: {
    backgroundColor: '#6B4B39',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  backButton: {
    position: 'absolute',
    top: 3,
    left: 10,
    padding: 5,
  },
  backButtonText: {
    fontSize: 32,
    color: '#6B4B39',
    fontWeight: 'bold',
  },
});
