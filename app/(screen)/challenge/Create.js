import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Pressable, StyleSheet, Text, View, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/CustomHeader';

const CreateChallengeScreen = ()=> {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState('초급');
  const [objective, setObjective] = useState('');
  const [duration, setDuration] = useState(4);
  const [challengeResult, setChallengeResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewChallenge, setPreviewChallenge] = useState('');

  const level = ['초급', '중급', '고급'];

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.push('/(tabs)/challenge');
      return true;
    });

    return () => backHandler.remove();
  }, [router]);

  const getPreviewChallenge = async (level) => {
    try {
      setLoading(true);
      const response = await fetch('http://192.168.0.16:5000/generate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      });

      const data = await response.json();
      setPreviewChallenge(data.result);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error:', error);
      setPreviewChallenge('서버 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    getPreviewChallenge(selectedLevel);
  }, [selectedLevel]);

  const generateChallenge = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://192.168.0.16:5000/generate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: selectedLevel }),
      });

  
      const data = await response.json();
      setChallengeResult(data.result);
      setLoading(false);
      console.log(selectedLevel, data.result);
      router.push({
        pathname:'../challenge/Challenge',
        params:{
        level:selectedLevel,
        result: encodeURIComponent(data.result), 
        },
      })
    } catch (error) {
      setLoading(false);
      console.error('Error:', error);
      setChallengeResult('서버 오류가 발생했습니다.');
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader showBack title="새로운 챌린지" showIcons={false} />
      
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>🔥 {selectedLevel} 난이도</Text>
        
        <View style={styles.levelContainer}>
          {level.map((level) => (
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

        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>챌린지 미리보기</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#6B4B39" />
          ) : (
            <Text style={styles.previewText}>{previewChallenge}</Text>
          )}
        </View>

        <Pressable style={styles.createButton} onPress={generateChallenge}>
          <Text style={styles.createButtonText}>챌린지 시작하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};
export default CreateChallengeScreen;

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
  previewContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 100,
    borderWidth: 1,
    borderColor: '#E5D1B8',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
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