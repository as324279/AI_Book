import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, TextInput, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import CustomHeader from '../../../components/CustomHeader';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';


export default function PostDetailScreen() {
  const router = useRouter();
  const { postId } = useLocalSearchParams();
  const [showOptions, setShowOptions] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.push('/main/community');
      return true;
    });

    return () => backHandler.remove();
  }, []);

  // 임시 게시글 데이터
  const post = {
    id: postId,
    author: 'book',
    title: '날씨와 사랑',
    content: '오늘은 날씨가 참 좋네요. 이런 날씨에는 로맨스 소설이 잘 어울립니다...',
    image: require('../../../assets/logo.png'),
    likes: 7,
    comments: [
      { id: 1, author: 'book2', content: '좋은 리뷰네요!', timestamp: '03/11 17:00' },
    ],
    timestamp: '03/11 16:54',
  };

  const isAuthor = true; // 실제로는 로그인한 사용자와 게시글 작성자 비교

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader showBack title="게시글" showIcons={false} />
      
      <ScrollView style={styles.container}>
        <View style={styles.postHeader}>
          <View style={styles.authorInfo}>
            <MaterialIcons name="account-circle" size={24} color="#6B4B39" />
            <Text style={styles.authorName}>{post.author}</Text>
            <Text style={styles.timestamp}>{post.timestamp}</Text>
          </View>
          
          <Pressable 
            style={styles.optionsButton}
            onPress={() => setShowOptions(!showOptions)}
          >
            <MaterialIcons name="more-vert" size={24} color="#6B4B39" />
          </Pressable>
        </View>

        {showOptions && (
          <View style={styles.optionsMenu}>
            {isAuthor ? (
              <>
                <Pressable style={styles.optionItem}>
                  <Text style={styles.optionText}>수정하기</Text>
                </Pressable>
                <Pressable style={styles.optionItem}>
                  <Text style={styles.optionText}>삭제하기</Text>
                </Pressable>
              </>
            ) : (
              <Pressable style={styles.optionItem}>
                <Text style={styles.optionText}>신고하기</Text>
              </Pressable>
            )}
          </View>
        )}

        <Text style={styles.postTitle}>{post.title}</Text>
        
        {post.image && (
          <Image source={post.image} style={styles.postImage} />
        )}
        
        <Text style={styles.postContent}>{post.content}</Text>

        <View style={styles.interactionBar}>
          <Pressable style={styles.interactionButton}>
            <MaterialIcons name="favorite-border" size={24} color="#FF6B6B" />
            <Text style={styles.interactionText}>{post.likes}</Text>
          </Pressable>
          <Pressable style={styles.interactionButton}>
            <MaterialIcons name="chat-bubble-outline" size={24} color="#6B4B39" />
            <Text style={styles.interactionText}>{post.comments.length}</Text>
          </Pressable>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>댓글</Text>
          {post.comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAuthor}>{comment.author}</Text>
                <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
              </View>
              <Text style={styles.commentContent}>{comment.content}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.commentInput}>
        <TextInput
          style={styles.input}
          placeholder="댓글을 입력하세요"
          value={comment}
          onChangeText={setComment}
          multiline
        />
        <Pressable style={styles.sendButton}>
          <MaterialIcons name="send" size={24} color="#6B4B39" />
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
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    marginLeft: 8,
    fontWeight: '500',
    color: '#333',
  },
  timestamp: {
    marginLeft: 8,
    color: '#666',
    fontSize: 12,
  },
  optionsButton: {
    padding: 4,
  },
  optionsMenu: {
    position: 'absolute',
    right: 16,
    top: 40,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  optionItem: {
    padding: 8,
  },
  optionText: {
    color: '#333',
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  interactionBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5D1B8',
    paddingVertical: 12,
    marginBottom: 16,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  interactionText: {
    marginLeft: 4,
    color: '#666',
  },
  commentsSection: {
    marginBottom: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  commentItem: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentAuthor: {
    fontWeight: '500',
    color: '#333',
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  commentContent: {
    color: '#333',
  },
  commentInput: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5D1B8',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    justifyContent: 'center',
    padding: 8,
  },
}); 