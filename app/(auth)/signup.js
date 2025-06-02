import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, sendEmailVerification, signOut } from "firebase/auth";
import { get, getDatabase, ref, set } from "firebase/database";
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import app from '../../firebase/firebase.client';

const SignupScreen = ()=> {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [uid, setUid] = useState(null);
  const [initializing, setInitializing] = useState(true); // [추가] 초기화 상태

  const router = useRouter();
  const auth = getAuth(app);

  // [수정] 진입 시 이미 로그인된 사용자가 있으면 로그아웃하고, 로그아웃이 끝난 후에만 onAuthStateChanged 구독
  useEffect(() => {
    let unsubscribe;
    const checkAndLogout = async () => {
      if (auth.currentUser) {
        await signOut(auth);
      }
      // 로그아웃이 끝난 뒤에만 구독 시작
      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUid(user.uid);
          setIsVerified(user.emailVerified);
          if (user.emailVerified) {
            Alert.alert('인증 완료', '이메일 인증이 완료되었습니다!');
          }
        } else {
          setUid(null);
          setIsVerified(false);
        }
        setInitializing(false); // 초기화 끝
      });
    };
    checkAndLogout();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 인증 메일 발송 핸들러
  const handleSendVerification = async () => {
    try {
      if (!nickname || !email || !password || !confirm) {
        return Alert.alert('모든 항목을 입력해주세요.');
      }
      if (password !== confirm) {
        return Alert.alert('비밀번호가 일치하지 않습니다.');
      }

      // 닉네임 중복 체크
      const db = getDatabase(app);
      const snapshot = await get(ref(db, 'users'));
      const users = snapshot.exists() ? snapshot.val() : {};
      const nicknameExists = Object.values(users).some(u => u.nickname === nickname);
      if (nicknameExists) {
        return Alert.alert('이미 사용 중인 닉네임입니다.');
      }

      // 계정 생성
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setUid(user.uid);

      // 닉네임 저장
      await set(ref(db, `users/${user.uid}`), { nickname, email });

      // 인증 메일 발송
      await sendEmailVerification(user);
      setIsEmailSent(true);
      Alert.alert('인증 메일 발송', '입력하신 이메일로 인증 링크를 발송했습니다');
    } catch (error) {
      Alert.alert('오류 발생', error.message);
    }
  };

  // 인증 상태 강제 새로고침
  const handleReloadUser = async () => {
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        setIsVerified(auth.currentUser.emailVerified);
        if (auth.currentUser.emailVerified) {
          Alert.alert('인증 완료', '이메일 인증이 완료되었습니다!');
        } else {
          Alert.alert('아직 인증이 완료되지 않았습니다.', '이메일의 인증 링크를 클릭한 후 다시 시도하세요.');
        }
      }
    } catch (error) {
      Alert.alert('오류 발생', error.message);
    }
  };

  // 다음 단계로 이동
  const handleNext = () => {
    if (!isVerified) {
      return Alert.alert('이메일 인증 필요', '이메일 인증을 먼저 완료해주세요');
    }
    // 장르 선택 화면으로 UID 전달
    router.push({
      pathname: './interest-select',
      params: { uid }
    });
  };

  // [추가] 초기화 중일 때는 로딩 표시
  if (initializing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6B4B39" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>{"<"}</Text>
      </Pressable>
      <Text style={styles.title}>회원가입</Text>
      <TextInput
        style={styles.input}
        placeholder="닉네임"
        value={nickname}
        onChangeText={setNickname}
        autoCapitalize="none"
      />
      <View style={styles.emailRow}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Pressable
          style={[
            styles.verifyButton,
            (!nickname || !email || !password || !confirm) && styles.disabledButton
          ]}
          onPress={handleSendVerification}
          disabled={!nickname || !email || !password || !confirm}
        >
          <Text style={styles.buttonText}>{isEmailSent ? '전송 완료' : '인증 전송'}</Text>
        </Pressable>
      </View>
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Text style={styles.passwordHint}>
        비밀번호는 7~12자, 소문자, 숫자, 특수문자를 모두 포함해야 합니다.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="비밀번호 확인"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
      />

      {/* 인증 상태 새로고침 버튼 */}
      {isEmailSent && !isVerified && (
        <Pressable style={styles.reloadButton} onPress={handleReloadUser}>
          <Text style={styles.reloadButtonText}>인증 상태 새로고침</Text>
        </Pressable>
      )}

      <Pressable
        style={[styles.button, (!isVerified || !uid) && styles.disabledButton]}
        onPress={handleNext}
        disabled={!isVerified || !uid}
      >
        <Text style={styles.buttonText}>다음 단계로</Text>
      </Pressable>
    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF6F0',
    padding: 20,
    justifyContent: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#FFF1DE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyButton: {
    backgroundColor: '#6B4B39',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  button: {
    backgroundColor: '#6B4B39',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  reloadButton: {
    backgroundColor: '#C4A484',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  reloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
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
  passwordHint: {
    color: '#888',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 16,
    paddingLeft: 8
  },
});
