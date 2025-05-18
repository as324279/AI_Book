import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, BackHandler } from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/CustomHeader';
import { useRouter } from 'expo-router';

export default function Challenge2() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [progress, setProgress] = useState(4); // 0~8 단계  

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.push('/(tabs)/challenge');
      return true;
    });

    return () => backHandler.remove();
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader showBack title="챌린지" showIcons={false} />
      <View style={styles.container}>
        <Text style={styles.levelTitle}>🔥 초급 난이도</Text>

        <TextInput
          style={styles.inputBox}
          placeholder="책 제목"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.textArea}
          placeholder="줄거리를 요약해 적어보세요"
          value={summary}
          onChangeText={setSummary}
          multiline
        />

        <Text style={styles.progressLabel}>진행사항:</Text>
        <View style={styles.progressBarWrapper}>
          <View style={[styles.progressBarFill, { width: `${(progress / 8) * 100}%` }]} />
          <Text style={styles.progressText}>{progress} of 8</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={8}
          step={1}
          value={progress}
          onValueChange={setProgress}
          minimumTrackTintColor="#C66537"
          maximumTrackTintColor="#DDD"
        />

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>저장하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#FEF6F0',
    },
    container: {
      padding: 20,
      alignItems: 'center',
    },
    levelTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    inputBox: {
      backgroundColor: '#FCE2B7',
      borderRadius: 8,
      padding: 12,
      width: '100%',
      marginBottom: 12,
      fontSize: 16,
    },
    textArea: {
      backgroundColor: '#FFF4E1',
      borderRadius: 8,
      padding: 12,
      width: '100%',
      height: 100,
      textAlignVertical: 'top',
      marginBottom: 20,
      fontSize: 16,
    },
    progressLabel: {
      alignSelf: 'flex-start',
      fontSize: 16,
      marginBottom: 8,
    },
    progressBarWrapper: {
      width: '100%',
      height: 20,
      backgroundColor: '#EEE',
      borderRadius: 10,
      overflow: 'hidden',
      marginBottom: 8,
      justifyContent: 'center',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: '#C66537',
      borderRadius: 10,
    },
    progressText: {
      position: 'absolute',
      alignSelf: 'center',
      fontSize: 12,
      fontWeight: 'bold',
      color: '#FFF',
    },
    slider: {
      width: '100%',
      marginBottom: 24,
    },
    button: {
      backgroundColor: '#6B4B39',
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 32,
      width: '100%',
      alignItems: 'center',
      marginBottom: 12,
    },
    buttonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
  