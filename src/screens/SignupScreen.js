// src/screens/SignupScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleNext = () => {
    if (!email || !password || !confirm) {
      return Alert.alert('모든 항목을 입력해주세요.');
    }
    if (password !== confirm) {
      return Alert.alert('비밀번호가 일치하지 않습니다.');
    }

    navigation.navigate('InterestSelect', {
      email,
      password,
    });
  };

  return (
    <View style={styles.container}>
      <Pressable 
        style={styles.backButton} 
        onPress={() => navigation.navigate('Start')}
      >
        <Text style={styles.backButtonText}>←</Text>
      </Pressable>
      <Text style={styles.title}>회원가입</Text>
      <TextInput placeholder="Email" style={styles.input} onChangeText={setEmail} />
      <TextInput placeholder="Password" style={styles.input} secureTextEntry onChangeText={setPassword} />
      <TextInput placeholder="Re-enterPassword" style={styles.input} secureTextEntry onChangeText={setConfirm} />
      <Pressable style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>다음</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF6F0', padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: {
    backgroundColor: '#FFF1DE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
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
