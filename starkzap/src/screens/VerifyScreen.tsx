import React, { useState, useRef, useEffect } from 'react';
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
import { useAuth } from '../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

interface Props {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
}

export const VerifyScreen: React.FC<Props> = ({ navigation, route }) => {
  const email = (route.params as any)?.email || '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { login, setEmail: saveEmail } = useAuth();

  const { sendCode, loginWithCode } = useLoginWithEmail({
    onLoginSuccess: () => {
      saveEmail(email);
      login();
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.message || 'Invalid code');
      setLoading(false);
    },
  });

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    await loginWithCode({ code });
    setLoading(false);
  };

  const handleResend = async () => {
    await sendCode({ email });
    Alert.alert('Code sent', 'A new verification code has been sent.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Enter code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to {email}
        </Text>

        <View style={styles.codeContainer}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={[styles.codeBox, code.length === i && styles.codeBoxActive]}>
              <Text style={styles.codeDigit}>{code[i] || ''}</Text>
            </View>
          ))}
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={code}
            onChangeText={(text) => {
              const clean = text.replace(/[^0-9]/g, '').slice(0, 6);
              setCode(clean);
            }}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
        </View>

        <TouchableOpacity onPress={handleResend} style={styles.resendBtn}>
          <Text style={styles.resendText}>Resend code</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />

        <TouchableOpacity
          style={[styles.button, code.length !== 6 && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading || code.length !== 6}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verifying...' : 'Verify'}
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
    paddingBottom: 20,
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    position: 'relative',
  },
  codeBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  codeBoxActive: {
    borderColor: Colors.textPrimary,
  },
  codeDigit: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
  },
  resendBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  spacer: {
    flex: 1,
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
