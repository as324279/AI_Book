import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const BookDetail = ()=>{
    const router = useRouter();

    const {
        title,
        authors,
        thumbnail,
        publisher,
        publishedDate,
        description,
      } = useLocalSearchParams();

    return (
        <View style = {styles.screen}>
            <View style = {styles.header}>
                <Pressable onPress = {()=>router.back()}>
                    <MaterialIcons name = 'arrow-back-ios' size = {20} color = '#000'/>
                </Pressable>
                <Text style = {styles.headerTitle}>BookMark</Text>

                <Pressable >
                    <MaterialIcons name = 'menu' size = {20} color = '#000'/>
                </Pressable>
            </View>

            <ScrollView contentContainerStyle = {styles.container}>
            {thumbnail && <Image source={{ uri: thumbnail }} style={styles.image} />}

                <View style = {styles.infoBox}>
                <Text>제목: {title || '정보 없음'}</Text>
                <Text>저자: {authors || '정보 없음'}</Text>
                <Text>출판사: {publisher || '정보 없음'}</Text>
                <Text>출판년도: {publishedDate || '정보 없음'}</Text>
                <Text>개요: {description || '요약 없음'}</Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
            <Pressable
                style={styles.saveButton}
                onPress={() => Alert.alert('저장 완료!', '내 서재에 담겼어요.')}
            >
                <Text style={styles.saveButtonText}>내 서재에 담기</Text>
            </Pressable>
        </View>
    </View>
    );
}
export default BookDetail;

const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: '#FFF4E9',
      position: 'relative',
    },
    header: {
      paddingTop: 50,
      paddingBottom: 10,
      paddingHorizontal: 20,
      backgroundColor: '#FFEFE3',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    container: {
      alignItems: 'center',
      padding: 20,
      paddingBottom: 100,
    },
    image: {
      width: 200,
      height: 300,
      marginBottom: 20,
      marginTop: 30,
      borderWidth: 2,
      borderColor: '#000',
      borderRadius: 4,
    },
    infoBox: {
      padding: 10,
      backgroundColor: '#fff',
      borderRadius: 6,
      width: '100%',
      marginBottom: 100,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    footer: {
      position: 'absolute',
      bottom: 100,
      left: 20,
      right: 20,
      alignItems: 'center',
    },
    saveButton: {
      backgroundColor: '#5C3B28',
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 8,
    },
    saveButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
  });