import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

//각자 개인의 와이파이 주소로 사용 -> 핸드폰과 노트북 와이파이가 일치해야 함.
const EXPRESS_SERVER_URL = 'http://192.168.219.105:5000';

const CameraScreen = () => {
  const { imageUri } = useLocalSearchParams();
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (imageUri) {
      sendImageToBackend(imageUri);
    }
  }, [imageUri]);

  const sendImageToBackend = async (uri) => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      });

      const response = await axios.post(`${EXPRESS_SERVER_URL}/ocr`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setBookData(response.data);
    } catch (error) {
      console.error('OCR 처리 오류:', error);
      Alert.alert('오류', '책 정보를 가져오지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style = {styles.screen}>
      <View style = {styles.header}>
        <Pressable onPress = {()=>router.replace('/main/MainHome')}>
        <MaterialIcons  name = "arrow-back-ios" size = {20} color = '#000'/>
        </Pressable>

        <Text style = {styles.headerTitle}>BookMark</Text>
        <Pressable >
        <MaterialIcons  name = "menu" size = {20} color = '#000'/>
        </Pressable>
      </View>
    


    <ScrollView contentContainerStyle={styles.container}>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      {loading && <ActivityIndicator size="large" color="#000" />}
      {bookData && (
        <View style={styles.infoBox}>
          <Text style={styles.title}>{bookData.best_title}</Text>
          <Text>저자: {bookData.authors?.join(', ') || '정보 없음'}</Text>
          <Text>출판사: {bookData.publisher || '정보 없음'}</Text>
          <Text>출판년도: {bookData.publishedDate || '정보 없음'}</Text>
          <Text>개요: {bookData.description || '요약 없음'}</Text>
          {/* <Text>개요: {bookData.summary || '요약 없음'}</Text> */}
        </View>
        
      )}
    </ScrollView>

    <View style = {styles.footer}>
        <Pressable style={styles.saveButton} onPress={() => Alert.alert('저장 완료!', '내 서재에 담겼어요.')}>
          <Text style={styles.saveButtonText}>내 서재에 담기</Text>
        </Pressable>
    </View>
  </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF4E9',
    position:'relative'
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
    paddingBottom:100
  },
  image: {
    width: 200,
    height: 300,
    marginBottom: 20,
    marginTop: 30,
    borderWidth: 2,
    borderColor: '#000', // ✅ 검은색 테두리
    borderRadius: 4,
  },
  infoBox: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
    width: '100%',
    marginBottom: 100, // 버튼 안 가리도록 여유
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