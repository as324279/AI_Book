// src/screens/InterestSelectScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';

const GENRES = [
  '문학/소설', '인문/사회', '역사/종교', '과학/기술',
  '경제/경영', '생활/취미', '예술/대중문화', '외국어/교육', '자기 계발'
];

export default function InterestSelectScreen({ route, navigation }) {
  const [selectedGenres, setSelectedGenres] = useState([]);

//   const { email, password } = route.params;

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      if (selectedGenres.length >= 3) {
        Alert.alert('최대 3개까지 선택할 수 있어요.');
        return;
      }
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSignup = () => {
    if (selectedGenres.length === 0) {
      return Alert.alert('관심 장르를 1개 이상 선택해주세요.');
    }

    // 백엔드로 회원가입 요청 보내기 가능
    Alert.alert('회원가입 완료!');
    navigation.navigate('Start');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>관심 있는 장르를 선택하세요!</Text>
      <ScrollView contentContainerStyle={styles.scroll}>
        {GENRES.map((genre) => (
          <Pressable
            key={genre}
            onPress={() => toggleGenre(genre)}
            style={[
              styles.checkbox,
              selectedGenres.includes(genre) && styles.checkboxSelected,
            ]}
          >
            <Text style={styles.checkboxText}>{genre}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>회원가입</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF6F0', padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  scroll: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  checkbox: {
    backgroundColor: '#FFF1DE',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    margin: 6,
  },
  checkboxSelected: {
    backgroundColor: '#6B4B39',
  },
  checkboxText: {
    color: '#1D1D1D',
    fontWeight: 'bold',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#6B4B39',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
