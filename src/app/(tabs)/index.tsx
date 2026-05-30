import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
        <View style={{ width: 100, height: 100, backgroundColor: '#0a7ea4', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
          <Ionicons name="eye" size={50} color="#fff" />
        </View>
        <Text style={{ fontSize: 32, fontWeight: '700', color: isDark ? '#fff' : '#000', marginBottom: 16, textAlign: 'center' }}>
          FormCritic
        </Text>
        <Text style={{ fontSize: 16, color: isDark ? '#ccc' : '#666', marginBottom: 32, textAlign: 'center' }}>
          AI-powered form analysis for perfect workouts
        </Text>
        
        <TouchableOpacity
          style={{
            backgroundColor: '#0a7ea4',
            paddingVertical: 18,
            paddingHorizontal: 32,
            borderRadius: 16,
            marginBottom: 40,
          }}
          onPress={() => router.push('/record')}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
            Start Recording
          </Text>
        </TouchableOpacity>

        <View style={{ gap: 12, width: '100%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9', paddingHorizontal: 12, borderRadius: 8 }}>
            <Text style={{ fontSize: 14, color: isDark ? '#fff' : '#000', flex: 1 }}>✓ Instant form analysis with AI</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9', paddingHorizontal: 12, borderRadius: 8 }}>
            <Text style={{ fontSize: 14, color: isDark ? '#fff' : '#000', flex: 1 }}>✓ Track improvements over time</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9', paddingHorizontal: 12, borderRadius: 8 }}>
            <Text style={{ fontSize: 14, color: isDark ? '#fff' : '#000', flex: 1 }}>✓ Personalized feedback & cues</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9', paddingHorizontal: 12, borderRadius: 8 }}>
            <Text style={{ fontSize: 14, color: isDark ? '#fff' : '#000', flex: 1 }}>✓ Secure local history</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
