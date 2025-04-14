import 'expo-router/entry';
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

// expo-router는 자동으로 이 컴포넌트를 찾아 렌더링합니다
export default function App() {
  return <ExpoRoot context={require.context('./app')} />;
}

registerRootComponent(App);
