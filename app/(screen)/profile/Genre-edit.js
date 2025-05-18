import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, BackHandler, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import CustomHeader from "../../../components/CustomHeader";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import app from "../../../firebase/firebase.client";

const  GenreEditScreen = ()=> {
  const router = useRouter();
  const [uid, setUid] = useState(null);
  const [currentGenres, setCurrentGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. 로그인된 유저의 uid 가져오기
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

  // 2. uid가 있으면 DB에서 장르 불러오기
  useEffect(() => {
    if (!uid) return;
    const db = getDatabase(app);
    const genreRef = ref(db, `users/${uid}/genres`);
    const unsubscribe = onValue(genreRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // 배열/객체 모두 대응
        setCurrentGenres(Array.isArray(data) ? data : Object.values(data));
      } else {
        setCurrentGenres([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [uid]);

  // 3. 뒤로가기 핸들러
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.push('/(tabs)/profile');
      return true; 
    });
  
    return () => backHandler.remove();
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader showBack showIcons={false} title="관심 장르 관리" />
      <View style={styles.container}>
        <Text style={styles.subtitle}>현재 관심 장르</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#6B4B39" style={{marginVertical: 20}} />
        ) : (
          <View style={styles.genreContainer}>
            {currentGenres.length > 0 ? (
              currentGenres.map((genre, index) => (
                <View key={index} style={styles.genreCard}>
                  <Text style={styles.genreText}>{genre}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: "#999", marginBottom: 30 }}>선택된 장르가 없습니다.</Text>
            )}
          </View>
        )}
        <Pressable
          style={styles.button}
          onPress={() => router.push("../../(screen)/profile/Interest-edit")}
        >
          <Text style={styles.buttonText}>장르 다시 선택하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
export default GenreEditScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FEF6F0",
  },
  container: {
    flex: 1,
    padding: 20
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  genreContainer: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 30,
  },
  genreCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#6B4B39",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 8,
  },
  genreText: {
    fontSize: 16,
    color: "#6B4B39",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#6B4B39",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});