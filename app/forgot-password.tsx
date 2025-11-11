import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import supabase from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      console.log('Sending password reset email to:', email);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'readly://reset-password',
      });

      if (error) {
        console.error('Reset password error:', error);
        throw error;
      }

      console.log('Password reset email sent successfully');
      Alert.alert(
        'Check Your Email',
        'We\'ve sent you a password reset link. Please check your email (including spam folder) and follow the instructions to reset your password.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Reset password error:', error);
      Alert.alert('Error', error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1A1A1A" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backToLoginText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 24,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#1A1A1A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  button: {
    height: 52,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  backToLoginButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: 14,
    color: '#666',
  },
});
