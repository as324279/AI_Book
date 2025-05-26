import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';

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
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <CustomHeader
            showBack={false}
            showIcons={true}
            title="BOOKMARK"
            onPressSearch={() => router.push('/(screen)/BookSearch')}
          /> 

        <View style = {styles.body}>
            <Pressable style = {styles.Button} onPress = {takePicture}>
                <Text style = {styles.captureText}>책 표지 촬영</Text>
            </Pressable>
          </View>
        </SafeAreaView>
    )
};

export default MainHome;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FEF6F0",
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