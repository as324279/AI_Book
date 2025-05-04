// main/_layout.js - 메인 화면의 탭 네비게이션을 정의합니다.
// 이 파일은 메인 화면에서 사용되는 하단 탭 바의 구조와 스타일을 설정합니다.
import { Tabs } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';

const MainLayout = ()=> {
  return (
    <Tabs
      screenOptions={{
        // 상단 헤더를 숨깁니다.
        headerShown: false,
        // 하단 탭 바의 스타일을 설정합니다.
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 0,
          elevation: 10,
          height: 60,
          paddingBottom: 10,
        },
        // 활성/비활성 탭의 색상을 설정합니다.
        tabBarActiveTintColor: '#6B4B39',
        tabBarInactiveTintColor: '#999',
      }}
    >
      {/* 홈 탭 */}
      <Tabs.Screen 
        name="MainHome"
        options={{
          title: '홈',
          tabBarLabel: '홈',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      {/* 커뮤니티 탭 */}
      <Tabs.Screen 
        name="community" 
        options={{
          title: '커뮤니티',
          tabBarLabel: '커뮤니티',
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={24} color={color} />
          ),
        }}
      />
      {/* 챌린지 탭 */}
      <Tabs.Screen 
        name="challenge"
        options={{
          title: '챌린지',
          tabBarLabel: '챌린지',
          tabBarIcon: ({ color }) => (
            <Ionicons name="school-outline" size={24} color={color} />
          ),
        }}
      />
      {/* 프로필 탭 */}
      <Tabs.Screen 
        name="profile" 
        options={{
          title: '계정',
          tabBarLabel: '계정',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen name="(screen)/profile/Genre-edit" options={{ href: null }} />
      <Tabs.Screen name="(screen)/profile/Edit-info" options={{ href: null }} />
      <Tabs.Screen name="(screen)/profile/Library" options={{ href: null }} />
      <Tabs.Screen name="(screen)/profile/Interest-edit" options={{ href: null }} /> 
      <Tabs.Screen name="(screen)/profile/Pw-check" options={{href: null}} />
      <Tabs.Screen name="(screen)/community/Post" options={{ href: null }} />
      <Tabs.Screen name="(screen)/community/Write" options={{ href: null }} />
      <Tabs.Screen name="(screen)/challenge/Detail" options={{ href: null }} />
      <Tabs.Screen name="(screen)/challenge/Create" options={{ href: null }} />
      <Tabs.Screen name="(screen)/CameraScreen" options={{ href: null }} />
      <Tabs.Screen name="(screen)/BookSearch" options={{ href: null }} />
      <Tabs.Screen name="(screen)/BookDetail" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
};
export default MainLayout;