import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, TextInput, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getDatabase, ref, onValue, update, push, remove, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import app from "../../../firebase/firebase.client"

function formatDate(ts) {
  const d = new Date(ts);
  const MM = (d.getMonth() + 1).toString().padStart(2, '0');
  const DD = d.getDate().toString().padStart(2, '0');
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${MM}/${DD} ${hh}:${mm}`;
}

const PostDetailScreen = ()=> {
  const router = useRouter();
  const { postId } = useLocalSearchParams();
  const [showOptions, setShowOptions] = useState(false);
  const [comment, setComment] = useState('');
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
   const auth = getAuth(app);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.push('../../(screen)/community');
      return true;
    });
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const db = getDatabase(app);
    const postRef = ref(db, `posts/${postId}`);
    const unsubscribe = onValue(postRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const commentsArray = data.comments
          ? Object.entries(data.comments).map(([id, comment]) => ({
              id,
              ...comment,
              timestamp: formatDate(comment.timestamp),
              isOwner: auth.currentUser?.uid === comment.author?.uid,
              nickname: comment.author?.nickname || '알 수 없음'
            }))
          : [];
        setPost({
          ...data,
          id: postId,
          author: data.author || { nickname: '알 수 없음', uid: 'anonymous' },
          timestamp: formatDate(data.timestamp),
          comments: commentsArray,
          isOwner: auth.currentUser?.uid === data.author?.uid,
          isLiked: data.likes && auth.currentUser?.uid && data.likes[auth.currentUser.uid],
          likeCount: data.likes ? Object.keys(data.likes).length : 0
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [postId]);

  const handleDeletePost = async () => {
    if (!auth.currentUser) return;
    if (post.author.uid !== auth.currentUser.uid) {
      Alert.alert('알림', '자신이 작성한 게시글만 삭제할 수 있습니다.');
      return;
    }
    Alert.alert('게시글 삭제', '정말 이 게시글을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: async () => {
        const db = getDatabase(app);
        await remove(ref(db, `posts/${postId}`));
        Alert.alert('알림', '게시글이 삭제되었습니다.');
        router.push('../../(screen)/community');
      }}
    ]);
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    if (!auth.currentUser) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }
    try {
      const db = getDatabase(app);
      const userRef = ref(db, `users/${auth.currentUser.uid}`);
      const userSnap = await get(userRef);
      const nickname = userSnap.val()?.nickname || '알 수 없음';
      const commentsRef = ref(db, `posts/${postId}/comments`);
      await push(commentsRef, {
        author: {
          uid: auth.currentUser.uid,
          nickname: nickname
        },
        content: comment,
        timestamp: Date.now()
      });
      setComment('');
    } catch (error) {
      Alert.alert('오류', '댓글을 작성하는 중 문제가 발생했습니다.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!auth.currentUser) return;
    try {
      const db = getDatabase(app);
      const commentRef = ref(db, `posts/${postId}/comments/${commentId}`);
      const snapshot = await get(commentRef);
      const commentData = snapshot.val();
      if (commentData.author.uid !== auth.currentUser.uid) {
        Alert.alert('알림', '자신이 작성한 댓글만 삭제할 수 있습니다.');
        return;
      }
      Alert.alert('댓글 삭제', '정말 이 댓글을 삭제하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: async () => {
          await remove(commentRef);
          Alert.alert('알림', '댓글이 삭제되었습니다.');
        }}
      ]);
    } catch (error) {
      Alert.alert('오류', '댓글 삭제 중 문제가 발생했습니다.');
    }
  };

  const handleLike = async () => {
    if (!auth.currentUser) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }
    try {
      const db = getDatabase(app);
      const likesRef = ref(db, `posts/${postId}/likes`);
      const userId = auth.currentUser.uid;
      if (post.isLiked) {
        await update(likesRef, { [userId]: null });
      } else {
        await update(likesRef, { [userId]: true });
      }
    } catch (error) {
      Alert.alert('오류', '좋아요 처리 중 문제가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text>게시글을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (!post) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text>게시글을 찾을 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.postHeader}>
          <MaterialIcons name="person" size={20} color="#C4A484" />
          <Text style={styles.authorName}>{post.author.nickname}</Text>
          <Text style={styles.timestamp}>{post.timestamp}</Text>
          <Pressable style={styles.optionsButton} onPress={() => setShowOptions(!showOptions)}>
            <MaterialIcons name="more-vert" size={24} color="#6B4B39" />
          </Pressable>
          {showOptions && post.isOwner && (
            <View style={styles.optionsMenu}>
              <Pressable style={styles.optionItem} onPress={handleDeletePost}>
                <Text style={styles.optionText}>삭제하기</Text>
              </Pressable>
            </View>
          )}
        </View>
        <Text style={styles.postTitle}>{post.title}</Text>
        {post.image ? (
          <Image source={{ uri: post.image }} style={styles.postImage} />
        ) : (
          <Image source={require('../../../assets/logo.png')} style={styles.postImage} />
        )}
        <Text style={styles.postContent}>{post.content}</Text>
        <View style={styles.interactionBar}>
          <Pressable style={styles.interactionButton} onPress={handleLike}>
            <MaterialIcons 
              name={post.isLiked ? "favorite" : "favorite-border"} 
              size={20} 
              color="#C4A484" 
            />
            <Text style={styles.interactionText}>{post.likeCount}</Text>
          </Pressable>
          <View style={styles.interactionButton}>
            <MaterialIcons name="chat-bubble-outline" size={20} color="#C4A484" />
            <Text style={styles.interactionText}>{post.comments.length}</Text>
          </View>
        </View>
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>댓글</Text>
          {post.comments.length > 0 ? (
            post.comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{comment.nickname}</Text>
                  <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
                  {comment.isOwner && (
                    <Pressable 
                      style={styles.deleteButton} 
                      onPress={() => handleDeleteComment(comment.id)}
                    >
                      <MaterialIcons name="delete" size={16} color="#C4A484" />
                    </Pressable>
                  )}
                </View>
                <Text style={styles.commentContent}>{comment.content}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noComments}>아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</Text>
          )}
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
        <Pressable style={styles.sendButton} onPress={handleComment}>
          <MaterialIcons name="send" size={24} color="#6B4B39" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};
export default PostDetailScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FEF6F0",
  },
  container: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    position: 'relative',
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
  optionsButton: {
    padding: 4,
  },
  optionsMenu: {
    position: 'absolute',
    right: 0,
    top: 30,
    backgroundColor: '#FFF',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    zIndex: 10,
  },
  optionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
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
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 16,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  interactionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#999',
  },
  commentsSection: {
    marginBottom: 16,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  commentItem: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B4B39',
  },
  commentTimestamp: {
    marginLeft: 8,
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  noComments: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  commentInput: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
    alignSelf: 'flex-end',
  },
});