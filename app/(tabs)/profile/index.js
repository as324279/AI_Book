import { useRouter } from 'expo-router';
import { getAuth, signOut } from "firebase/auth";
import { getDatabase, onValue, ref } from "firebase/database";
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/CustomHeader';
import app from "../../../firebase/firebase.client";

const ProfileScreen = () => {
  const router = useRouter();
  const [nickname, setNickname] = useState('Loading...');

  // [기능] 닉네임 실시간 불러오기
  useEffect(() => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (user) {
      const db = getDatabase(app);
      const userRef = ref(db, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        setNickname(data?.nickname || data?.username || '닉네임 없음');
      }, { onlyOnce: true });
    } else {
      setNickname('로그인 필요');
    }
  }, []);

  // [기능] 로그아웃
  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '예',
          style: 'destructive',
          onPress: async () => {
            try {
              const auth = getAuth(app);
              await signOut(auth);
              Alert.alert('로그아웃 되었습니다.');
              router.replace('/(auth)/login'); // 질문 코드 스타일로 경로 통일
            } catch (err) {
              Alert.alert('오류', '로그아웃에 실패했습니다.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader showIcons={false} title="계정" />
      <View style={styles.container}>
        {/* 닉네임 표시 */}
        <Text style={styles.nickname}>닉네임: {nickname}</Text>

        {/* 관심 장르 관리 버튼 */}
        <Pressable
          style={styles.button}
          onPress={() => router.push('../../(screen)/profile/Genre-edit')}
        >
          <Text style={styles.buttonText}>관심 장르 관리</Text>
        </Pressable>

        {/* 내 정보 수정 */}
        <Pressable
          style={styles.button}
          onPress={() => router.push('../../(screen)/profile/Pw-check')}
        >
          <Text style={styles.buttonText}>내 정보 수정</Text>
        </Pressable>

        {/* 내 서재 이동 */}
        <Pressable
          style={styles.button}
          onPress={() => router.push('../../(screen)/profile/Library')}
        >
          <Text style={styles.buttonText}>내 서재</Text>
        </Pressable>

        {/* 추천 도서 목록 */}
        <Pressable
          style={styles.button}
          onPress={() => router.push('../../(screen)/profile/Recommend')}
        >
          <Text style={styles.buttonText}>추천 도서 목록</Text>
        </Pressable>

        {/* 로그아웃 버튼 */}
        <Pressable
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>로그아웃</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FEF6F0',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  nickname: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#6B4B39',
  },
  button: {
    backgroundColor: '#FFF1DE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#6B4B39',
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#6B4B39',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#6B4B39',
  },
});
