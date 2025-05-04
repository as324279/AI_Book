import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getDatabase, ref, onValue, query, orderByChild } from "firebase/database";
import { getAuth } from "firebase/auth";
import app from "../../../firebase/firebase.client";

const CommunityScreen = ()=> {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('추천');
  const categories = ['추천', '자유', '리뷰'];
  // const auth = getAuth(app);

  function formatDate(ts) {
    const d = new Date(ts);
    const MM = (d.getMonth() + 1).toString().padStart(2, '0');
    const DD = d.getDate().toString().padStart(2, '0');
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${MM}/${DD} ${hh}:${mm}`;
  }

  useEffect(() => {
    const db = getDatabase(app);
    const postsRef = query(ref(db, 'posts'), orderByChild('timestamp'));
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      const postsArray = data
        ? Object.entries(data).map(([id, post]) => ({
            id,
            ...post,
            timestamp: formatDate(post.timestamp),
            preview: post.content?.slice(0, 30) + '...',
            likeCount: post.likes ? Object.keys(post.likes).length : 0,
            isLiked: post.likes && auth.currentUser?.uid && post.likes[auth.currentUser.uid],
            comments: post.comments ? Object.keys(post.comments).length : 0,
            author: post.author?.nickname || '알 수 없음'
          }))
        : [];
      setPosts(postsArray.reverse());
    });
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <Pressable
            key={category}
            style={[styles.categoryButton, selectedCategory === category && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}>
              {category}
            </Text>
          </Pressable>
        ))}
      </View>
      <ScrollView style={styles.container}>
        {posts
          .filter((post) => post.category === selectedCategory)
          .map((post) => (
            <Pressable
              key={post.id}
              style={styles.postCard}
              onPress={() =>
                router.push({
                  pathname: '../../(screen)/community/Post',
                  params: { postId: post.id }
                })
              }
            >
              <View style={styles.postHeader}>
                <MaterialIcons name="person" size={18} color="#C4A484" />
                <Text style={styles.authorName}>{post.author}</Text>
                <Text style={styles.timestamp}>{post.timestamp}</Text>
              </View>
              <View style={styles.postContent}>
                <Image 
                  source={post.image ? { uri: post.image } : require('../../../assets/logo.png')}
                  style={styles.postImage}
                />
                <View style={styles.postText}>
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <Text style={styles.postPreview}>{post.preview}</Text>
                </View>
              </View>
              <View style={styles.postFooter}>
                <MaterialIcons 
                  name={post.isLiked ? "favorite" : "favorite-border"} 
                  size={16} color="#C4A484" 
                />
                <Text style={styles.interactionText}>{post.likeCount}</Text>
                <MaterialIcons name="chat-bubble-outline" size={16} color="#C4A484" style={{marginLeft:12}} />
                <Text style={styles.interactionText}>{post.comments}</Text>
              </View>
            </Pressable>
          ))}
      </ScrollView>
      <Pressable style={styles.writeButton} onPress={() => router.push('../../(screen)/community/Write')}>
        <MaterialIcons name="edit" size={28} color="#FFF" />
      </Pressable>
    </SafeAreaView>
  );
}
export default CommunityScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FEF6F0",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFF',
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
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#6B4B39',
  },
  timestamp: {
    marginLeft: 8,
    fontSize: 12,
    color: '#999',
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
    marginBottom: 6,
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
    borderTopColor: '#F0F0F0',
  },
  interactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  interactionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#999',
  },
  writeButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6B4B39',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});