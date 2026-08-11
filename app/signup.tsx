import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import useTheme from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const { colors } = useTheme();
  const { signup } = useAuth();
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
      Alert.alert('Missing password', 'Please create a password.');
      return;
    }

    setLoading(true);
    const result = await signup(username, password);
    setLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Signup failed', result.message ?? 'Unable to create account.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}> 
      <StatusBar barStyle={colors.statusBarStyle} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Sign up to start tracking your Momentum+ tasks.</Text>

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
                placeholder="Please enter a password."
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
              style={[styles.button, { backgroundColor: colors.primary }]} 
              onPress={handleSubmit} 
              activeOpacity={0.8} 
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Creating account…' : 'Sign Up'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={[styles.linkText, { color: colors.primary }]}>Already have an account? Log in</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
});