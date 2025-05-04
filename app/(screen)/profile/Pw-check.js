import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import app from "../../../firebase/firebase.client";
import CustomHeader from "../../../components/CustomHeader";


const PasswordCheckScreen = ()=> {
  const router = useRouter();
  // const auth = getAuth(app);
  const [currentPassword, setCurrentPassword] = useState("");

  const handlePasswordCheck = async () => {
    if (!currentPassword) {
      return Alert.alert("알림", "비밀번호를 입력해주세요.");
    }

    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      
      await reauthenticateWithCredential(user, credential);
      
      // 성공 → edit-info로 이동
      router.push("../../(screen)/profile/Edit-info");
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        Alert.alert("오류", "비밀번호가 틀렸습니다.");
      } else {
        Alert.alert("오류", error.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader showBack title="비밀번호 확인" showIcons={false} />
      
      <View style={styles.container}>
        <Text style={styles.title}>비밀번호를 입력해주세요</Text>

        <TextInput
          placeholder="현재 비밀번호 입력"
          style={styles.input}
          secureTextEntry
          onChangeText={setCurrentPassword}
          value={currentPassword}
        />

        <Pressable style={styles.button} onPress={handlePasswordCheck}>
          <Text style={styles.buttonText}>확인</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
export default PasswordCheckScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FEF6F0" },
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 24, textAlign: "center", color: "#6B4B39" },
  input: {
    backgroundColor: "#FFF1DE",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderColor: "#E5D1B8",
    borderWidth: 1,
  },
  button: {
    backgroundColor: "#6B4B39",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});