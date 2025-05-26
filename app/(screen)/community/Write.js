import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Image, ScrollView, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { getDatabase, ref, get, push, set } from "firebase/database";
import { getAuth } from "firebase/auth";
import app from "../../../firebase/firebase.client"
import CustomHeader from '../../../components/CustomHeader';

const WritePostScreen = ()=> {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState('자유');
  const categories = ['추천', '자유', '리뷰'];
   const auth = getAuth(app);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.push('/(tabs)/community');
      return true;
    });
    return () => backHandler.remove();
  }, [router]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) setImage(result.assets[0].uri);
    } catch (error) {
      Alert.alert('오류', '이미지를 선택하는 중 문제가 발생했습니다.');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }
    try {
      const db = getDatabase(app);
     const auth = getAuth(app);
      const userRef = ref(db, `users/${auth.currentUser.uid}`);
      const userSnap = await get(userRef);
      const nickname = userSnap.val()?.nickname || '알 수 없음';

      const postsRef = ref(db, 'posts');
      const newPostRef = push(postsRef);
      await set(newPostRef, {
        title,
        content,
        category,
        image: image || null,
        author: {
          uid: auth.currentUser.uid,
          nickname
        },
        likes: {},
        comments: {},
        timestamp: Date.now()
      });
      Alert.alert('성공', '게시글이 등록되었습니다!');
      router.push('../../(tabs)/community');
    } catch (error) {
      Alert.alert('오류', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader showBack title="게시글 작성" showIcons={false} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <Pressable key={cat} style={[styles.categoryButton, category === cat && styles.categoryButtonActive]} onPress={() => setCategory(cat)}>
              <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput style={styles.titleInput} placeholder="제목을 입력하세요" value={title} onChangeText={setTitle} />
        <TextInput style={styles.contentInput} placeholder="내용을 입력하세요" value={content} onChangeText={setContent} multiline />
        <View style={styles.imageContainer}>
          {image ? (
            <>
              <Image source={{ uri: image }} style={styles.selectedImage} />
              <Pressable style={styles.removeImageButton} onPress={() => setImage(null)}>
                <MaterialIcons name="close" size={24} color="#FFF" />
              </Pressable>
            </>
          ) : (
            <Pressable style={styles.imagePickerButton} onPress={pickImage}>
              <MaterialIcons name="add-a-photo" size={32} color="#C4A484" />
              <Text style={{ color: "#C4A484", marginTop: 8 }}>이미지 선택</Text>
            </Pressable>
          )}
        </View>
        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>완료</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
export default WritePostScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FEF6F0",
  },
  container: {
    padding: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  categoryButtonActive: {
    backgroundColor: '#6B4B39',
  },
  categoryText: {
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  titleInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  contentInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 200,
    marginBottom: 16,
    textAlignVertical: 'top',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  imageContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    minHeight: 160,
    marginBottom: 24,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imagePickerButton: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  submitButton: {
    backgroundColor: '#6B4B39',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    minWidth: 200,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },

  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
