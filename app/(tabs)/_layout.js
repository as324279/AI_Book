
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 0,
          elevation: 10,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: '#6B4B39',
        tabBarInactiveTintColor: '#999',
      }}
    >
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
      <Tabs.Screen 
        name="community/index"
        options={{
          title: '커뮤니티',
          tabBarLabel: '커뮤니티',
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="challenge/index"
        options={{
          title: '챌린지',
          tabBarLabel: '챌린지',
          tabBarIcon: ({ color }) => (
            <Ionicons name="school-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="profile/index"
        options={{
          title: '계정',
          tabBarLabel: '계정',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
       <Tabs.Screen name="index" options={{ href: null }} /> 
    </Tabs>
  );
}
