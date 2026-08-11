import useTheme from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { Image, ImageBackground, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const { colors, isDarkMode } = useTheme();
  const router = useRouter();

  const backgroundSource = isDarkMode
    ? require('../assets/images/background-dark.png')
    : require('../assets/images/background-white.png');
  const logoSource = require('../assets/images/icon.png.png');

  return (
    <ImageBackground source={backgroundSource} style={[styles.background, { backgroundColor: colors.bg }]} resizeMode="cover">
      <StatusBar barStyle={colors.statusBarStyle} translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.surface }]}> 
            <View style={[styles.logoWrapper, { backgroundColor: colors.surface }]}> 
              <Image source={logoSource} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={[styles.heading, { color: colors.text }]}>Welcome to Momentum+</Text>
            <Text style={[styles.subheading, { color: colors.textMuted }]}>Complete tasks. Earn rewards. Build better habits every day.</Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/how-it-works')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 32,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 8,
  },
  logoWrapper: {
    width: 96,
    height: 96,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  logoImage: {
    width: 64,
    height: 64,
  },
  heading: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
  },
  subheading: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    width: '100%',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});