import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import CustomHeader from '../../../components/CustomHeader';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function ChallengeScreen() {
  const router = useRouter();

  // 임시 챌린지 데이터
  const currentChallenge = {
    title: '4월 독서 챌린지',
    progress: 60,
    daysLeft: '20일 남음',
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title="챌린지" showIcons={true} />
      
      <ScrollView style={styles.container}>
        {/* 현재 진행 중인 챌린지 카드 */}
        <Pressable 
          style={styles.challengeCard}
          onPress={() => router.push('/main/challenge/detail')}
        >
          <Text style={styles.challengeTitle}>{currentChallenge.title}</Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${currentChallenge.progress}%` }]} />
            <Text style={styles.progressText}>{currentChallenge.progress}%</Text>
          </View>
          <Text style={styles.daysLeft}>{currentChallenge.daysLeft}</Text>
          <Pressable 
            style={styles.detailButton}
            onPress={() => router.push('/main/challenge/detail')}
          >
            <Text style={styles.detailButtonText}>챌린지 상세보기</Text>
          </Pressable>
        </Pressable>

        {/* 새로운 챌린지 생성 버튼 */}
        <Pressable 
          style={styles.newChallengeButton}
          onPress={() => router.push('/main/challenge/create')}
        >
          <MaterialIcons name="add-circle" size={24} color="#6B4B39" />
          <Text style={styles.newChallengeText}>새로운 챌린지 생성</Text>
        </Pressable>
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
  challengeCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  progressContainer: {
    height: 20,
    backgroundColor: '#E5E5E5',
    borderRadius: 10,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#6B4B39',
    borderRadius: 10,
  },
  progressText: {
    position: 'absolute',
    right: 8,
    top: 2,
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  daysLeft: {
    color: '#666',
    marginBottom: 16,
  },
  detailButton: {
    backgroundColor: '#FFF1DE',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#6B4B39',
    fontWeight: 'bold',
  },
  newChallengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#6B4B39',
  },
  newChallengeText: {
    marginLeft: 8,
    color: '#6B4B39',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 