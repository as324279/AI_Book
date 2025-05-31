import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { get, getDatabase, push, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import app from '../../firebase/firebase.client';

const BookDetail = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);
  
  // 파라미터 추출
  const {
    title = '정보 없음',
    authors = '정보 없음',
    thumbnail = '',
    publisher = '정보 없음',
    publishedDate = '정보 없음',
    description = '요약 없음',
  } = params;

  // 중복 체크 후 도서 저장 함수
  const saveToLibrary = async () => {
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('로그인 필요', '로그인 후 이용해주세요.');
        return;
      }

      const db = getDatabase(app);
      const userBooksRef = ref(db, `users/${user.uid}/books`);
      
      // 중복 확인 (인덱스 없이 진행)
      const allBooksSnapshot = await get(userBooksRef);
      let isDuplicate = false;
      
      if (allBooksSnapshot.exists()) {
        allBooksSnapshot.forEach((childSnapshot) => {
          if (childSnapshot.val().title === title) {
            isDuplicate = true;
          }
        });
      }
      
      if (isDuplicate) {
        Alert.alert('알림', '이미 저장된 책입니다!');
        return;
      }

      // 저장할 책 데이터
      const bookData = {
        title,
        authors,
        thumbnail,
        publisher,
        publishedDate,
        description,
        savedAt: new Date().toISOString()
      };

      // 데이터 저장
      await push(userBooksRef, bookData);
      Alert.alert('저장 완료!', '내 서재에 담겼어요.');
    } catch (error) {
      console.error('저장 실패:', error);
      Alert.alert('저장 실패', '다시 시도해주세요.');
    }
  };

  useEffect(() => {
    const checkDuplicate = async () => {
      try {
        const auth = getAuth(app);
        const user = auth.currentUser;
  
        if (!user) return;
  
        const db = getDatabase(app);
        const userBooksRef = ref(db, `users/${user.uid}/books`);
        const snapshot = await get(userBooksRef);
  
        if (snapshot.exists()) {
          snapshot.forEach((child) => {
            if (child.val().title === title) {
              setIsAlreadySaved(true);
            }
          });
        }
      } catch (error) {
        console.error("중복 확인 중 오류:", error);
      }
    };
  
    checkDuplicate();
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>BookMark</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        <View style={styles.container}>
          {thumbnail ? (
            <Image source={{ uri: thumbnail }} style={styles.image} />
          ) : (
            <View style={[styles.image, { backgroundColor: '#E5E5E5', justifyContent: 'center', alignItems: 'center' }]}>
              <MaterialIcons name="image-not-supported" size={50} color="#999" />
            </View>
          )}
          <View style={styles.infoBox}>
            <Text style={styles.title}>제목: {title}</Text>
            <Text>저자: {authors}</Text>
            <Text>출판사: {publisher}</Text>
            <Text>출판년도: {publishedDate}</Text>
            <Text>개요: {description}</Text>
          </View>
        </View>
        {!isAlreadySaved && (
        <View style={styles.footer}>
          <Pressable style={styles.saveButton} onPress={saveToLibrary}>
            <Text style={styles.saveButtonText}>내 서재에 담기</Text>
          </Pressable>
        </View>
        )}
      </ScrollView>
    </View>
  );
};

export default BookDetail;


const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: '#FFF4E9',
      position: 'relative',
    },
    header: {
      paddingTop: 50,
      paddingBottom: 10,
      paddingHorizontal: 20,
      backgroundColor: '#FFEFE3',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    container: {
      alignItems: 'center',
      padding: 20,
      paddingBottom: 100,
    },
    image: {
      width: 200,
      height: 300,
      marginBottom: 20,
      marginTop: 30,
      borderWidth: 2,
      borderColor: '#000',
      borderRadius: 4,
    },
    infoBox: {
      padding: 10,
      backgroundColor: '#fff',
      borderRadius: 6,
      width: '100%',
      marginBottom: 100,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    footer: {
      position: 'absolute',
      bottom: 100,
      left: 20,
      right: 20,
      alignItems: 'center',
    },
    saveButton: {
      backgroundColor: '#5C3B28',
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 8,
    },
    saveButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
  });