import 'react-native-get-random-values';
import 'fast-text-encoding';
import React, { useContext, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PrivyProvider, PrivyContext } from '@privy-io/expo';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { PRIVY_APP_ID, PRIVY_CLIENT_ID } from './src/services/privyAuth';
import { resetWallet } from './src/services/starkzapService';

function AppInner() {
  const privy = useContext(PrivyContext);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        resetWallet();
        if (privy && typeof privy.logout === 'function') {
          await privy.logout();
        }
      } catch (_) {}
      setCleared(true);
    })();
  }, []);

  if (!cleared) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <PrivyProvider appId={PRIVY_APP_ID} clientId={PRIVY_CLIENT_ID}>
      <SafeAreaProvider>
        <AppInner />
      </SafeAreaProvider>
    </PrivyProvider>
  );
}
