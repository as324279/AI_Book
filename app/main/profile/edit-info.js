import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../../components/CustomHeader";
import { useRouter } from "expo-router";

export default function EditInfoScreen() {
  const router = useRouter();
  // 현재 사용자 정보 (나중에 서버/상태관리로 대체 예정)
  const [userInfo, setUserInfo] = useState({
    nickname: "book",
    email: "book@example.com",
  });

  const [newInfo, setNewInfo] = useState({
    nickname: "",
    email: "",
    password: "",
  });

  const handleSubmit = () => {
    // 변경된 정보만 업데이트하는 로직 추가 예정
    console.log("정보 업데이트");
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
      <CustomHeader showBack showIcons={false} title="내 정보 수정" />
      <View style={styles.container}>
        <View style={styles.infoGroup}>
          <Text style={styles.label}>닉네임</Text>
          <Text style={styles.currentInfo}>현재: {userInfo.nickname}</Text>
          <TextInput 
            placeholder="새로운 닉네임 입력" 
            style={styles.input}
            value={newInfo.nickname}
            onChangeText={(text) => setNewInfo({...newInfo, nickname: text})}
          />
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>이메일</Text>
          <Text style={styles.currentInfo}>현재: {userInfo.email}</Text>
          <TextInput 
            placeholder="새로운 이메일 입력" 
            style={styles.input}
            value={newInfo.email}
            onChangeText={(text) => setNewInfo({...newInfo, email: text})}
          />
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            placeholder="새로운 비밀번호 입력"
            style={styles.input}
            secureTextEntry
            value={newInfo.password}
            onChangeText={(text) => setNewInfo({...newInfo, password: text})}
          />
        </View>

        <Pressable style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>수정 완료</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FEF6F0",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  infoGroup: {
    marginBottom: 20,
  },
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
  },
  button: {
    backgroundColor: "#6B4B39",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
