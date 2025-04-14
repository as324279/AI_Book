// App.js - 앱의 진입점 역할을 합니다.
// 여기서 전체 라우팅 구조, 테마 적용 등의 전역 설정을 처리합니다.

import { useColorScheme } from 'react-native'; // 사용자의 기기 테마 (라이트 / 다크 모드)를 감지하는 훅
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native'; // 내비게이션 테마 제공 도구
import { ExpoRoot } from 'expo-router'; // app 폴더 안의 파일들을 라우팅 구조로 자동 등록해주는 컴포넌트

export default function App() {
  // 기기 설정에 따라 'dark' 또는 'light' 문자열을 반환
  const colorScheme = useColorScheme();

  return (
    // 앱 전체에 테마를 적용합니다.
    // 다크 모드일 경우 DarkTheme, 아닐 경우 DefaultTheme을 사용
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      
      {/* ExpoRoot는 app 폴더를 자동으로 스캔해 라우팅을 구성
          require.context('./app')는 Webpack 문법으로,
          ./app 폴더의 파일들을 동적으로 불러와서 페이지로 연결해줍니다.
          예: app/login.js → /login 경로 자동 설정 */}
      <ExpoRoot context={require.context('./app')} />
    </ThemeProvider>
  );
}
