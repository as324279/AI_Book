import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>BOOKMARK</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.searchButton}>
            <MaterialIcons name="search" size={24} color="#6B4B39" />
          </Pressable>
          <Pressable style={styles.menuButton}>
            <MaterialIcons name="menu" size={24} color="#6B4B39" />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollView}>
        <Text style={styles.tempText}>홈 화면</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF', // 상태바와 헤더 배경 통일
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: '#FFF',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#6B4B39',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    padding: 8,
    marginRight: 8,
  },
  menuButton: {
    padding: 8,
  },
  scrollView: {
    backgroundColor: '#FEF6F0', // 본문 배경
  },
  scrollContent: {
    padding: 16,
    backgroundColor: '#FEF6F0', // 본문 영역 배경 유지
  },
  tempText: {
    fontSize: 24,
    color: '#6B4B39',
  },
});
