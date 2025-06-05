import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Mail, Lock, ArrowRight } from 'lucide-react-native';
import Text from '@/components/typography/Text';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = () => {
    // Implement signup logic here
    router.push('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg' }}
          style={styles.logo}
        />
        <Text variant="h1" style={styles.title}>Create Account</Text>
        <Text variant="body" color={Colors.gray[600]} style={styles.subtitle}>
          Sign up to get started
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <User size={20} color={Colors.gray[400]} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Mail size={20} color={Colors.gray[400]} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color={Colors.gray[400]} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Text variant="caption" color={Colors.gray[600]} style={styles.terms}>
          By signing up, you agree to our Terms of Service and Privacy Policy
        </Text>

        <Button
          title="Create Account"
          size="large"
          onPress={handleSignup}
          icon={<ArrowRight size={20} color={Colors.white} />}
          style={styles.button}
          fullWidth
        />

        <View style={styles.footer}>
          <Text variant="body" color={Colors.gray[600]}>
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text variant="body" color={Colors.primary[600]} style={styles.loginText}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.xxxl,
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: 16,
  },
  terms: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  button: {
    marginBottom: Spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    marginLeft: Spacing.xs,
    fontWeight: 'bold',
  },
});