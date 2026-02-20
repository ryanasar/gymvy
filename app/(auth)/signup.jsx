import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useNetwork } from '@/contexts/NetworkContext';

export default function SignUpScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { isOffline } = useNetwork();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setError('');

    if (isOffline) {
      setError('You are offline. Please connect to the internet to sign up.');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options: {
        emailRedirectTo: 'gymvy://auth'
      } });

      if (error) {
        setError(error.message);
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        // Supabase returns empty identities array when email already exists
        setError('An account with this email already exists. Please log in instead.');
      } else {
        Alert.alert('Success', 'Check your email to confirm your account.');
        router.back();
      }
    } catch (networkError) {
      setError('Network error. Please check your connection and try again.');
    }
  };

  const handleLoginNavigate = () => {
    router.back();
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.formContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>Sign up to get started</Text>

            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={colors.placeholder}
              value={email}
              onChangeText={setEmail}
              maxLength={100}
              autoCorrect={false}
            />

            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
              placeholder="Password"
              autoCapitalize="none"
              secureTextEntry
              placeholderTextColor={colors.placeholder}
              value={password}
              onChangeText={setPassword}
              maxLength={128}
              autoCorrect={false}
            />

            <TouchableOpacity
              style={styles.ageCheckboxRow}
              onPress={() => setAgeConfirmed(!ageConfirmed)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, { borderColor: colors.border }, ageConfirmed && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                {ageConfirmed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.ageText, { color: colors.secondaryText }]}>
                I confirm that I am at least 13 years old
              </Text>
            </TouchableOpacity>

            {isOffline && (
              <View style={styles.offlineWarning}>
                <Text style={styles.offlineText}>You are offline</Text>
              </View>
            )}

            {error ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }, !ageConfirmed && { opacity: 0.5 }]}
              onPress={handleSignup}
              disabled={!ageConfirmed}
            >
              <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLoginNavigate}>
              <Text style={[styles.signupText, { color: colors.secondaryText }]}>
                Already have an account? <Text style={[styles.signupLink, { color: colors.primary }]}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  formContainer: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  primaryButtonText: {
    fontWeight: '600',
    fontSize: 18,
    textAlign: 'center',
  },
  signupText: {
    textAlign: 'center',
    fontSize: 14,
  },
  signupLink: {
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  ageCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: -1,
  },
  ageText: {
    fontSize: 14,
    flex: 1,
  },
  offlineWarning: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineText: {
    color: '#FCD34D',
    fontSize: 14,
    fontWeight: '500',
  },
});
