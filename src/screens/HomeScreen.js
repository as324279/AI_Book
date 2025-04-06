import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import logo from '../../assets/logo.png';


export default function HomeScreen() {
  return (
    <View style={styles.container}>
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.tempText}>홈 화면</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF6F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
    paddingTop: 5,
    backgroundColor: '#FFF',
    elevation: 4,
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tempText: {
    fontSize: 24,
    color: '#6B4B39',
  },
});