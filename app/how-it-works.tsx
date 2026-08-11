import useTheme from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ImageBackground, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const steps = [
  {
    title: 'Add a Task',
    description: 'Add tasks you need to complete to stay on track.',
    icon: 'clipboard-outline',
  },
  {
    title: 'Complete Your Task',
    description: 'Focus and complete your tasks within the set time.',
    icon: 'checkmark-done-outline',
  },
  {
    title: 'Earn Rewards',
    description: 'Earn points for completing tasks and building good habits.',
    icon: 'star-outline',
  },
  {
    title: 'Redeem Rewards',
    description: 'Use your points to unlock screen time and other rewards.',
    icon: 'gift-outline',
  },
  {
    title: 'Track Progress',
    description: 'View your progress and keep improving every day.',
    icon: 'analytics-outline',
  },
];

export default function HowItWorksScreen() {
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  const router = useRouter();

  const backgroundSource = isDarkMode
    ? require('../assets/images/background-dark.png')
    : require('../assets/images/background-white.png');

  return (
    <ImageBackground source={backgroundSource} style={styles.background} resizeMode="cover">
      <StatusBar barStyle={colors.statusBarStyle} translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={[styles.content, { flexGrow: 1, justifyContent: 'center' }]}>
          <View style={[styles.header, { borderColor: colors.border }]}> 
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>How it works</Text>
            <TouchableOpacity style={[styles.modeButton, { backgroundColor: colors.primary }]} onPress={toggleDarkMode} activeOpacity={0.8}>
              <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={18} color="#fff" />
              <Text style={styles.modeButtonText}>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</Text>
            </TouchableOpacity>
          </View>

          {steps.map((step, index) => (
            <View key={step.title} style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
              <View style={[styles.stepIcon, { backgroundColor: colors.primary }]}> 
                <Ionicons name={step.icon as any} size={20} color="#fff" />
              </View>
              <View style={styles.stepText}>
                <Text style={[styles.stepLabel, { color: colors.text }]}>{`${index + 1}. ${step.title}`}</Text>
                <Text style={[styles.stepDescription, { color: colors.textMuted }]}>{step.description}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={[styles.continueButton, { backgroundColor: colors.primary }]} onPress={() => router.push('/login')} activeOpacity={0.8}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  modeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    marginBottom: 14,
  },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  stepText: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  continueButton: {
    marginTop: 10,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
