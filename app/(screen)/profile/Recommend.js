import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Pressable  } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons,MaterialIcons } from '@expo/vector-icons'; 
import { SegmentedButtons } from 'react-native-paper';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import app from "../../../firebase/firebase.client"
import {useRouter} from "expo-router";


// const ALADIN_API_KEY= "ttbas3242751932001";

const RecommendScreen = ()=> {
  const [uid, setUid] = useState(null);
  const [userGenres, setUserGenres] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortoption, setSortOption] = useState('SalePoint');
  const [savedBooks, setSavedBooks] = useState([]);
  const [purpose, setPurpose] = useState("general");


  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setUid(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!uid) return;
    const db = getDatabase(app);
    const genreRef = ref(db, `users/${uid}/genres`);
    const unsubscribe = onValue(genreRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const genres = Array.isArray(data) ? data : Object.values(data);
        setUserGenres(genres);
      }
    });
    return () => unsubscribe();
  }, [uid]);

  //관심 도서 가져오기
  useEffect(() => {
    if (!uid) return;
    const db = getDatabase(app);
    const booksRef = ref(db, `users/${uid}/books`);
    const unsubscribe = onValue(booksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const bookArray = Object.values(data);
        setSavedBooks(bookArray);
      } else {
        setSavedBooks([]);
      }
    });
    return () => unsubscribe();
  }, [uid]);

  

  useEffect(() => {
    if (userGenres.length === 0 || savedBooks.length === 0) return;
  
  

    
    const fetchRecommendedBooks = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://192.168.219.103:5000/hybrid-recommend", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ savedBooks,sortoption,genres: userGenres,purpose
                                 }),
        });

         const data = await response.json();
         console.log("📚 API 응답 확인:", data); // 🔍 응답 구조 확인

        if (Array.isArray(data.books)) {
          setRecommendedBooks(data.books);
        } else {
          console.warn("추천 결과가 배열이 아님:", data.books);
          setRecommendedBooks([]); // ✅ 항상 배열로 유지
        }
      } catch (error) {
        console.error("추천 실패:", error);
        setRecommendedBooks([]); // ✅ 실패 시도 배열 초기화
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedBooks();
  }, [userGenres,savedBooks,sortoption]);
  
  const getLabel = (score) => {
      if (score > 0.8) return "강력 추천";
      if (score > 0.5) return "추천";
      return "보통";
    }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Pressable onPress={() => router.replace('../../(tabs)/MainHome')}>
        <MaterialIcons name="arrow-back-ios" size={20} color="#000" style={{ marginLeft: 10 }} />
      </Pressable>
      <Text style={styles.title}>AI 추천 도서 목록</Text>

      { <View style = {{marginBottom: 12,marginRight:170, alignSelf:'center'}}>
        <SegmentedButtons 
        value = {sortoption}
        onValueChange = {setSortOption}
        buttons = {[
          {value: 'SalePoint', label:'인기순'},
          {value: 'PublishTime', label:'최신순'},
          
        ]}  
        />
      </View> }
      
    
      {loading ? (
        <ActivityIndicator size="large" color="#6B4B39" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.bookList}>
          {Array.isArray(recommendedBooks) && recommendedBooks.map((book, index) => (
            <Pressable
              key={index}
              onPress={() => {
                router.push({
                  pathname: '/(screen)/BookDetail',
                  params: {
                    title: book.title ?? "제목 없음",
                    authors: book.author ?? "저자 없음",
                    thumbnail: book.cover ?? '',
                    publisher: book.publisher ?? "출판사 없음",
                    publishedDate: book.pubDate ?? "년도 없음",
                    description: book.description ?? "설명 없음",
                    categoryName:book.categoryName ?? "정보 없음"
                  },
                });
              }}
              style={styles.bookCard}
            >
              <Image source={{ uri: book.cover }} style={styles.bookImage} />
              <View style={styles.bookInfo}>
                <Text>추천 출처: {book.source === "interest" ? "관심 도서 기반" : "관심 장르 기반"}</Text>
                <Text style={styles.bookTitle}>{book.title ?? "제목 없음"}</Text>
                <Text style={styles.bookAuthor}>{book.author ?? "저자 없음"}</Text>
                <Text style={styles.bookScore}>추천 점수: {(book.normalized_score ?? 0).toFixed(2)} ({getLabel(book.normalized_score)})</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default RecommendScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FEF6F0",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 20,
    color: "#333",
    textAlign: "center",
  },
  bookList: {
    paddingBottom: 20,
  },
  bookCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookImage: {
    width: 60,
    height: 90,
    borderRadius: 5,
    marginRight: 10,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6B4B39",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: "#999",
  },
  bookScore : {
    fontSize : 14,
    color: '#666'
  }
});
