import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import './CameraScreen'

const MainHome = () =>{

    const router = useRouter();

    const takePicture = async () => {
        try {
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.5,
          });
    
          if (!result.canceled) {
            const processedImage = await ImageManipulator.manipulateAsync(
              result.assets[0].uri,
              [{ resize: { width: 1024 } }],
              { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
            );
    
            //  촬영된 이미지 경로 CameraScreen화면으로 넘기기
            router.push({
              pathname: './CameraScreen',
              params: { imageUri: processedImage.uri },
            });
          }
        } catch (error) {
          console.error('카메라 오류:', error);
          Alert.alert('오류', '카메라를 실행할 수 없습니다.');
        }
      };

    return(
        <View style = {styles.container}>

          <View style = {styles.header}>
          <View style = {styles.headerLeft}>
            <Text style = {styles.Title}>BookMark</Text>
          </View>
          <Pressable style={styles.headerRight} onPress={() => router.replace('./BookSearch')}>
            <MaterialIcons name='search' size={20} color='black' style={{ marginRight: 1 }} />
          </Pressable>
          <MaterialIcons name = 'menu' size = {20} color = "black"/>

          </View>
        
        
        <View style = {styles.body}>
            <Pressable style = {styles.Button} onPress = {takePicture}>
                <Text style = {styles.captureText}>책 표지 촬영</Text>
            </Pressable>
        </View>
  
        
        </View>
    )
};
export default MainHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4E9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#FFF4E9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  Title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft:150
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#EFE0D3',
    borderRadius: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  captureText: {
    fontWeight: 'bold',
    color: '#000',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#FFF4E9',
    marginTop:30
  },
  tabItem: {
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
  },
});