import { StyleSheet, View, Text, TouchableOpacity, useColorScheme, ScrollView, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    header: {
      marginTop: 24,
      marginBottom: 32,
    },
    heroSection: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logoContainer: {
      width: 100,
      height: 100,
      marginBottom: 24,
      shadowColor: '#0a7ea4',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
    logo: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    title: {
      fontSize: 36,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 24,
    },
    ctaButton: {
      backgroundColor: '#0a7ea4',
      paddingVertical: 18,
      paddingHorizontal: 32,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 40,
      shadowColor: '#0a7ea4',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
    ctaButtonText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: '700',
      marginLeft: 10,
    },
    statsContainer: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 16,
      padding: 20,
      marginBottom: 32,
      flexDirection: 'row',
      justifyContent: 'space-around',
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: '#0a7ea4',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    featureList: {
      gap: 12,
    },
    featureCard: {
      flexDirection: 'row',
      backgroundColor: colors.backgroundElement,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    featureIconContainer: {
      width: 40,
      height: 40,
      backgroundColor: isDark ? 'rgba(10, 126, 164, 0.2)' : 'rgba(10, 126, 164, 0.15)',
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    featureText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
      flex: 1,
      lineHeight: 20,
    },
  });

  const features = [
    { icon: 'flash', text: 'Instant form analysis with AI' },
    { icon: 'trending-up', text: 'Track improvements over time' },
    { icon: 'checkmark-done', text: 'Personalized feedback & cues' },
    { icon: 'save', text: 'Secure local history' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <View style={styles.scrollContent}>
          {/* Hero Section with Logo */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/formcritic-logo.png')}
                style={styles.logo}
              />
            </View>
            <Text style={styles.title}>FormCritic</Text>
            <Text style={styles.subtitle}>
              AI-powered form analysis for perfect workouts
            </Text>
          </View>

          {/* Primary CTA */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/record')}
            activeOpacity={0.85}
          >
            <Ionicons name="videocam" size={22} color="#ffffff" />
            <Text style={styles.ctaButtonText}>Start Recording</Text>
          </TouchableOpacity>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={[styles.statItem, { borderLeftWidth: 1, borderLeftColor: colors.backgroundSelected }]}>
              <Text style={styles.statNumber}>—</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
            <View style={[styles.statItem, { borderLeftWidth: 1, borderLeftColor: colors.backgroundSelected }]}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Hours</Text>
            </View>
          </View>

          {/* Features Section */}
          <Text style={styles.sectionTitle}>Why FormCritic?</Text>
          <View style={styles.featureList}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon as any} size={20} color="#0a7ea4" />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
