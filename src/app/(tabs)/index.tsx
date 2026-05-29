import { StyleSheet, View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-symbols';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      paddingHorizontal: 20,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? '#cccccc' : '#666666',
      marginBottom: 40,
      textAlign: 'center',
    },
    button: {
      backgroundColor: isDark ? '#0a7ea4' : '#0a7ea4',
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    featureList: {
      marginTop: 40,
      alignItems: 'flex-start',
      width: '100%',
    },
    feature: {
      flexDirection: 'row',
      marginVertical: 12,
      alignItems: 'center',
    },
    featureText: {
      fontSize: 14,
      color: isDark ? '#cccccc' : '#666666',
      marginLeft: 12,
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>FormCritic</Text>
        <Text style={styles.subtitle}>
          Record your exercise and get instant form feedback
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/record')}
          activeOpacity={0.8}
        >
          <Ionicons name="videocam" size={20} color="#ffffff" />
          <Text style={styles.buttonText}>Record Exercise</Text>
        </TouchableOpacity>

        <View style={styles.featureList}>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#0a7ea4" />
            <Text style={styles.featureText}>
              Automatic exercise detection
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#0a7ea4" />
            <Text style={styles.featureText}>
              AI-powered form analysis
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#0a7ea4" />
            <Text style={styles.featureText}>
              Real-time feedback & scoring
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#0a7ea4" />
            <Text style={styles.featureText}>
              Save & track your progress
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
