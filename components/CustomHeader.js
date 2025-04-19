import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, StatusBar } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useRouter, usePathname } from 'expo-router';

export default function CustomHeader({ showBack = false, showIcons = true, title }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (router.canGoBack() && pathname?.includes('/main/profile/')) {
      router.push('/main/profile');
    }
    else if(router.canGoBack() && pathname?.includes('/main/community/')){
      router.push('/main/community');
    }
    else if(router.canGoBack() && pathname?.includes('/main/challenge/')){
      router.push('/main/challenge');
    } else {
      router.back();
    }
  };

  return (
    <>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {showBack ? (
            <Pressable onPress={handleBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#6B4B39" />
            </Pressable>
          ) : (
            <Image 
              source={require('../assets/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          )}
          <Text style={styles.appName}>{title || 'BOOKMARK'}</Text>
        </View>
        {showIcons && (
          <View style={styles.headerRight}>
            <Pressable style={styles.searchButton}>
              <MaterialIcons name="search" size={24} color="#6B4B39" />
            </Pressable>
            <Pressable style={styles.menuButton}>
              <MaterialIcons name="menu" size={24} color="#6B4B39" />
            </Pressable>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
  backButton: {
    padding: 8,
    marginRight: 8,
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
});
