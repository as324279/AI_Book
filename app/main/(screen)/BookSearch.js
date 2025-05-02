import React, { useState, } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable
} from 'react-native';
import axios from 'axios';
import { Ionicons,MaterialIcons } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router';


const BookSearchScreen = ()=> {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchBooks = async () => {
    if (!query) {
      setError('검색어를 입력해주세요.');
      return;
    }
    try {
        const url = `http://192.168.219.105:5000/search-books?q=${encodeURIComponent(query)}`;
        const response = await axios.get(url);
        // console.log("📦 받아온 응답:", response.data);
        // console.log("📚 books 배열:", response.data.books);

      if (response.data.books && response.data.books.length > 0) {
        const bookList = response.data.books.map((item,index) => {
          
          return {
            id: index.toString(),
            title: item.title || '제목 없음',
            authors: Array.isArray(item.authors) ? item.authors.join(', ') : item.authors || '저자 정보 없음',
            thumbnail: item.thumbnail || null,
            publisher: item.publisher || '',
            publishedDate: item.publishedDate || '',
            description: item.description || '',
          };
        });
        setBooks(bookList);
        setError('');
      } else {
        setBooks([]);
        setError('검색된 책이 없습니다.');
      }
    } catch (err) {
      console.error(err);
      setError('책 정보를 가져오는 중 오류가 발생했습니다.');
    }
  };

  return (
    <View style = {styles.container}>
        <Pressable onPress = {()=>router.replace('/MainHome')}>
            <MaterialIcons  name = "arrow-back-ios" size = {20} color = '#000'/>
        </Pressable>
        <Text style={styles.title}>📚 BookMark</Text>  

        <View style={styles.searchContainer}>
        <TextInput
        style={styles.searchInput}
         placeholder="책 제목을 입력하세요"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={fetchBooks}
        />
        <TouchableOpacity onPress={fetchBooks}>
        <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>
        </View>
        
      {error && <Text style={styles.error}>{error}</Text>}

      <ScrollView contentContainerStyle={styles.bookGrid}>
        {books.map((book) => (
          <TouchableOpacity
            key={book.id}
            style={styles.bookCard}
            onPress={() =>
              router.push({
                pathname: '/BookDetail',
                params: {
                  title: book.title,
                  authors: book.authors,
                  thumbnail: book.thumbnail,
                  publisher: book.publisher,
                  publishedDate: book.publishedDate,
                  description: book.description,
                },
              })
            }
          >
            {book.thumbnail && (
              <Image source={{ uri: book.thumbnail }} style={styles.bookImage} />
            )}
            <Text numberOfLines={1} style={styles.bookTitle}>
              {book.title}
            </Text>
            <Text numberOfLines={1} style={styles.bookAuthor}>
              {book.authors}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
export default BookSearchScreen;

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#FFF4E9',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE0B2',
    borderRadius: 16,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color:'black'
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  bookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bookCard: {
    width: '30%',
    marginBottom: 20,
    alignItems: 'center',
  },
  bookImage: {
    width: 80,
    height: 110,
    borderRadius: 4,
    marginBottom: 5,
  },
  bookTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bookAuthor: {
    fontSize: 10,
    color: '#555',
    textAlign: 'center',
  },
});