import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, BackHandler, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../../components/CustomHeader";
import { useRouter } from "expo-router";
import {
  getAuth,
  updateEmail,
  updatePassword,
  sendEmailVerification,
  verifyBeforeUpdateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged
} from "firebase/auth";
import { getDatabase, ref, get, update } from "firebase/database";
import app from "../../../firebase/firebase.client";

const EditInfoScreen = ()=> {
  const router = useRouter();
   const auth = getAuth(app);
  
  // 현재 사용자 정보 상태
  const [userInfo, setUserInfo] = useState({
    nickname: "",
    email: "",
  });
  
  // 새로운 정보 입력 상태
  const [newInfo, setNewInfo] = useState({
    nickname: "",
    email: "",
    password: "",
    confirm: "",
    currentPassword: "", // 현재 비밀번호 확인용
  });
  
  const [loading, setLoading] = useState(true);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Firebase에서 사용자 정보 불러오기
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const db = getDatabase(app);
        const snapshot = await get(ref(db, `users/${user.uid}`));
        const nickname = snapshot.exists() ? snapshot.val().nickname : "";
        
        setUserInfo({
          nickname: nickname,
          email: user.email,
        });
        setIsVerified(user.emailVerified);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // 이메일 인증 메일 발송 (새 이메일로)
  const handleSendVerification = async () => {
    if (!newInfo.email) {
      Alert.alert('알림', '새 이메일을 입력해주세요.');
      return;
    }
    
    if (!newInfo.currentPassword) {
      Alert.alert('알림', '보안을 위해 현재 비밀번호를 입력해주세요.');
      return;
    }

    try {
      const user = auth.currentUser;
      
      // 재인증 (t보안 작업 전 필수)
      const credential = EmailAuthProvider.credential(
        user.email, 
        newInfo.currentPassword
      );
      
      await reauthenticateWithCredential(user, credential);
      
      // 새 이메일로 인증 메일 전송
      await verifyBeforeUpdateEmail(user, newInfo.email);
      
      setIsEmailSen(true);
      Alert.alert('인증 메일 전송', '새 이메일 주소로 인증 링크를 발송했습니다. 링크를 클릭하여 이메일을 인증해주세요.');
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        Alert.alert('오류', '현재 비밀번호가 올바르지 않습니다.');
      } else {
        Alert.alert('오류', error.message);
      }
    }
  };

  // 인증 상태 새로고침
  const handleReloadUser = async () => {
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        
        // 이메일이 변경되었는지 확인
        const user = auth.currentUser;
        setIsVerified(user.emailVerified);
        
        if (user.email === newInfo.email && user.emailVerified) {
          // DB에도 이메일 업데이트
          const db = getDatabase(app);
          await update(ref(db, `users/${user.uid}`), { email: user.email });
          
          // 상태 업데이트
          setUserInfo(prev => ({ ...prev, email: user.email }));
          setNewInfo(prev => ({ ...prev, email: "" }));
          
          Alert.alert('인증 완료', '이메일이 성공적으로 변경되었습니다!');
        } else {
          Alert.alert('아직 인증이 완료되지 않았습니다.', '이메일의 인증 링크를 클릭한 후 다시 시도하세요.');
        }
      }
    } catch (error) {
      Alert.alert('오류', error.message);
    }
  };

  // 정보 수정 핸들러
  const handleSubmit = async () => {
    // 현재 비밀번호 확인
    if (!newInfo.currentPassword) {
      return Alert.alert('알림', '보안을 위해 현재 비밀번호를 입력해주세요.');
    }
    
    // 비밀번호 일치 확인
    if (newInfo.password && newInfo.password !== newInfo.confirm) {
      return Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
    }
    
    try {
      const user = auth.currentUser;
      const db = getDatabase(app);
      
      // 재인증 (보안 작업 전 필수)
      const credential = EmailAuthProvider.credential(
        user.email, 
        newInfo.currentPassword
      );
      
      await reauthenticateWithCredential(user, credential);
      
      // 닉네임 변경
      if (newInfo.nickname && newInfo.nickname !== userInfo.nickname) {
        await update(ref(db, `users/${user.uid}`), { nickname: newInfo.nickname });
        
        // 상태 업데이트
        setUserInfo(prev => ({ ...prev, nickname: newInfo.nickname }));
        setNewInfo(prev => ({ ...prev, nickname: "" }));
      }
      
      // 비밀번호 변경
      if (newInfo.password) {
        await updatePassword(user, newInfo.password);
        setNewInfo(prev => ({ ...prev, password: "", confirm: "", currentPassword: "" }));
        Alert.alert('비밀번호 변경', '비밀번호가 성공적으로 변경되었습니다.');
      } else {
        Alert.alert('수정 완료', '정보가 성공적으로 수정되었습니다.');
      }
      
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        Alert.alert('오류', '현재 비밀번호가 올바르지 않습니다.');
      } else {
        Alert.alert('오류', error.message);
      }
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.push('/(tabs)/profile');
      return true;
    });

    return () => backHandler.remove();
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader showBack title="정보 수정" />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B4B39" />
        </View>
      ) : (
        <View style={styles.container}>
          {/* 닉네임 섹션 */}
          <View style={styles.infoGroup}>
            <Text style={styles.label}>닉네임</Text>
            <Text style={styles.currentInfo}>현재: {userInfo.nickname}</Text>
            <TextInput
              style={styles.input}
              placeholder="새로운 닉네임 입력"
              value={newInfo.nickname}
              onChangeText={(text) => setNewInfo({...newInfo, nickname: text})}
            />
          </View>

          {/* 이메일 섹션 */}
          <View style={styles.infoGroup}>
            <Text style={styles.label}>이메일</Text>
            <Text style={styles.currentInfo}>현재: {userInfo.email}</Text>
            <TextInput
              style={styles.input}
              placeholder="새로운 이메일 입력"
              value={newInfo.email}
              onChangeText={(text) => setNewInfo({...newInfo, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.emailRow}>
              <Pressable
                style={[styles.verifyButton, !newInfo.email && styles.disabledButton]}
                onPress={handleSendVerification}
                disabled={!newInfo.email}
              >
                <Text style={styles.buttonText}>{isEmailSent ? '전송 완료' : '인증 전송'}</Text>
              </Pressable>
              {isEmailSent && !isVerified && (
                <Pressable style={styles.reloadButton} onPress={handleReloadUser}>
                  <Text style={styles.reloadButtonText}>인증 상태 새로고침</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* 비밀번호 섹션 */}
          <View style={styles.infoGroup}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="현재 비밀번호 입력"
              value={newInfo.currentPassword}
              onChangeText={(text) => setNewInfo({...newInfo, currentPassword: text})}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="새로운 비밀번호 입력"
              value={newInfo.password}
              onChangeText={(text) => setNewInfo({...newInfo, password: text})}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="비밀번호 재입력"
              value={newInfo.confirm}
              onChangeText={(text) => setNewInfo({...newInfo, confirm: text})}
              secureTextEntry
            />
            <Text style={styles.passwordHint}>
              비밀번호는 7~12자, 소문자, 숫자, 특수문자를 모두 포함해야 합니다.
            </Text>
          </View>

          <Pressable style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>수정 완료</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
export default EditInfoScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FEF6F0" },
  container: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  infoGroup: { marginBottom: 20 },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6B4B39",
    marginBottom: 8,
  },
  currentInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    backgroundColor: "#FFF1DE",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5D1B8",
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5D1B8",
    marginBottom: 8,
  },
  emailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  verifyButton: {
    backgroundColor: "#6B4B39",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: "#CCC" },
  reloadButton: {
    backgroundColor: "#C4A484",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  reloadButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  button: {
    backgroundColor: "#6B4B39",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  passwordHint: {
    color: "#888",
    fontSize: 12,
    marginTop: -4,
    marginBottom: 8,
    paddingLeft: 8,
  },
});