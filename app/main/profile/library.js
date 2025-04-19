import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../../components/CustomHeader";
import { useRouter } from "expo-router";

export default function LibraryScreen() {
  const router = useRouter();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.push('/main/profile');
      return true;
    });

    return () => backHandler.remove();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader showBack showIcons={false} title="내 서재" />
      <ScrollView style={styles.container}>
        <View style={styles.bookCard}>
          <Text style={styles.bookTitle}>지적 대화를 위한 넓고 얕은 지식</Text>
        </View>
        <View style={styles.bookCard}>
          <Text style={styles.bookTitle}>날씨와 사랑</Text>
        </View>
      </ScrollView>
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
    padding: 20,
  },
  bookCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});
