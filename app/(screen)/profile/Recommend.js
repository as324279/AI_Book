import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Pressable  } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons,MaterialIcons } from '@expo/vector-icons'; 
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import app from "../../../firebase/firebase.client"
import {useRouter} from "expo-router";


const ALADIN_API_KEY= "ttbas3242751932001";

const RecommendScreen = ()=> {
  const [uid, setUid] = useState(null);
  const [userGenres, setUserGenres] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  // 🔥 1. 유저 로그인 확인
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
        setUserGenres(Array.isArray(data) ? data : Object.values(data));
      }
    });
    return () => unsubscribe();
  }, [uid]);

  useEffect(() => {
    if (userGenres.length === 0) return;

    const fetchRecommendedBooks = async () => {
      try {
        let allBooks = [];
        for (const genre of userGenres) {
          const books = await fetchBooksByGenre(genre);
          allBooks = [...allBooks, ...books];
        }

        const uniqueBooks = Array.from(new Map(allBooks.map(book => [book.isbn13, book])).values());

        // ✅ 점수 계산
        const scoredBooks = uniqueBooks.map(book => ({
          ...book,
          score: calculateBookScore(book, userGenres)
        }));

        // ✅ 점수 높은 순으로 정렬
        const sortedBooks = scoredBooks.sort((a, b) => b.score - a.score);

        setRecommendedBooks(sortedBooks);
      } catch (error) {
        console.error("추천 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedBooks();
  }, [userGenres]);

  const fetchBooksByGenre = async (genre) => {
    try {
      const url = `https://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=${ALADIN_API_KEY}&Query=${encodeURIComponent(genre)}&QueryType=Keyword&MaxResults=10&Cover=Big&Output=JS&Version=20131101`;
      const response = await fetch(url);
      const textData = await response.text();
      const jsonData = JSON.parse(textData.replace(/^\s*var _DATA_ = /, '').replace(/;\s*$/, ''));
      return jsonData.item || [];
    } catch (error) {
      console.error("API 실패:", error);
      return [];
    }
  };

  // ✅ 책 점수 계산 함수
  const calculateBookScore = (book, userGenres) => {
    let score = 0;
    const bookCategory = book.categoryName || "";
    const bookTitle = book.title || "";
    const bookDescription = book.description || "";

    userGenres.forEach((genre) => {
      if (bookCategory.includes(genre)) {
        score += 2; // 카테고리에 완전 포함되면 +2
      } else if (bookTitle.includes(genre) || bookDescription.includes(genre)) {
        score += 1; // 제목/설명에 들어있으면 +1
      }
    });

    return score;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Pressable onPress = {()=>router.replace('../../(tabs)/MainHome')}>
            <MaterialIcons  name = "arrow-back-ios" size = {20} color = '#000'/>
        </Pressable>
      <Text style={styles.title}> 점수 기반 추천 도서 </Text>
          {loading ? (
        <ActivityIndicator size="large" color="#6B4B39" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.bookList}>
          {recommendedBooks.map((book, index) => (
            <Pressable key = {index}
            onPress={()=> {
              router.push({
                pathname:'/(screen)/BookDetail',
                params:{
                  title:book.title ?? "제목 없음",
                  authors:book.author ?? "저자 없음",
                  thumbnail:book.cover ?? '',
                  publisher:book.publisher ?? "출판사 없음",
                  publishedDate:book.pubDate ?? "년도 없음",
                  description:book.description ?? "설명 없음"
                }
              });
            }}
            style = {styles.bookCard}>
              <Image source={{ uri: book.cover }} style={styles.bookImage} />
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle}>{book.title ?? "제목 없음"}</Text>
                <Text style={styles.bookAuthor}>{book.author ?? "저자 없음"}</Text>
                <Text style={styles.bookScore}>추천 점수: {`${book.score}`}</Text>
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