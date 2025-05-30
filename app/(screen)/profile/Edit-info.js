import { useRouter } from "expo-router";
import {
  getAuth,
  onAuthStateChanged,
  updatePassword,
  verifyBeforeUpdateEmail,
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
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
  const [isEmailSent, setIsEmailSent] = useState(false);

  // 사용자 정보 로드 및 DB-Auth 이메일 자동 동기화
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const db = getDatabase(app);
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);
      const nickname = snapshot.exists() ? snapshot.val().nickname : "";
      const dbEmail = snapshot.exists() ? snapshot.val().email : "";
      setUserInfo({ nickname, email: user.email });

      // 인증 링크 클릭 후 Auth 이메일과 DB 이메일이 다르면 DB 이메일을 Auth 이메일로 동기화
      if (user.email && dbEmail && user.email !== dbEmail) {
        try {
          await update(userRef, { email: user.email });
        } catch (err) {
          // 동기화 실패 시 무시
        }
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
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
      if (!user) {
        Alert.alert("알림", "로그인 후 이용해주세요.");
        return;
      }
      const db = getDatabase(app);
      await update(ref(db, `users/${user.uid}`), { nickname: nicknameInput });
      setUserInfo(prev => ({ ...prev, nickname: nicknameInput }));
      setNicknameInput("");
      Alert.alert('수정 완료', '닉네임이 성공적으로 변경되었습니다.');
    } catch (error) {
      Alert.alert('오류', error.message);
    }
  };

  // 1. 변경할 이메일 입력 후 인증 버튼 클릭 → 인증 메일 전송
  const handleSendVerification = async () => {
    if (!emailInput.trim()) {
      Alert.alert('알림', '새 이메일을 입력해주세요.');
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("알림", "로그인 후 이용해주세요.");
        return;
      }
      await verifyBeforeUpdateEmail(user, emailInput);
      setIsEmailSent(true);
      Alert.alert('인증 메일 전송', '이메일로 인증 링크를 발송했습니다.');
    } catch (error) {
      Alert.alert('오류', error.message);
    }
  };

  // 2. 인증 링크 클릭 후 앱 진입 → 3. 새로고침 시 재로그인 유도
  const handleReloadUser = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("알림", "로그인 정보가 없습니다. 다시 로그인해주세요.");
        router.replace('/login'); // 로그인 화면으로 이동
        return;
      }
      await user.reload();
      // 인증 링크 클릭 후 세션 만료로 인해 로그아웃된 경우 반드시 재로그인 필요
      Alert.alert(
        "알림",
        "이메일 인증 후에는 반드시 새 이메일로 다시 로그인해야 합니다.",
        [
          { text: "확인", onPress: () => router.replace('/login') }
        ]
      );
    } catch (error) {
      Alert.alert(
        "세션 만료",
        "이메일 인증 후에는 반드시 새 이메일로 다시 로그인해야 합니다.",
        [
          { text: "확인", onPress: () => router.replace('/login') }
        ]
      );
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
      if (!user) {
        Alert.alert("알림", "로그인 정보가 없습니다. 다시 로그인해주세요.");
        router.replace("/login");
        return;
      }
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
      <View style={styles.header}>
        <Pressable style={styles.headerIconLeft} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={28} color="#6B4B39" />
        </Pressable>
        <View style={styles.headerLogoTitle}>
          <Text style={styles.headerTitle}>계정</Text>
        </View>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B4B39" />
        </View>
      ) : (
        <View style={styles.container}>
          {/* 닉네임 수정 */}
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
          {/* 이메일 인증/수정 */}
          <View style={styles.infoGroup}>
            <Text style={styles.label}>이메일</Text>
            <Text style={styles.currentInfo}>현재: {userInfo.email}</Text>
            <View style={styles.inputButtonRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="새 이메일 입력"
                value={emailInput}
                onChangeText={setEmailInput}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {!isEmailSent ? (
                <Pressable style={styles.inlineButton} onPress={handleSendVerification}>
                  <Text style={styles.buttonText}>인증</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.inlineButton} onPress={handleReloadUser}>
                  <Text style={styles.buttonText}>새로고침</Text>
                </Pressable>
              )}
            </View>
          </View>
          <View style={styles.divider} />
          {/* 비밀번호 변경 */}
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
            </View>
            <Pressable style={styles.fullButton} onPress={handlePasswordUpdate}>
              <Text style={styles.buttonText}>비밀번호 변경</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FEF6F0" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerIconLeft: {
    width: 36,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerLogoTitle: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#6B4B39",
  },
  container: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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
    flexDirection: "row",
    alignItems: "center",
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
