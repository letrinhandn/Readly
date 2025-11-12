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
  Image,

} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import supabase from '@/lib/supabase';

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (isSignUp && password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        console.log('Attempting to sign up...');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || 'Reader',
            },
            emailRedirectTo: undefined,
          },
        });

        if (error) {
          console.error('Sign up error:', error);
          throw error;
        }

        console.log('Sign up successful:', data.user?.id);
        console.log('Sign up session:', data.session);

        if (data.user) {
          console.log('Creating user profile...');
          const { error: profileError } = await supabase.from('user_profiles').insert({
            id: data.user.id,
            name: name || 'Reader',
            bio: 'Keep up the great reading habit!',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            if (profileError.code === '23505') {
              Alert.alert('Notice', 'Profile already exists. You can now sign in.');
            } else {
              Alert.alert('Error', `Failed to create profile: ${profileError.message || 'Unknown error'}`);
            }
          } else {
            console.log('Profile created successfully');
          }

          if (data.session) {
            Alert.alert('Success', 'Account created successfully!', [
              { text: 'OK', onPress: () => router.replace('/(tabs)') },
            ]);
          } else {
            Alert.alert(
              'Check Your Email',
              'Please check your email and click the confirmation link to complete registration. After confirming, come back and sign in.',
              [{ text: 'OK', onPress: () => setIsSignUp(false) }]
            );
          }
        }
      } else {
        console.log('Attempting to sign in...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Sign in error:', error);
          if (error.message.includes('Email not confirmed')) {
            Alert.alert(
              'Email Not Confirmed',
              'Please check your email and click the confirmation link before signing in. Check your spam folder if you don\'t see it.',
              [{ text: 'OK' }]
            );
            setLoading(false);
            return;
          } else if (error.message.includes('Invalid login credentials')) {
            Alert.alert(
              'Invalid Credentials',
              'The email or password you entered is incorrect. Please try again or sign up for a new account.',
              [{ text: 'OK' }]
            );
            setLoading(false);
            return;
          }
          throw error;
        }

        console.log('Sign in successful:', data.user?.id);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      Alert.alert('Error', error.message || 'Authentication failed. Please check your connection and try again.');
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
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/3gv9je3qq4xne7i2rncz7' }}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Readly</Text>
            <Text style={styles.subtitle}>Track your reading journey</Text>
          </View>

          <View style={styles.form}>
            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            )}

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
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            )}

            {!isSignUp && (
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => router.push('/forgot-password')}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                setIsSignUp(!isSignUp);
                setConfirmPassword('');
                setName('');
              }}
            >
              <Text style={styles.switchText}>
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Sign Up"}
              </Text>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
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
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  switchButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: '#666',
  },
  forgotPasswordButton: {
    alignItems: 'flex-end',
    marginTop: -12,
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600' as const,
  },
});
