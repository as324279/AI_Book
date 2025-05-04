// import React, { useState } from 'react';
// import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
// import { useRouter } from 'expo-router';
// import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
// import { getDatabase, ref, get } from "firebase/database";
// import app from '../../firebase/firebase.client'
// import { auth } from '../../firebase/firebase.client'

// const LoginScreen = ()=> {
//   const [nickname, setNickname] = useState('');
//   const [password, setPassword] = useState('');
//   const router = useRouter();

//   const handleLogin = async () => {
//     if (!nickname || !password) {
//       Alert.alert('알림', '닉네임과 비밀번호를 모두 입력해주세요.');
//       return;
//     }
//     try {
//       // 닉네임으로 이메일 찾기
//       const db = getDatabase(app);
//       const snapshot = await get(ref(db, 'users'));
//       const users = snapshot.exists() ? snapshot.val() : {};
//       let email = null;
//       for (const uid in users) {
//         if (users[uid].nickname === nickname) {
//           email = users[uid].email;
//           break;
//         }
//       }
//       if (!email) {
//         Alert.alert('로그인 실패', '존재하지 않는 닉네임입니다.');
//         return;
//       }

//       // 이메일+비밀번호로 로그인
//       // const auth = getAuth(app);
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       // 이메일 인증 여부 확인
//       if (!user.emailVerified) {
//         Alert.alert('이메일 인증 필요', '이메일 인증을 완료한 후 로그인할 수 있습니다.');
//         return;
//       }

//       Alert.alert('로그인 성공!');
//       router.replace('../(screen)/MainHome');
//     } catch (error) {
//       Alert.alert('로그인 실패', error.message);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Pressable onPress={() => router.back()} style={styles.backButton}>
//         <Text style={styles.backButtonText}>&lt;</Text>
//       </Pressable>
//       <Text style={styles.title}>로그인</Text>
//       <TextInput style={styles.input} placeholder="닉네임" value={nickname} onChangeText={setNickname} />
//       <TextInput style={styles.input} placeholder="비밀번호" secureTextEntry value={password} onChangeText={setPassword} />
//       <Pressable style={styles.button} onPress={handleLogin}>
//         <Text style={styles.buttonText}>로그인</Text>
//       </Pressable>
//     </View>
//   );
// };
// export default LoginScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//     backgroundColor: '#FFF1DE',
//   },
//   button: {
//     backgroundColor: '#6B4B39',
//     padding: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   buttonText: { color: '#fff', fontWeight: 'bold' },
//   backButton: {
//     position: 'absolute',
//     top: 3,
//     left: 10,
//     padding: 5,
//   },
//   backButtonText: {
//     fontSize: 32,
//     color: '#6B4B39',
//     fontWeight: 'bold',
//   },
// }); 

import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from "firebase/auth";
import { get, ref } from "firebase/database";
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth, db } from '../../firebase/firebase.client'


export default function LoginScreen() {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!nickname || !password) {
      Alert.alert('알림', '닉네임과 비밀번호를 모두 입력해주세요.');
      return;
    }
    try {
      // 닉네임으로 이메일 찾기
      const snapshot = await get(ref(db, 'users'));
      const users = snapshot.exists() ? snapshot.val() : {};
      let email = null;
      for (const uid in users) {
        if (users[uid].nickname === nickname) {
          email = users[uid].email;
          break;
        }
      }
      if (!email) {
        Alert.alert('로그인 실패', '존재하지 않는 닉네임입니다.');
        return;
      }
      // 이메일+비밀번호로 로그인
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // 이메일 인증 여부 확인
      if (!user.emailVerified) {
        Alert.alert('이메일 인증 필요', '이메일 인증을 완료한 후 로그인할 수 있습니다.');
        return;
      }
      Alert.alert('로그인 성공!');
      router.replace('../(screen)/MainHome');
    } catch (error) {
      Alert.alert('로그인 실패', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>&lt;</Text>
      </Pressable>
      <Text style={styles.title}>로그인</Text>
      <TextInput style={styles.input} placeholder="닉네임" value={nickname} onChangeText={setNickname} />
      <TextInput style={styles.input} placeholder="비밀번호" secureTextEntry value={password} onChangeText={setPassword} />
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
