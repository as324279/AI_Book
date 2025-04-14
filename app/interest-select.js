import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// 장르 배열
const GENRES = [
  '문학/소설', '인문/사회', '역사/종교', '과학/기술',
  '경제/경영', '생활/취미', '예술/대중문화', '외국어/교육', '자기 계발'
];

export default function InterestSelectScreen() {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const router = useRouter();
  const { email, password } = useLocalSearchParams();

  // 장르 선택/해제를 처리하는 함수
  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      // 이미 선택된 장르라면 선택 해제
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      // 새로운 장르 선택 시 최대 3개까지만 선택 가능하도록 제한
      if (selectedGenres.length >= 3) {
        Alert.alert('최대 3개까지 선택할 수 있어요.');
        return;
      }
      // 새로운 장르를 선택된 목록에 추가
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  // 회원가입 완료 처리 함수
  const handleSignup = () => {
    // 최소 1개 이상의 장르가 선택되었는지 확인
    if (selectedGenres.length === 0) {
      return Alert.alert('관심 장르를 1개 이상 선택해주세요.');
    }

    // 회원가입 완료 후 시작 화면으로 이동
    Alert.alert('회원가입 완료!');
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 뒤로가기 버튼 */}
      <Pressable 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </Pressable>

      {/* 화면 제목 */}
      <Text style={styles.title}>관심 있는 장르를 선택하세요!</Text>

      {/* 장르 선택 영역 - 스크롤 가능한 영역 */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 장르 목록을 매핑하여 선택 버튼으로 표시 */}
        {GENRES.map((genre) => (
          <Pressable
            key={genre}
            onPress={() => toggleGenre(genre)}
            style={[
              styles.checkbox,
              // 선택된 장르는 다른 스타일 적용
              selectedGenres.includes(genre) && styles.checkboxSelected,
            ]}
          >
            <Text style={styles.checkboxText}>{genre}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* 회원가입 완료 버튼 */}
      <Pressable style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>회원가입</Text>
      </Pressable>
    </SafeAreaView>
  );
}

// 스타일 정의
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FEF6F0',  // 베이지색 배경
    padding: 20 
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 16, 
    textAlign: 'center' 
  },
  scroll: { 
    flexDirection: 'row',  // 가로 방향으로 아이템 배치
    flexWrap: 'wrap',      // 여러 줄에 걸쳐 표시
    justifyContent: 'center' 
  },
  checkbox: {
    backgroundColor: '#FFF1DE',  // 미선택 상태 배경색
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    margin: 6,
  },
  checkboxSelected: {
    backgroundColor: '#6B4B39',  // 선택 상태 배경색 (브라운)
  },
  checkboxText: {
    color: '#1D1D1D',
    fontWeight: 'bold',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#6B4B39',  // 브라운 계열 버튼
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  backButton: {
    position: 'absolute',  // 절대 위치로 좌상단에 배치
    top: 10,
    left: 10,
    padding: 10,
  },
  backButtonText: {
    fontSize: 32,
    color: '#6B4B39',
    fontWeight: 'bold',
  },
}); 