import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/CustomHeader';

import { getAuth } from "firebase/auth";
import { getDatabase, push, ref, set } from "firebase/database";
import app from "../../../firebase/firebase.client";

// 목표 기간(일)과 권 수 파싱 함수 (다양한 표현 지원)
function parseTargetInfo(resultText) {
  let targetBooks = 10, targetPeriodDays = 30;

  let weekMatch = resultText.match(/(\d+)\s*주\s*동안\s*(\d+)(?:~(\d+))?\s*권/);
  if (weekMatch) {
    targetPeriodDays = parseInt(weekMatch[1]) * 7;
    targetBooks = weekMatch[3] ? parseInt(weekMatch[3]) : parseInt(weekMatch[2]);
    return { targetBooks, targetPeriodDays };
  }

  let monthMatch = resultText.match(/(\d+)\s*달\s*동안\s*(\d+)(?:~(\d+))?\s*권/);
  if (monthMatch) {
    targetPeriodDays = parseInt(monthMatch[1]) * 30;
    targetBooks = monthMatch[3] ? parseInt(monthMatch[3]) : parseInt(monthMatch[2]);
    return { targetBooks, targetPeriodDays };
  }

  let hanMonthMatch = resultText.match(/한\s*달\s*동안\s*(\d+)(?:~(\d+))?\s*권/);
  if (hanMonthMatch) {
    targetPeriodDays = 30;
    targetBooks = hanMonthMatch[2] ? parseInt(hanMonthMatch[2]) : parseInt(hanMonthMatch[1]);
    return { targetBooks, targetPeriodDays };
  }

  let thisWeekMatch = resultText.match(/이번\s*주\s*동안\s*(\d+)(?:~(\d+))?\s*권/);
  if (thisWeekMatch) {
    targetPeriodDays = 7;
    targetBooks = thisWeekMatch[2] ? parseInt(thisWeekMatch[2]) : parseInt(thisWeekMatch[1]);
    return { targetBooks, targetPeriodDays };
  }

  let thisMonthMatch = resultText.match(/이번\s*달\s*동안\s*(\d+)(?:~(\d+))?\s*권/);
  if (thisMonthMatch) {
    targetPeriodDays = 30;
    targetBooks = thisMonthMatch[2] ? parseInt(thisMonthMatch[2]) : parseInt(thisMonthMatch[1]);
    return { targetBooks, targetPeriodDays };
  }

  let weekRangeMatch = resultText.match(/(\d+)\s*주\s*동안\s*(\d+)\s*~\s*(\d+)\s*권/);
  if (weekRangeMatch) {
    targetPeriodDays = parseInt(weekRangeMatch[1]) * 7;
    targetBooks = parseInt(weekRangeMatch[3]);
    return { targetBooks, targetPeriodDays };
  }

  let weekPeriodRangeMatch = resultText.match(/(\d+)\s*~\s*(\d+)\s*주\s*동안\s*(\d+)\s*권/);
  if (weekPeriodRangeMatch) {
    targetPeriodDays = parseInt(weekPeriodRangeMatch[2]) * 7;
    targetBooks = parseInt(weekPeriodRangeMatch[3]);
    return { targetBooks, targetPeriodDays };
  }

  let weekShortMatch = resultText.match(/(\d+)\s*주\s*간\s*(\d+)(?:~(\d+))?\s*권/);
  if (weekShortMatch) {
    targetPeriodDays = parseInt(weekShortMatch[1]) * 7;
    targetBooks = weekShortMatch[3] ? parseInt(weekShortMatch[3]) : parseInt(weekShortMatch[2]);
    return { targetBooks, targetPeriodDays };
  }

  return { targetBooks, targetPeriodDays };
}

const CreateChallengeScreen = () => {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState('초급');
  const [challengeResult, setChallengeResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewChallenge, setPreviewChallenge] = useState('');
  const level = ['초급', '중급', '고급'];

  // 뒤로가기: 항상 challenge 탭으로 이동
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.push('/(tabs)/challenge');
      return true;
    });
    return () => backHandler.remove();
  }, [router]);

  // 난이도 변경 시 미리보기
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
      setPreviewChallenge('서버 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    getPreviewChallenge(selectedLevel);
  }, [selectedLevel]);

  // 챌린지 생성 및 파이어베이스 저장
  const generateChallenge = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://211.108.99.224:5000/generate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: selectedLevel }),
      });
      const data = await response.json();
      setChallengeResult(data.result);

      // 목표 파싱
      const { targetBooks, targetPeriodDays } = parseTargetInfo(data.result);

      // 파이어베이스에 챌린지 저장
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        setChallengeResult('로그인이 필요합니다.');
        return;
      }
      const db = getDatabase(app);
      const challengesRef = ref(db, `users/${user.uid}/challenges`);
      const newChallengeRef = push(challengesRef);
      const newId = newChallengeRef.key;
      const now = new Date().toISOString();

      await set(newChallengeRef, {
        level: selectedLevel,
        result: data.result,
        targetBooks,
        targetPeriodDays,
        createdAt: now,
        progress: 0
      });

      setLoading(false);

      // Challenge 화면으로 이동 (파라미터 전달)
      router.push({
        pathname: '../challenge/Challenge',
        params: {
          level: selectedLevel,
          result: encodeURIComponent(data.result),
          challengeId: newId,
          targetBooks: targetBooks,
          targetPeriodDays: targetPeriodDays
        },
      });
    } catch (error) {
      setLoading(false);
      setChallengeResult('서버 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader showBack title="새로운 챌린지" showIcons={false} />
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>🔥 {selectedLevel} 난이도</Text>
        <View style={styles.levelContainer}>
          {level.map((lv) => (
            <Pressable
              key={lv}
              style={[
                styles.levelButton,
                selectedLevel === lv && styles.levelButtonActive
              ]}
              onPress={() => setSelectedLevel(lv)}
            >
              <Text style={[
                styles.levelText,
                selectedLevel === lv && styles.levelTextActive
              ]}>
                {lv} 난이도
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
        <Pressable style={styles.createButton} onPress={generateChallenge} disabled={loading}>
          <Text style={styles.createButtonText}>
            {loading ? '생성 중...' : '챌린지 시작하기'}
          </Text>
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
