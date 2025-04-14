import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    'CustomFont': require('../assets/fonts/NotoSansKR-VariableFont_wght.ttf'),
  });

  if (!loaded) {
    return null; // 혹은 Splash, 로딩 인디케이터 반환 가능
  }

  return (
    <SafeAreaProvider>
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
        },
        headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
      }}
    />
    </SafeAreaProvider>
  );
}
