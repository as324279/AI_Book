import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import CustomHeader from "../../../components/CustomHeader";

export default function GenreEditScreen() {
  const router = useRouter();
  
  // 현재 선택된 장르들 (나중에 서버/상태관리로 대체 예정)
  const currentGenres = [
    "문학 / 소설",
    "과학 / 기술",
    "예술 / 대중문화"
  ];

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.push('/main/profile');
      return true;
    });

    return () => backHandler.remove();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader showBack showIcons={false} title="관심 장르 관리" />
      <View style={styles.container}>
        <Text style={styles.subtitle}>현재 관심 장르</Text>
        <View style={styles.genreContainer}>
          {currentGenres.map((genre, index) => (
            <View key={index} style={styles.genreCard}>
              <Text style={styles.genreText}>{genre}</Text>
            </View>
          ))}
        </View>
        <Pressable
          style={styles.button}
          onPress={() => router.push("/main/profile/interest-edit")}
        >
          <Text style={styles.buttonText}>장르 다시 선택하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

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
