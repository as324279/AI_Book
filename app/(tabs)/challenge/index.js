import { useRouter } from 'expo-router';
import { getAuth } from "firebase/auth";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomHeader from '../../../components/CustomHeader';
import app from "../../../firebase/firebase.client";

// 남은 기간 계산 함수
function getDaysLeft(challenge) {
  if (!challenge || !challenge.createdAt) return null;
  const startDate = new Date(new Date(challenge.createdAt).getTime() + 9 * 60 * 60 * 1000); // KST
  const totalDays = challenge.targetPeriodDays || 30;
  const now = new Date(new Date().getTime() + 9 * 60 * 60 * 1000); // KST
  const endDate = new Date(startDate.getTime() + totalDays * 24 * 60 * 60 * 1000);
  return Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
}

const ChallengeScreen = ()=> {
  const router = useRouter();
  const [currentChallenge, setCurrentChallenge] = useState(null);

  useEffect(() => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (!user) return;
    const db = getDatabase(app);
    const challengesRef = ref(db, `users/${user.uid}/challenges`);
    onValue(challengesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const active = Object.entries(data)
          .map(([id, c]) => ({ ...c, id }))
          .filter(c => (c.progress || 0) < 1)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCurrentChallenge(active.length > 0 ? active[0] : null);
      } else {
        setCurrentChallenge(null);
      }
    });
  }, []);

  const progressPercent = currentChallenge
    ? Math.round(
        Math.min(
          (currentChallenge.books ? Object.keys(currentChallenge.books).length : 0) /
            (currentChallenge.targetBooks || 10),
          1
        ) * 100
      )
    : 0;

  const daysLeft = getDaysLeft(currentChallenge);

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title="챌린지" />
      <ScrollView style={styles.container}>
        {/* 현재 진행 중인 챌린지 카드 */}
        <View style={styles.challengeCard}>
          <Text style={styles.challengeTitle}>
            {currentChallenge ? (currentChallenge.level || '챌린지') + ' 독서 챌린지' : '현재 진행중인 챌린지'}
          </Text>
          <View style={styles.progressBarBackground}>
            <View style={[
              styles.progressBarFill,
              { width: `${progressPercent}%`, backgroundColor: currentChallenge ? "#6B4B39" : "#E5E5E5" }
            ]}/>
            <Text style={[
              styles.progressBarText,
              { color: currentChallenge ? "#FFF" : "#BCA177" }
            ]}>
              {progressPercent}%
            </Text>
          </View>
          <Text style={styles.daysLeft}>
            {currentChallenge
              ? (daysLeft !== null ? `${daysLeft}일 남음` : '')
              : '진행중인 챌린지가 없습니다.'}
          </Text>
          <Pressable
            style={styles.detailButton}
            onPress={() => router.push('../../(screen)/challenge/Detail')}
          >
            <Text style={styles.detailButtonText}>챌린지 상세보기</Text>
          </Pressable>
        </View>
        {/* 새로운 챌린지 생성 버튼 */}
        <Pressable
          style={styles.newChallengeButton}
          onPress={() => router.push('../../(screen)/challenge/Create')}
        >
          <MaterialIcons name="add" size={20} color="#6B4B39" />
          <Text style={styles.newChallengeText}>새로운 챌린지 생성</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChallengeScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FEF6F0" },
  container: { flex: 1, padding: 16 },
  challengeCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 18,
    backgroundColor: "#E5E5E5",
    borderRadius: 9,
    overflow: "hidden",
    marginBottom: 10,
    justifyContent: 'center',
  },
  progressBarFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#6B4B39",
    borderRadius: 9,
    zIndex: 1,
    height: 18,
  },
  progressBarText: {
    position: "absolute",
    right: 16,
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
    zIndex: 2,
  },
  daysLeft: {
    color: "#666",
    marginBottom: 12,
    fontSize: 14,
  },
  detailButton: {
    backgroundColor: "#FFF1DE",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 4,
    borderWidth: 0,
  },
  detailButtonText: {
    color: "#6B4B39",
    fontWeight: "bold",
    fontSize: 16,
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
    marginTop: 24,
  },
  newChallengeText: {
    marginLeft: 8,
    color: '#6B4B39',
    fontSize: 16,
    fontWeight: 'bold',
  },
});