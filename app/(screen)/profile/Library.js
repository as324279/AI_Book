import { useNavigation } from '@react-navigation/native';
import { getAuth } from "firebase/auth";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { BackHandler, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../../components/CustomHeader";
import app from "../../../firebase/firebase.client";

const LibraryScreen = () => {
  const navigation = useNavigation();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('../../(screen)/profile');
      return true;
    });

    // Firebase에서 저장된 도서 불러오기
    const loadBooks = async () => {
      const auth = getAuth(app);
      const user = auth.currentUser;

      if (user) {
        const db = getDatabase(app);
        const userBooksRef = ref(db, `users/${user.uid}/books`);
        
        onValue(userBooksRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const bookList = Object.entries(data).map(([id, book]) => ({
              id,
              ...book
            }));
            setBooks(bookList);
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    };

    loadBooks();
    return () => backHandler.remove();
  }, []);

  // 책 상세 페이지로 이동
  const handleBookPress = (book) => {
    navigation.navigate('BookDetail', {
      title: book.title,
      authors: book.authors,
      publisher: book.publisher,
      publishedDate: book.publishedDate,
      description: book.description,
      thumbnail: book.thumbnail || ''
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title="내 서재" />
      <ScrollView style={styles.container}>
        {loading ? (
          <Text style={styles.message}>로딩 중...</Text>
        ) : books.length === 0 ? (
          <Text style={styles.message}>저장된 책이 없습니다.</Text>
        ) : (
          books.map(book => (
            <Pressable 
              key={book.id} 
              style={styles.bookCard}
              onPress={() => handleBookPress(book)}
            >
              <Text style={styles.bookTitle}>{book.title}</Text>
              <Text style={styles.bookAuthor}>{book.authors}</Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LibraryScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FEF6F0",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  bookCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});