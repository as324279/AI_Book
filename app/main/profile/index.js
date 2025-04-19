import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/CustomHeader';

export default function ProfileScreen() {
  const router = useRouter();

  // 로그아웃 버튼 눌렀을 때
  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '예',
          style: 'destructive',
          onPress: () => {
            // Firebase Auth 로그아웃 처리 추가
            Alert.alert('로그아웃 되었습니다.');
            router.replace('/'); // 시작화면으로 이동
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
        {/* 닉네임 표시 (추후 Firebase 연동 시 바인딩 예정) */}
        <Text style={styles.nickname}>닉네임: book</Text>

        {/* 관심 장르 관리 버튼 */}
        <Pressable
          style={styles.button}
          onPress={() => router.push('/main/profile/genre-edit')}
        >
          <Text style={styles.buttonText}>관심 장르 관리</Text>
        </Pressable>

        {/* 내 정보 수정 */}
        <Pressable
          style={styles.button}
          onPress={() => router.push('/main/profile/edit-info')}
        >
          <Text style={styles.buttonText}>내 정보 수정</Text>
        </Pressable>

        {/* 내 서재 이동 */}
        <Pressable
          style={styles.button}
          onPress={() => router.push('/main/profile/library')}
        >
          <Text style={styles.buttonText}>내 서재</Text>
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
}

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
