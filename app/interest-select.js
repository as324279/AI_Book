import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
// import { firestore } from '../firebase';
// import { doc, setDoc } from 'firebase/firestore';

const GENRES = [
  '문학 / 소설',
  '인문 / 사회',
  '역사 / 종교',
  '과학 / 기술',
  '경제 / 경영',
  '생활 / 취미',
  '예술 / 대중문화',
  '외국어 / 교육',
  '자기 계발',
];

export default function InterestSelectScreen() {
  const router = useRouter(); // 화면 이동에 사용
  const { email } = useLocalSearchParams(); // 회원가입 화면에서 전달받은 email

  // 각 드롭다운의 선택값을 저장
  const [genre1, setGenre1] = useState(null);
  const [genre2, setGenre2] = useState(null);
  const [genre3, setGenre3] = useState(null);

  // 드롭다운 열림 상태 제어
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);

  // DropDownPicker에 사용할 item 배열
  const dropdownItems = GENRES.map((g) => ({ label: g, value: g }));

  // 확인 버튼을 눌렀을 때 호출되는 함수
  const handleSubmit = async () => {
    if (!genre1 || !genre2 || !genre3) {
      Alert.alert('세 개의 장르를 모두 선택해주세요.');
      return;
    }

    // 중복 장르 선택 방지
    // new로 Set 객체를 생성하여 중복을 제거함 (예: [1, 1, 2] → Set {1, 2})
    if (new Set([genre1, genre2, genre3]).size < 3) {
      Alert.alert('중복되지 않은 장르를 선택해주세요.');
      return;
    }

    try {
      // Firestore 저장
      /*
      const docRef = doc(firestore, 'interests', email);
      await setDoc(docRef, {
        email,
        genres: [genre1, genre2, genre3],
      });
      */

      Alert.alert('관심 장르가 선택되었습니다!');
      router.replace('/'); // 시작 화면으로 이동
    } catch (error) {
      console.error('Firestore 저장 오류:', error);
      Alert.alert('저장 실패', '다시 시도해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>관심 있는 장르를 선택하세요!</Text>

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

      {/* 회원가입 완료 버튼 */}
      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>회원가입</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF6F0',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  dropdown: {
    marginBottom: 20,
    backgroundColor: '#FFF1DE',
    borderColor: '#C4A484',
  },
  button: {
    backgroundColor: '#6B4B39',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
