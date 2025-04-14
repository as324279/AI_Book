// App.js - 앱의 진입점
// Expo Router를 사용하여 전체 앱의 네비게이션 구조를 정의합니다.
import { useColorScheme } from 'react-native';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { ExpoRoot } from 'expo-router';

export default function App() {
  // 사용자의 기기 테마 설정(라이트/다크 모드)을 가져옵니다.
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ExpoRoot context={require.context('./app')} />
    </ThemeProvider>
  );
}
