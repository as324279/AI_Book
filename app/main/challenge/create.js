import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import CustomHeader from '../../../components/CustomHeader';

export default function CreateChallengeScreen() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState('초급');
  const [objective, setObjective] = useState('');
  const [duration, setDuration] = useState(4);

  const levels = ['초급', '중급', '고급'];

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.push('/main/challenge');
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const handleCreate = () => {
    if (!objective.trim()) {
      Alert.alert('알림', '목표를 입력해주세요.');
      return;
    }
    // TODO: 챌린지 생성 로직 구현
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader showBack title="새로운 챌린지" showIcons={false} />
      
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>🔥 초급 난이도</Text>
        
        <View style={styles.levelContainer}>
          {levels.map((level) => (
            <Pressable
              key={level}
              style={[
                styles.levelButton,
                selectedLevel === level && styles.levelButtonActive
              ]}
              onPress={() => setSelectedLevel(level)}
            >
              <Text style={[
                styles.levelText,
                selectedLevel === level && styles.levelTextActive
              ]}>
                {level} 난이도
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>📚 목표 책 수</Text>
          <TextInput
            style={styles.input}
            placeholder="목표를 입력하세요"
            value={objective}
            onChangeText={setObjective}
          />
        </View>

        <View style={styles.durationSection}>
          <Text style={styles.label}>⏰ 진행 기간</Text>
          <View style={styles.durationContainer}>
            <Text style={styles.durationText}>2주동안 책 1~2권 읽기</Text>
          </View>
        </View>

        <Pressable style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>챌린지 시작하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FEF6F0',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  levelContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  levelButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    backgroundColor: '#FFF',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D1B8',
  },
  levelButtonActive: {
    backgroundColor: '#6B4B39',
    borderColor: '#6B4B39',
  },
  levelText: {
    color: '#6B4B39',
    fontWeight: 'bold',
  },
  levelTextActive: {
    color: '#FFF',
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5D1B8',
  },
  durationSection: {
    marginBottom: 24,
  },
  durationContainer: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5D1B8',
  },
  durationText: {
    color: '#333',
  },
  createButton: {
    backgroundColor: '#6B4B39',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 