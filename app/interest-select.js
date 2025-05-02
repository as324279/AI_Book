import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
// import { firestore } from '../firebase';
// import { doc, setDoc } from 'firebase/firestore';
import { getDatabase, ref, update } from "firebase/database";
import app from '../firebase/firebase';


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
  const router = useRouter();
  const { uid } = useLocalSearchParams();

  const [genre1, setGenre1] = useState(null);
  const [genre2, setGenre2] = useState(null);
  const [genre3, setGenre3] = useState(null);

  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);

  // 드롭다운 아이템 동적 생성 (선택된 장르 제외)
  const getFilteredItems = (exclude1, exclude2) => 
    GENRES
      .filter(g => g !== exclude1 && g !== exclude2)
      .map(g => ({ label: g, value: g }));

  const handleSubmit = async () => {
    if (!genre1 || !genre2 || !genre3) {
      Alert.alert('세 개의 장르를 모두 선택해주세요.');
      return;
    }
    if (new Set([genre1, genre2, genre3]).size < 3) {
      Alert.alert('중복되지 않은 장르를 선택해주세요.');
      return;
    }

    try {
      const db = getDatabase(app);
      await update(ref(db, `users/${uid}`), { genres: [genre1, genre2, genre3] });
      Alert.alert('관심 장르가 선택되었습니다!');
      router.replace('/');
    } catch (error) {
      Alert.alert('저장 실패', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>관심 있는 장르를 선택하세요!</Text>
      {/* 장르 1 (다른 드롭다운에서 선택된 값 제외) */}
      <DropDownPicker
        open={open1}
        value={genre1}
        items={getFilteredItems(genre2, genre3)}
        setOpen={setOpen1}
        setValue={(callback) => {
          const newValue = callback(genre1);
          setGenre1(newValue === genre1 ? null : newValue); // 아이템 재클릭 시 해제
        }}
        placeholder="장르 1"
        style={styles.dropdown}
        zIndex={3000}
      />

      {/* 장르 2 (다른 드롭다운에서 선택된 값 제외) */}
      <DropDownPicker
        open={open2}
        value={genre2}
        items={getFilteredItems(genre1, genre3)}
        setOpen={setOpen2}
        setValue={(callback) => {
          const newValue = callback(genre2);
          setGenre2(newValue === genre2 ? null : newValue);
        }}
        placeholder="장르 2"
        style={styles.dropdown}
        zIndex={2000}
      />

      {/* 장르 3 (다른 드롭다운에서 선택된 값 제외) */}
      <DropDownPicker
        open={open3}
        value={genre3}
        items={getFilteredItems(genre1, genre2)}
        setOpen={setOpen3}
        setValue={(callback) => {
          const newValue = callback(genre3);
          setGenre3(newValue === genre3 ? null : newValue);
        }}
        placeholder="장르 3"
        style={styles.dropdown}
        zIndex={1000}
      />

      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>완료</Text>
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