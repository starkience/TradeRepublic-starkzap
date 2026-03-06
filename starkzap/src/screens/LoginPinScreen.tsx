import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { BackButton } from '../components/BackButton';
import { useLoginWithEmail } from '@privy-io/expo';
import { PrivyContext } from '@privy-io/expo';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export const LoginPinScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const privy = useContext(PrivyContext);

  const { sendCode } = useLoginWithEmail({
    onSendCodeSuccess: () => {
      navigation.navigate('Verify', { email });
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.message || 'Failed to send code');
      setLoading(false);
    },
  });

  const handleSendCode = async () => {
    if (!email.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      if (privy && typeof privy.logout === 'function') {
        await privy.logout().catch(() => {});
      }
    } catch {}
    await sendCode({ email });
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Log in</Text>
        <Text style={styles.subtitle}>
          Enter your email address to receive a login code.
        </Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          placeholderTextColor={Colors.placeholder}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.spacer} />

        <View style={styles.bottomSection}>
          <TouchableOpacity onPress={() => navigation.navigate('Email')}>
            <Text style={styles.switchText}>
              Don't have an account? <Text style={styles.switchLink}>Sign up</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, !email.includes('@') && styles.buttonDisabled]}
            onPress={handleSendCode}
            disabled={loading || !email.includes('@')}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Sending...' : 'Send code'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 30,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  spacer: {
    flex: 1,
  },
  bottomSection: {
    paddingBottom: 20,
    gap: 12,
  },
  switchText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 14,
  },
  switchLink: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  button: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.lightText,
  },
});
