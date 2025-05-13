import { useRouter } from "expo-router";
import {
  getAuth,
  onAuthStateChanged,
  updatePassword,
  verifyBeforeUpdateEmail
} from "firebase/auth";
import { get, getDatabase, ref, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import app from "../../../firebase/firebase.client";

export default function EditInfoScreen() {
  const router = useRouter();
  const auth = getAuth(app);

  // 상태 관리
  const [userInfo, setUserInfo] = useState({ nickname: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [nicknameInput, setNicknameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // 이메일 인증 관련 상태
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false); // 인증 링크 클릭 여부

  // 사용자 정보 로드
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const db = getDatabase(app);
        const snapshot = await get(ref(db, `users/${user.uid}`));
        const nickname = snapshot.exists() ? snapshot.val().nickname : "";
        setUserInfo({ nickname, email: user.email });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 닉네임 수정
  const handleNicknameUpdate = async () => {
    if (!nicknameInput.trim()) {
      Alert.alert('알림', '새 닉네임을 입력해주세요.');
      return;
    }
    try {
      const user = auth.currentUser;
      const db = getDatabase(app);
      await update(ref(db, `users/${user.uid}`), { nickname: nicknameInput });
      setUserInfo(prev => ({ ...prev, nickname: nicknameInput }));
      setNicknameInput("");
      Alert.alert('수정 완료', '닉네임이 성공적으로 변경되었습니다.');
    } catch (error) {
      Alert.alert('오류', error.message);
    }
  };

  // 이메일 인증 메일 전송
  const handleSendVerification = async () => {
    if (!emailInput.trim()) {
      Alert.alert('알림', '새 이메일을 입력해주세요.');
      return;
    }
    try {
      const user = auth.currentUser;
      await verifyBeforeUpdateEmail(user, emailInput);
      setIsEmailSent(true);
      setIsEmailVerified(false); // 새 인증 시작 시 초기화
      Alert.alert('인증 메일 전송', '이메일로 인증 링크를 발송했습니다.');
    } catch (error) {
      Alert.alert('오류', error.message);
    }
  };

  // 인증 상태 새로고침
  const handleReloadUser = async () => {
    try {
      const user = auth.currentUser;
      await user.reload();
      // 인증 링크 클릭 시, auth의 이메일이 새 이메일로 바뀌고 emailVerified가 true가 됨
      if (user.email === emailInput && user.emailVerified) {
        setIsEmailVerified(true);
        Alert.alert('인증 완료', '이메일 인증이 확인되었습니다. "수정" 버튼을 눌러주세요.');
      } else {
        setIsEmailVerified(false);
        Alert.alert('알림', '아직 이메일 인증이 완료되지 않았습니다.');
      }
    } catch (error) {
      Alert.alert('오류', error.message);
    }
  };

  // 이메일 DB 최종 변경
  const handleEmailUpdate = async () => {
    try {
      const user = auth.currentUser;
      const db = getDatabase(app);
      await update(ref(db, `users/${user.uid}`), { email: user.email });
      setUserInfo(prev => ({ ...prev, email: user.email }));
      setEmailInput("");
      setIsEmailSent(false);
      setIsEmailVerified(false);
      Alert.alert('수정 완료', '이메일이 성공적으로 변경되었습니다!');
    } catch (error) {
      Alert.alert('오류', error.message);
    }
  };

  // 비밀번호 수정
  const handlePasswordUpdate = async () => {
    if (!passwordInput || !passwordConfirm) {
      Alert.alert('알림', '새 비밀번호와 확인을 입력해주세요.');
      return;
    }
    if (passwordInput !== passwordConfirm) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      const user = auth.currentUser;
      await updatePassword(user, passwordInput);
      setPasswordInput("");
      setPasswordConfirm("");
      Alert.alert('성공', '비밀번호가 변경되었습니다.');
    } catch (error) {
      Alert.alert('오류', error.message);
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.push('/main/profile');
      return true;
    });
    return () => backHandler.remove();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B4B39" />
        </View>
      ) : (
        <View style={styles.container}>
          {/* 닉네임 수정 세트 */}
          <View style={styles.infoGroup}>
            <Text style={styles.label}>닉네임</Text>
            <Text style={styles.currentInfo}>현재: {userInfo.nickname}</Text>
            <View style={styles.inputButtonRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="새 닉네임 입력"
                value={nicknameInput}
                onChangeText={setNicknameInput}
              />
              <Pressable style={styles.inlineButton} onPress={handleNicknameUpdate}>
                <Text style={styles.buttonText}>수정</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.divider} />

          {/* 이메일 수정 세트 */}
          <View style={styles.infoGroup}>
            <Text style={styles.label}>이메일</Text>
            <Text style={styles.currentInfo}>현재: {userInfo.email}</Text>
            <View style={styles.inputButtonRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="새 이메일 입력"
                value={emailInput}
                onChangeText={setEmailInput}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {!isEmailSent ? (
                <Pressable style={styles.inlineButton} onPress={handleSendVerification}>
                  <Text style={styles.buttonText}>인증</Text>
                </Pressable>
              ) : (
                !isEmailVerified ? (
                  <Pressable style={styles.inlineButton} onPress={handleReloadUser}>
                    <Text style={styles.buttonText}>인증 새로고침</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={[styles.inlineButton, styles.confirmedButton]}
                    onPress={handleEmailUpdate}
                  >
                    <Text style={styles.buttonText}>수정</Text>
                  </Pressable>
                )
              )}
            </View>
          </View>
          <View style={styles.divider} />

          {/* 비밀번호 수정 세트 */}
          <View style={styles.infoGroup}>
            <Text style={styles.label}>비밀번호</Text>
            <View style={styles.inputButtonRowColumn}>
              <TextInput
                style={styles.input}
                placeholder="새 비밀번호"
                value={passwordInput}
                onChangeText={setPasswordInput}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="비밀번호 확인"
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                secureTextEntry
              />
              <Pressable style={styles.fullButton} onPress={handlePasswordUpdate}>
                <Text style={styles.buttonText}>비밀번호 변경</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FEF6F0" },
  container: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  infoGroup: { marginBottom: 0 },
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
    marginBottom: 0,
  },
  inputButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlineButton: {
    backgroundColor: "#6B4B39",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmedButton: {
    backgroundColor: "#4CAF50",
  },
  inputButtonRowColumn: {
    flexDirection: "column",
    gap: 8,
  },
  fullButton: {
    backgroundColor: "#6B4B39",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  divider: {
    height: 1,
    backgroundColor: "#E5D1B8",
    marginVertical: 28,
  },
});