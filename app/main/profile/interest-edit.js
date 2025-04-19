import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, BackHandler, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../../components/CustomHeader";
import { useRouter } from "expo-router";
import DropDownPicker from 'react-native-dropdown-picker';

export default function InterestEditScreen() {
  const router = useRouter();
  
  // 드롭다운 상태 관리
  const [genre1, setGenre1] = useState(null);
  const [genre2, setGenre2] = useState(null);
  const [genre3, setGenre3] = useState(null);
  
  // 드롭다운 열림 상태 제어
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);

  // 장르 목록 (나중에 서버에서 가져올 예정)
  const GENRES = [
    "문학 / 소설",
    "과학 / 기술",
    "예술 / 대중문화",
    "경제 / 경영",
    "사회 / 정치",
    "역사 / 문화",
    "자기계발",
    "여행 / 취미",
    "건강 / 의학",
    "교육 / 학습"
  ];

  // DropDownPicker에 사용할 item 배열
  const dropdownItems = GENRES.map((g) => ({ label: g, value: g }));

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.push('/main/profile');
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const handleSubmit = () => {
    if (!genre1 || !genre2 || !genre3) {
      Alert.alert('알림', '세 개의 장르를 모두 선택해주세요.');
      return;
    }

    // 중복 장르 선택 방지
    if (new Set([genre1, genre2, genre3]).size < 3) {
      Alert.alert('알림', '중복되지 않은 장르를 선택해주세요.');
      return;
    }

    // TODO: 선택된 장르들을 서버에 저장하는 로직 구현
    console.log('선택된 장르:', [genre1, genre2, genre3]);
    router.push('/main/profile');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader showBack showIcons={false} title="관심 장르 수정" />
      <View style={styles.container}>
        <Text style={styles.subtitle}>관심 있는 장르를 선택해주세요</Text>
        
        {/* 드롭다운 1 */}
        <DropDownPicker
          open={open1}
          value={genre1}
          items={dropdownItems}
          setOpen={setOpen1}
          setValue={setGenre1}
          placeholder="장르 선택"
          style={styles.dropdown}
          zIndex={3000}
          zIndexInverse={1000}
        />
        
        {/* 드롭다운 2 */}
        <DropDownPicker
          open={open2}
          value={genre2}
          items={dropdownItems}
          setOpen={setOpen2}
          setValue={setGenre2}
          placeholder="장르 선택"
          style={styles.dropdown}
          zIndex={2000}
          zIndexInverse={2000}
        />
        
        {/* 드롭다운 3 */}
        <DropDownPicker
          open={open3}
          value={genre3}
          items={dropdownItems}
          setOpen={setOpen3}
          setValue={setGenre3}
          placeholder="장르 선택"
          style={styles.dropdown}
          zIndex={1000}
          zIndexInverse={3000}
        />
        
        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>수정 완료</Text>
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
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  dropdown: {
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderColor: "#6B4B39",
  },
  submitButton: {
    backgroundColor: "#6B4B39",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
}); 