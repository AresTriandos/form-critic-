import { StyleSheet, View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-symbols';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RecordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomColor: isDark ? '#333' : '#e5e5e5',
      borderBottomWidth: 1,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#000000',
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    largeButton: {
      backgroundColor: '#0a7ea4',
      width: 160,
      height: 160,
      borderRadius: 80,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    hint: {
      fontSize: 14,
      color: isDark ? '#aaaaaa' : '#888888',
      textAlign: 'center',
      marginTop: 16,
      maxWidth: 280,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Record Exercise</Text>
      </View>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.largeButton}
          onPress={() => router.push('/record/camera')}
          activeOpacity={0.8}
        >
          <Ionicons name="videocam" size={60} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.hint}>
          Tap to start recording your exercise. Record 5-30 seconds for best results.
        </Text>
      </View>
    </SafeAreaView>
  );
}
