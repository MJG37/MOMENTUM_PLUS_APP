import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim()) {
      Alert.alert('Missing name', 'Please enter your name.');
      return;
    }

    if (!password) {
      Alert.alert('Missing password', 'Please enter your password.');
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Login failed', result.message ?? 'Unable to sign in.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}> 
      <StatusBar barStyle={colors.statusBarStyle} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboard}><ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/how-it-works')}><Ionicons name="arrow-back" size={23} color={colors.text} /></TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Log in to continue your Momentum+ tasks.</Text>

          <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.backgrounds.input }]}
              placeholder="Please enter your name."
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
            />
            <View style={[styles.passwordWrapper, { backgroundColor: colors.backgrounds.input }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                placeholder="Please enter your password."
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                if (!username.trim()) {
                  Alert.alert('Enter your name first', 'Enter the account name you want to recover.');
                  return;
                }
                router.push({ pathname: '/authentication-questions', params: { mode: 'recover', username: username.trim() } });
              }}
            >
              <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary }]} 
              onPress={handleSubmit} 
              activeOpacity={0.8} 
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Signing in…' : 'Log In'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/signup')}>
              <Text style={[styles.linkText, { color: colors.primary }]}>Don&apos;t have an account? Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView></KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
  },
  form: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    gap: 16,
  },
  input: {
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    paddingRight: 8,
    fontSize: 16,
  },
  eyeButton: {
    padding: 14,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  linkText: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },
  keyboard: { flex: 1 },
  backButton: { width: 44, height: 44, justifyContent: 'center' },
  forgotText: { textAlign: 'right', fontSize: 14, fontWeight: '700', marginTop: -6 },
});
