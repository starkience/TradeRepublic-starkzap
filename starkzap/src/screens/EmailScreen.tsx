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

export const EmailScreen: React.FC<Props> = ({ navigation }) => {
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
        <Text style={styles.title}>What's your email?</Text>
        <Text style={styles.subtitle}>
          We'll send you a verification code to confirm your identity.
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

        <TouchableOpacity onPress={() => navigation.navigate('LoginPin')}>
          <Text style={styles.switchText}>
            Already have an account? <Text style={styles.switchLink}>Log in</Text>
          </Text>
        </TouchableOpacity>
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
  button: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.lightText,
  },
  switchText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 20,
  },
  switchLink: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});
