import { useRouter } from "expo-router";
import { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomHeader from '../../../components/CustomHeader';

import { getAuth } from "firebase/auth";
import { getDatabase, onValue, ref } from "firebase/database";
import app from "../../../firebase/firebase.client";

const screenWidth = Dimensions.get('window').width;

const ChallengeDetailScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState({});

  // 파이어베이스에서 챌린지 데이터 불러오기
  useEffect(() => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (user) {
      const db = getDatabase(app);
      const challengesRef = ref(db, `users/${user.uid}/challenges`);
      onValue(challengesRef, (snapshot) => {
        const data = snapshot.val();
        const challengeData = {};
        if (data) {
          Object.entries(data).forEach(([id, challenge]) => {
            const level = challenge.level || '기타';
            if (!challengeData[level]) challengeData[level] = [];
            const books = challenge.books || {};
            const recordedBooks = Object.keys(books).length;
            const targetBooks = challenge.targetBooks || 1;
            const targetPeriodDays = challenge.targetPeriodDays || 30;
            const createdAt = challenge.createdAt || new Date().toISOString();
            const elapsedDays = Math.min(
              Math.ceil((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24)),
              targetPeriodDays
            );
            const isCompleted = challenge.progress >= 1 || recordedBooks >= targetBooks;
            const progress = Math.min((recordedBooks / targetBooks), 1);
            challengeData[level].push({
              id,
              title: challenge.result?.substring(0, 30) + "..." || '챌린지',
              result: challenge.result || '',
              createdAt,
              books,
              recordedBooks,
              targetBooks,
              targetPeriodDays,
              elapsedDays,
              isCompleted,
              progress,
              level
            });
          });
        }
        setChallenges(challengeData);
        setLoading(false);
      });
    } else {
      setChallenges({});
      setLoading(false);
    }
  }, []);

  // 뒤로가기: 항상 challenge 탭으로 이동
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.push('/(tabs)/challenge');
      return true;
    });
    return () => backHandler.remove();
  }, [router]);

  // 전체 진행률 계산 (진행중 챌린지만)
  const calculateTotalProgress = () => {
    let active = [];
    Object.values(challenges).forEach(list => {
      active = active.concat(list.filter(c => !c.isCompleted));
    });
    if (active.length === 0) return 0;
    const sum = active.reduce((acc, challenge) => acc + challenge.progress, 0);
    return sum / active.length;
  };

  const getLevelColor = (level, isCompleted) => {
    const colorMap = {
      '초급': '#6B4B39',
      '중급': '#3949AB',
      '고급': '#D32F2F'
    };
    if (isCompleted) return '#BCA177';
    return colorMap[level] || '#6B4B39';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <CustomHeader showBack title="챌린지 상세" showIcons={false} />
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#6B4B39" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader showBack title="챌린지 상세" showIcons={false} />
      <ScrollView style={styles.container}>
        {/* 전체 진행률 */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>전체 진행률</Text>
          <ProgressChart
            data={{
              labels: ['챌린지'],
              data: [calculateTotalProgress()],
            }}
            width={screenWidth - 32}
            height={180}
            strokeWidth={16}
            radius={36}
            chartConfig={{
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              color: (opacity = 1) => `rgba(107, 75, 57, ${opacity})`,
              labelColor: () => '#6B4B39',
            }}
            hideLegend={true}
          />
          <Text style={styles.chartPercentage}>
            {(calculateTotalProgress() * 100).toFixed(0)}%
          </Text>
        </View>

        {/* 난이도별 챌린지 목록 */}
        {Object.keys(challenges).map((level) => {
          const levelChallenges = challenges[level];
          const activeLevelChallenges = levelChallenges.filter(c => !c.isCompleted);
          const completedLevelChallenges = levelChallenges.filter(c => c.isCompleted);

          return (
            <View key={level} style={styles.tasksSection}>
              {/* 진행 중 챌린지 */}
              {activeLevelChallenges.length > 0 && (
                <>
                  <Text style={styles.levelTitle}>{level} 진행 중인 챌린지</Text>
                  {activeLevelChallenges.map((challenge) => (
                    <Pressable
                      key={challenge.id}
                      style={styles.taskItem}
                      onPress={() =>
                        router.push({
                          pathname: '/challenge/Challenge',
                          params: {
                            level: challenge.level,
                            result: encodeURIComponent(challenge.result),
                            challengeId: challenge.id
                          }
                        })
                      }
                    >
                      <View style={styles.taskHeader}>
                        <MaterialIcons
                          name="radio-button-unchecked"
                          size={24}
                          color={getLevelColor(challenge.level, false)}
                        />
                        <Text style={styles.taskText}>{challenge.title}</Text>
                      </View>
                      <View style={styles.taskProgressContainer}>
                        <View style={styles.taskProgressBar}>
                          <View
                            style={[
                              styles.taskProgressFill,
                              {
                                width: `${challenge.progress * 100}%`,
                                backgroundColor: getLevelColor(challenge.level, false)
                              }
                            ]}
                          />
                        </View>
                        <Text style={[styles.taskProgressText, { color: getLevelColor(challenge.level, false) }]}>
                          {(challenge.progress * 100).toFixed(0)}%
                        </Text>
                      </View>
                      <Text style={styles.bookCount}>
                        기록한 책: {challenge.recordedBooks}/{challenge.targetBooks} | 기간: {challenge.elapsedDays}/{challenge.targetPeriodDays}일
                      </Text>
                    </Pressable>
                  ))}
                </>
              )}
              {/* 완료 챌린지 */}
              {completedLevelChallenges.length > 0 && (
                <>
                  <Text style={styles.levelTitle}>{level} 완료한 챌린지</Text>
                  {completedLevelChallenges.map((challenge) => (
                    <Pressable
                      key={challenge.id}
                      style={styles.taskItem}
                      onPress={() =>
                        router.push({
                          pathname: '/challenge/Challenge',
                          params: {
                            level: challenge.level,
                            result: encodeURIComponent(challenge.result),
                            challengeId: challenge.id
                          }
                        })
                      }
                    >
                      <View style={styles.taskHeader}>
                        <MaterialIcons
                          name="check-circle"
                          size={24}
                          color={getLevelColor(challenge.level, true)}
                        />
                        <Text style={[styles.taskText, styles.taskTextCompleted]}>{challenge.title}</Text>
                      </View>
                      <View style={styles.taskProgressContainer}>
                        <View style={styles.taskProgressBar}>
                          <View
                            style={[
                              styles.taskProgressFill,
                              {
                                width: `100%`,
                                backgroundColor: getLevelColor(challenge.level, true)
                              }
                            ]}
                          />
                        </View>
                        <Text style={[styles.taskProgressText, { color: getLevelColor(challenge.level, true) }]}>
                          100%
                        </Text>
                      </View>
                      <Text style={styles.bookCount}>
                        기록한 책: {challenge.recordedBooks}/{challenge.targetBooks} | 기간: {challenge.elapsedDays}/{challenge.targetPeriodDays}일
                      </Text>
                    </Pressable>
                  ))}
                </>
              )}
            </View>
          );
        })}

        {/* 아무 챌린지도 없을 때 안내 */}
        {Object.keys(challenges).length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="info" size={48} color="#BCA177" />
            <Text style={styles.emptyText}>
              진행 중인 챌린지가 없습니다.{'\n'}새 챌린지를 시작해보세요!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChallengeDetailScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FEF6F0',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  chartContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  chartPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B4B39',
    marginTop: -10,
  },
  tasksSection: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  taskItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  taskTextCompleted: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  taskProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 36,
  },
  taskProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  taskProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  taskProgressText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: 'bold',
  },
  bookCount: {
    marginLeft: 36,
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
});
