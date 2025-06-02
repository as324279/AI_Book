import axios from 'axios'; // expo install axios
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { getAuth } from "firebase/auth";
import { get, getDatabase, push, ref, set } from "firebase/database";
import { useEffect, useState } from 'react';
import { Alert, BackHandler, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomHeader from '../../../components/CustomHeader';
import app from "../../../firebase/firebase.client";

const WritePostScreen = ()=> {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null); // 미리보기용
  const [imageBase64, setImageBase64] = useState(null); // 서버 전송용
  const [category, setCategory] = useState('자유');
  const categories = ['추천', '자유', '리뷰'];
  const auth = getAuth(app);
  const [galleryPermission, requestPermission] = ImagePicker.useMediaLibraryPermissions();

  useEffect(() => {
  (async () => {
    if (!galleryPermission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('권한 필요', '이미지 선택을 위해 갤러리 접근 권한이 필요합니다.');
      }
    }
  })();
}, [galleryPermission]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.push('/(tabs)/community');
      return true;
    });
    return () => backHandler.remove();
  }, [router]);

const pickImage = async () => {
  try {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: false, // [수정] base64는 false로 두고, 아래에서 직접 변환
    });

    if (!result.canceled) {
      // [추가] 이미지 크기 압축 (compress 0.3~0.5)
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [],
        { format: ImageManipulator.SaveFormat.JPEG, compress: 0.4 }
      );
      // [추가] 압축된 이미지를 base64로 변환
      const base64 = await ImageManipulator.manipulateAsync(
        manipulated.uri,
        [],
        { base64: true }
      );
      setImage(manipulated.uri);
      setImageBase64(base64.base64);
    }
  } catch (error) {
    Alert.alert('오류', '이미지를 선택하는 중 문제가 발생했습니다.');
    console.log('ImagePicker error:', error);
  }
};

  // 서버에 base64 업로드 → Storage URL 반환
  const uploadImageToServer = async (base64) => {
    const filename = `${Date.now()}_${Math.floor(Math.random()*10000)}.jpg`;
    // 실제 서버 주소로 변경
    const response = await axios.post('http://211.108.99.224:5000/upload-image-to-storage', {
      base64,
      filename
    });
    return response.data.url; // Storage 다운로드 URL
  };

  // 게시글 등록
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
      const userRef = ref(db, `users/${auth.currentUser.uid}`);
      const userSnap = await get(userRef);
      const nickname = userSnap.val()?.nickname || '알 수 없음';
      const postsRef = ref(db, 'posts');
      const newPostRef = push(postsRef);

      let imageUrl = null;
      if (imageBase64) {
        imageUrl = await uploadImageToServer(imageBase64);
      }

      await set(newPostRef, {
        title,
        content,
        category,
        image: imageUrl,
        author: {
          uid: auth.currentUser.uid,
          nickname
        },
        likes: {},
        comments: {},
        timestamp: Date.now()
      });
      Alert.alert('성공', '게시글이 등록되었습니다!');
      router.push('/(tabs)/community');
    } catch (error) {
      Alert.alert('오류', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title="게시글 작성" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.categoryButtonActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          style={styles.titleInput}
          placeholder="제목을 입력하세요"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.contentInput}
          placeholder="내용을 입력하세요"
          value={content}
          onChangeText={setContent}
          multiline
        />
        <View style={styles.imageContainer}>
          {image ? (
            <>
              <Image source={{ uri: image }} style={styles.selectedImage} />
              <Pressable
                style={styles.removeImageButton}
                onPress={() => {
                  setImage(null);
                  setImageBase64(null);
                }}
              >
                <MaterialIcons name="close" size={24} color="#fff" />
              </Pressable>
            </>
          ) : (
            <Pressable
              style={styles.imagePickerButton}
              onPress={pickImage}
            >
              <MaterialIcons name="add-photo-alternate" size={48} color="#6B4B39" />
              <Text style={{color:'#c2a484', marginTop:8}}>이미지 선택</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.bottomBar}>
          <Pressable
            style={[
              styles.submitButton,
              (!title.trim() || !content.trim()) && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={!title.trim() || !content.trim()}
          >
            <Text style={styles.submitButtonText}>완료</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
