import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/CustomHeader';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ProgressChart } from 'react-native-chart-kit';
import { useRouter } from "expo-router";

const screenWidth = Dimensions.get('window').width;

export default function ChallengeDetailScreen() {
    const router = useRouter();
  const challengeDetails = {
    title: '초급 난이도',
    completedTasks: [
      { id: 1, text: '지정대로를 읽고 보고 싶은 작식', completed: true, progress: 0.8 },
      { id: 2, text: '읽고 보면 재미있는 경제 지식', completed: false, progress: 0.3 },
    ],
    progress: 0.55, // react-native-chart-kit은 0~1 값 사용
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.push('/main/challenge');
      return true;
    });

    return () => backHandler.remove();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader showBack title={challengeDetails.title} showIcons={false} />
      
      <ScrollView style={styles.container}>
        {/* 원형 진행률 차트 */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>전체 진행률</Text>
          <ProgressChart
            data={{
              labels: ['챌린지'], // optional
              data: [challengeDetails.progress],
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
            {(challengeDetails.progress * 100).toFixed(0)}%
          </Text>
        </View>

        {/* 할 일 목록 */}
        <View style={styles.tasksSection}>
          {challengeDetails.completedTasks.map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <View style={styles.taskHeader}>
                <MaterialIcons 
                  name={task.completed ? "check-circle" : "radio-button-unchecked"} 
                  size={24} 
                  color={task.completed ? "#6B4B39" : "#999"}
                />
                <Text style={[
                  styles.taskText,
                  task.completed && styles.taskTextCompleted
                ]}>
                  {task.text}
                </Text>
              </View>
              
              {/* 작업별 진행률 */}
              <View style={styles.taskProgressContainer}>
                <View style={styles.taskProgressBar}>
                  <View 
                    style={[
                      styles.taskProgressFill, 
                      { width: `${task.progress * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.taskProgressText}>
                  {(task.progress * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
    backgroundColor: '#6B4B39',
    borderRadius: 4,
  },
  taskProgressText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#6B4B39',
    fontWeight: 'bold',
  },
});
