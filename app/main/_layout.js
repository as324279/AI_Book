// main/_layout.js - 메인 화면의 탭 네비게이션을 정의합니다.
// 이 파일은 메인 화면에서 사용되는 하단 탭 바의 구조와 스타일을 설정합니다.
import { Tabs } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function MainLayout() {
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
        name="index" 
        options={{
          title: '홈',
          tabBarLabel: '홈',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />
      {/* 커뮤니티 탭 */}
      <Tabs.Screen 
        name="community/index" 
        options={{
          title: '커뮤니티',
          tabBarLabel: '커뮤니티',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="people" size={24} color={color} />
          ),
        }}
      />
      {/* 챌린지 탭 */}
      <Tabs.Screen 
        name="challenge/index" 
        options={{
          title: '챌린지',
          tabBarLabel: '챌린지',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="emoji-events" size={24} color={color} />
          ),
        }}
      />
      {/* 프로필 탭 */}
      <Tabs.Screen 
        name="profile/index" 
        options={{
          title: '계정',
          tabBarLabel: '계정',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen name="profile/genre-edit" options={{ href: null }} />
      <Tabs.Screen name="profile/edit-info" options={{ href: null }} />
      <Tabs.Screen name="profile/library" options={{ href: null }} />
      <Tabs.Screen name="profile/interest-edit" options={{ href: null }} /> 
      <Tabs.Screen name="community/post" options={{ href: null }} />
      <Tabs.Screen name="community/write" options={{ href: null }} />
      <Tabs.Screen name="challenge/detail" options={{ href: null }} />
      <Tabs.Screen name="challenge/create" options={{ href: null }} />
    </Tabs>
  );
} 