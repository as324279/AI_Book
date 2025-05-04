import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, BackHandler, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../../components/CustomHeader";
import { useRouter, useLocalSearchParams } from "expo-router";
import DropDownPicker from 'react-native-dropdown-picker';
import { getDatabase, ref, onValue, update } from "firebase/database";
import app from "../../../firebase/firebase.client";
import { getAuth } from "firebase/auth";

const InterestEditScreen = ()=> {
  const router = useRouter();
  const { uid } = useLocalSearchParams();
  // const auth = getAuth(app);
  
  // 현재 사용자 uid 가져오기
  const [currentUid, setCurrentUid] = useState(uid || auth.currentUser?.uid);
  const [loading, setLoading] = useState(true);

  // 드롭다운 상태 관리
  const [genre1, setGenre1] = useState(null);
  const [genre2, setGenre2] = useState(null);
  const [genre3, setGenre3] = useState(null);
  // 드롭다운 열림 상태 제어
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);

  const GENRES = [
    "문학 / 소설",
    "인문 / 사회",
    "역사 / 종교",
    "과학 / 기술",
    "경제 / 경영",
    "생활 / 취미",
    "예술 / 대중문화",
    "외국어 / 교육",
    "자기 계발",
  ];

  // DropDownPicker에 사용할 item 배열
  const getFilteredItems = (exclude1, exclude2) =>
    GENRES
      .filter(g => g !== exclude1 && g !== exclude2)
      .map(g => ({ label: g, value: g }));

  // Firebase에서 현재 장르 불러오기
  useEffect(() => {
    if (!currentUid) {
      setLoading(false);
      return;
    }
    
    const db = getDatabase(app);
    const genreRef = ref(db, `users/${currentUid}/genres`);
    const unsubscribe = onValue(genreRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const genres = Array.isArray(data) ? data : Object.values(data);
        
        if (genres.length >= 3) {
          setGenre1(genres[0]);
          setGenre2(genres[1]);
          setGenre3(genres[2]);
        }
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [currentUid]);


  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.push('../../(screen)/profile');
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const handleSubmit = async () => {
    if (!genre1 || !genre2 || !genre3) {
      Alert.alert('알림', '세 개의 장르를 모두 선택해주세요.');
      return;
    }

    // 중복 장르 선택 방지
    if (new Set([genre1, genre2, genre3]).size < 3) {
      Alert.alert('알림', '중복되지 않은 장르를 선택해주세요.');
      return;
    }

    try {
      const db = getDatabase(app);
      await update(ref(db, `users/${currentUid}`), { genres: [genre1, genre2, genre3] });
      Alert.alert('알림', '관심 장르가 업데이트되었습니다!');
      router.push('../../(screen)/profile/Genre-edit');
    } catch (error) {
      Alert.alert('오류', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader showBack title="관심 장르 수정" />
      <View style={styles.container}>
        <Text style={styles.subtitle}>관심 있는 장르를 선택해주세요</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#6B4B39" style={{marginVertical: 20}} />
        ) : (
          <>
            {/* 드롭다운 1 */}
            <DropDownPicker
              open={open1}
              value={genre1}
              items={getFilteredItems(genre2, genre3)}
              setOpen={setOpen1}
              setValue={(callback) => {
                const newValue = callback(genre1);
                setGenre1(newValue);
              }}
              onOpen={() => {
                setOpen2(false);
                setOpen3(false);
              }}
              placeholder="장르 1"
              style={styles.dropdown}
              zIndex={3000}
            />
            
            {/* 드롭다운 2 */}
            <DropDownPicker
              open={open2}
              value={genre2}
              items={getFilteredItems(genre1, genre3)}
              setOpen={setOpen2}
              setValue={(callback) => {
                const newValue = callback(genre2);
                setGenre2(newValue);
              }}
              onOpen={() => {
                setOpen1(false);
                setOpen3(false);
              }}
              placeholder="장르 2"
              style={styles.dropdown}
              zIndex={2000}
            />
            
            {/* 드롭다운 3 */}
            <DropDownPicker
              open={open3}
              value={genre3}
              items={getFilteredItems(genre1, genre2)}
              setOpen={setOpen3}
              setValue={(callback) => {
                const newValue = callback(genre3);
                setGenre3(newValue);
              }}
              onOpen={() => {
                setOpen1(false);
                setOpen2(false);
              }}
              placeholder="장르 3"
              style={styles.dropdown}
              zIndex={1000}
            />
            
            <Pressable style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>수정 완료</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
export default InterestEditScreen;

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