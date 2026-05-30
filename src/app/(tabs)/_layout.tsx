import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

const colors = {
  light: { tint: '#0a7ea4', tabIconDefault: '#687076', tabIconSelected: '#0a7ea4' },
  dark: { tint: '#fff', tabIconDefault: '#9BA1A6', tabIconSelected: '#fff' },
};

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const { tint, tabIconDefault, tabIconSelected } = colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabIconSelected,
        tabBarInactiveTintColor: tabIconDefault,
        tabBarStyle: {
          borderTopColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: 'Record',
          tabBarIcon: ({ color }) => <Ionicons name="videocam" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <Ionicons name="list" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
