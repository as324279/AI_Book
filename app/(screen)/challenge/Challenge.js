import { useLocalSearchParams, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { getDatabase, onValue, push, ref, set, update } from "firebase/database";
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from '../../../components/CustomHeader';
import app from "../../../firebase/firebase.client";

const Challenge = () => {
  const router = useRouter();
  const { level, result, challengeId, targetBooks, targetPeriodDays } = useLocalSearchParams();
  const decodedResult = decodeURIComponent(result || '');

  const [booksGoal, setBooksGoal] = useState(Number(targetBooks) || 10);
  const [periodGoalDays, setPeriodGoalDays] = useState(Number(targetPeriodDays) || 30);
  const [bookTitle, setBookTitle] = useState("");
  const [bookSummary, setBookSummary] = useState("");
  const [books, setBooks] = useState([]);
  const [challengeInfo, setChallengeInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 뒤로가기: 라우터/스타일 코드 방식 유지
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.push('/(tabs)/challenge');
      return true;
    });
    return () => backHandler.remove();
  }, [router]);

  // 챌린지 정보 불러오기
  useEffect(() => {
    if (!challengeId) {
      Alert.alert('오류', '챌린지 정보가 없습니다. 다시 생성해주세요.');
      router.replace('../../(screen)/challenge/Create');
      return;
    }
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (!user) return;

    const db = getDatabase(app);
    const challengeRef = ref(db, `users/${user.uid}/challenges/${challengeId}`);
    const unsubscribe = onValue(challengeRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setLoading(false);
        Alert.alert('오류', '챌린지 정보가 없습니다. 다시 생성해주세요.');
        router.replace('../../(screen)/challenge/Create');
        return;
      }
      setChallengeInfo(data);
      if (Number(data.targetBooks) && Number(data.targetBooks) !== booksGoal) setBooksGoal(Number(data.targetBooks));
      if (Number(data.targetPeriodDays) && Number(data.targetPeriodDays) !== periodGoalDays) setPeriodGoalDays(Number(data.targetPeriodDays));

      if (data.books) {
        const booksArray = Object.entries(data.books).map(([id, book]) => ({
          id,
          ...book
        })).sort((a, b) => (new Date(b.savedAt) - new Date(a.savedAt)));
        setBooks(booksArray);
      } else {
        setBooks([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [challengeId]);

  // 책 저장하기
  const handleSaveBook = async () => {
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('로그인 필요', '로그인 후 이용해주세요.');
        return;
      }
      if (!bookTitle.trim() || !bookSummary.trim()) {
        Alert.alert('입력 오류', '책 제목과 줄거리를 모두 입력해주세요.');
        return;
      }
      const db = getDatabase(app);
      if (challengeId) {
        const booksRef = ref(db, `users/${user.uid}/challenges/${challengeId}/books`);
        const newBookRef = push(booksRef);
        await set(newBookRef, {
          title: bookTitle,
          summary: bookSummary,
          savedAt: new Date().toISOString()
        });

        // 저장 후 진행률 갱신
        const challengeBooksRef = ref(db, `users/${user.uid}/challenges/${challengeId}/books`);
        onValue(challengeBooksRef, async (snapshot) => {
          const booksCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
          const newProgress = Math.min(booksCount / booksGoal, 1);
          const challengeRef = ref(db, `users/${user.uid}/challenges/${challengeId}`);
          await update(challengeRef, { progress: newProgress, targetBooks: booksGoal, targetPeriodDays: periodGoalDays });
        }, { onlyOnce: true });

        Alert.alert('저장 완료', '책 정보가 성공적으로 저장되었습니다!');
        setBookTitle("");
        setBookSummary("");
      }
    } catch (error) {
      Alert.alert('오류 발생', '저장 중 문제가 발생했습니다.');
    }
  };

  // 남은 기간 계산
  function getDaysLeft() {
    if (!challengeInfo || !challengeInfo.createdAt) return 0;
    const totalDays = Number(challengeInfo.targetPeriodDays) || periodGoalDays || 30;
    const startDate = new Date(challengeInfo.createdAt);
    const now = new Date();
    const endDate = new Date(startDate.getTime() + totalDays * 24 * 60 * 60 * 1000);
    return Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
  }

  const progressPercent = Math.round((books.length / booksGoal) * 100);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <CustomHeader showBack title="챌린지 결과" showIcons={false} />
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#6B4B39" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader showBack title="챌린지 결과" showIcons={false} />
      {/* [스크롤뷰 추가] */}
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>{level || challengeInfo?.level || '챌린지'} 난이도</Text>
        <View style={{ marginTop: 30 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>생성된 챌린지:</Text>
          <Text style={styles.resultText}>{decodedResult || challengeInfo?.result || ''}</Text>
          <Text style={styles.labelText}>목표: {booksGoal}권 / {periodGoalDays}일</Text>
          <Text style={styles.labelText}>현재: {books.length}권 기록 / 진행률: {progressPercent}%</Text>
          <Text style={styles.labelText}>남은 기간: {getDaysLeft()}일</Text>
        </View>

        <View style={{ marginTop: 32 }}>
          <Text style={styles.labelText}>새 책 기록하기</Text>
          <TextInput
            style={styles.input}
            placeholder="책 제목"
            value={bookTitle}
            onChangeText={setBookTitle}
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="책 줄거리"
            value={bookSummary}
            onChangeText={setBookSummary}
            multiline
          />
          <Pressable style={styles.saveButton} onPress={handleSaveBook}>
            <Text style={styles.saveButtonText}>책 정보 저장하기</Text>
          </Pressable>
        </View>

        {books.length > 0 && (
          <View style={styles.booksSection}>
            <Text style={styles.booksTitle}>기록한 책 목록</Text>
            {books.map((book) => (
              <View key={book.id} style={styles.bookCard}>
                <View style={styles.bookCardHeader}>
                  <Text style={styles.bookCardTitle}>{book.title}</Text>
                </View>
                <Text style={styles.bookCardSummary}>{book.summary}</Text>
                <View style={styles.bookCardFooter}>
                  <Text style={styles.bookCardDate}>
                    {new Date(book.savedAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      {/* [스크롤뷰 추가 끝] */}
    </SafeAreaView>
  );
};

export default Challenge;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FEF6F0',
  },
  container: {
    flexGrow: 1, // [스크롤뷰를 위한 flexGrow]
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  labelText: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  resultText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
  },
  input: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5D1B8',
    marginBottom: 16,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#6B4B39',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  booksSection: {
    marginBottom: 32
  },
  booksTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#6B4B39'
  },
  bookCard: {
    backgroundColor: '#FFF1DE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#E5D1B8',
  },
  bookCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  bookCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B4B39',
    marginLeft: 8
  },
  bookCardSummary: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    lineHeight: 20
  },
  bookCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  bookCardDate: {
    fontSize: 12,
    color: '#BCA177',
    marginLeft: 4
  }
});
