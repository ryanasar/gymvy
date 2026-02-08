import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // The deep link handler in auth.tsx will have already set the session
    // by the time we navigate here. Check for an active session.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsReady(true);
      } else {
        // Wait briefly for the session to be set from the deep link
        const timeout = setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession) {
            setIsReady(true);
          } else {
            setError('Invalid or expired reset link. Please request a new one.');
          }
        }, 2000);
        return () => clearTimeout(timeout);
      }
    };
    checkSession();
  }, []);

  const handleResetPassword = async () => {
    if (!password.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          <View style={[styles.successIconContainer, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="checkmark-circle-outline" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Password Updated</Text>
          <Text style={[styles.successText, { color: colors.secondaryText }]}>
            Your password has been successfully reset. You can now log in with your new password.
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!isReady && !error) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.secondaryText }]}>Verifying reset link...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
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
            <Text style={[styles.title, { color: colors.text }]}>Set New Password</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              Enter your new password below.
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
              placeholder="New Password"
              autoCapitalize="none"
              secureTextEntry
              placeholderTextColor={colors.placeholder}
              value={password}
              onChangeText={setPassword}
              autoFocus
            />

            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
              placeholder="Confirm Password"
              autoCapitalize="none"
              secureTextEntry
              placeholderTextColor={colors.placeholder}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }, isLoading && styles.primaryButtonDisabled]}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>Reset Password</Text>
              )}
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
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  formContainer: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 32,
    lineHeight: 22,
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
    marginBottom: 16,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontWeight: '600',
    fontSize: 18,
    textAlign: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});
