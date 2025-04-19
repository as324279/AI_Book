import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import CustomHeader from '../../../components/CustomHeader';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// 임시 게시글 데이터 (추후 서버/DB 연동 예정)
const INITIAL_POSTS = [
  {
    id: 1,
    author: 'book',
    title: '날씨와 사랑',
    preview: '좋은 날씨에 읽기 좋은 책이에요...',
    image: require('../../../assets/logo.png'),
    likes: 7,
    comments: 5,
    timestamp: '03/11 16:54',
    category: '리뷰'
  },
  // 더미 데이터 추가 가능
];

export default function CommunityScreen() {
  const router = useRouter();
  // 게시글 목록 상태 관리
  const [posts, setPosts] = useState(INITIAL_POSTS);
  // 선택된 카테고리 상태 관리
  const [selectedCategory, setSelectedCategory] = useState('추천');
  
  // 카테고리 목록
  const categories = ['추천', '자유', '리뷰'];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 커스텀 헤더 컴포넌트 */}
      <CustomHeader title="커뮤니티" showIcons={true} />
      
      {/* 카테고리 선택 버튼 그룹 */}
      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <Pressable
            key={category}
            style={[
              styles.categoryButton,
              // 선택된 카테고리에 활성화 스타일 적용
              selectedCategory === category && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive
            ]}>
              {category}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* 게시글 목록 스크롤 뷰 */}
      <ScrollView style={styles.container}>
        {posts.map((post) => (
          <Pressable
            key={post.id}
            style={styles.postCard}
            // 게시글 클릭 시 상세 페이지로 이동
            onPress={() => router.push({
              pathname: '/main/community/post',
              params: { postId: post.id }
            })}
          >
            {/* 게시글 헤더 (작성자 정보) */}
            <View style={styles.postHeader}>
              <View style={styles.authorInfo}>
                <MaterialIcons name="account-circle" size={24} color="#6B4B39" />
                <Text style={styles.authorName}>{post.author}</Text>
                <Text style={styles.timestamp}>{post.timestamp}</Text>
              </View>
            </View>
            
            {/* 게시글 내용 (이미지, 제목, 미리보기) */}
            <View style={styles.postContent}>
              {post.image && (
                <Image source={post.image} style={styles.postImage} />
              )}
              <View style={styles.postText}>
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postPreview} numberOfLines={2}>
                  {post.preview}
                </Text>
              </View>
            </View>

            {/* 게시글 하단 (좋아요, 댓글 수) */}
            <View style={styles.postFooter}>
              <View style={styles.interactionContainer}>
                <MaterialIcons name="favorite-border" size={20} color="#FF6B6B" />
                <Text style={styles.interactionText}>{post.likes}</Text>
              </View>
              <View style={styles.interactionContainer}>
                <MaterialIcons name="chat-bubble-outline" size={20} color="#6B4B39" />
                <Text style={styles.interactionText}>{post.comments}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* 글쓰기 플로팅 버튼 */}
      <Pressable 
        style={styles.writeButton}
        onPress={() => router.push('/main/community/write')}
      >
        <MaterialIcons name="edit" size={24} color="#FFF" />
      </Pressable>
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
  },
  categoryContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5D1B8',
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#FEF6F0',
  },
  categoryButtonActive: {
    backgroundColor: '#6B4B39',
  },
  categoryText: {
    color: '#6B4B39',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  postCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  postContent: {
    flexDirection: 'row',
  },
  postImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  postText: {
    flex: 1,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  postPreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  postFooter: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5D1B8',
  },
  interactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  interactionText: {
    marginLeft: 4,
    color: '#666',
  },
  writeButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6B4B39',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
}); 