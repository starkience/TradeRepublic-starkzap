import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

import { WelcomeScreen } from '../screens/WelcomeScreen';
import { PhoneScreen } from '../screens/PhoneScreen';
import { VerifyScreen } from '../screens/VerifyScreen';
import { CountryScreen } from '../screens/CountryScreen';
import { PinSetupScreen } from '../screens/PinSetupScreen';
import { PinConfirmScreen } from '../screens/PinConfirmScreen';
import { PersonalInfoScreen } from '../screens/PersonalInfoScreen';
import { EmailScreen } from '../screens/EmailScreen';
import { LoginPinScreen } from '../screens/LoginPinScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { BrowseScreen } from '../screens/BrowseScreen';
import { TransferScreen } from '../screens/TransferScreen';
import { AssetDetailScreen } from '../screens/AssetDetailScreen';
import { StakeAmountScreen } from '../screens/StakeAmountScreen';
import { StakeConfirmScreen } from '../screens/StakeConfirmScreen';
import { StakeSuccessScreen } from '../screens/StakeSuccessScreen';

const Stack = createNativeStackNavigator();

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={tabStyles.container}>
      <View style={tabStyles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (route.name === 'Dashboard') {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={tabStyles.tab}
                activeOpacity={0.7}
              >
                <View style={tabStyles.homeTab}>
                  <Text
                    style={[
                      tabStyles.homeLabel,
                      isFocused && tabStyles.homeLabelActive,
                    ]}
                  >
                    Watchlist
                  </Text>
                  <Ionicons
                    name="add-circle-outline"
                    size={16}
                    color={Colors.textSecondary}
                    style={{ marginTop: 2 }}
                  />
                </View>
              </TouchableOpacity>
            );
          }

          const label = route.name === 'Browse' ? 'Browse' : 'Transfer';
          const iconName: keyof typeof Ionicons.glyphMap =
            route.name === 'Browse' ? 'search' : 'swap-vertical-outline';

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={tabStyles.tab}
              activeOpacity={0.7}
            >
              <View
                style={[
                  tabStyles.pillTab,
                  isFocused && tabStyles.pillTabActive,
                ]}
              >
                <Text
                  style={[
                    tabStyles.pillLabel,
                    isFocused && tabStyles.pillLabelActive,
                  ]}
                >
                  {label}
                </Text>
                <Ionicons
                  name={iconName}
                  size={16}
                  color={isFocused ? Colors.lightText : Colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Browse" component={BrowseScreen} />
      <Tab.Screen name="Transfer" component={TransferScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_bottom',
        gestureEnabled: true,
        gestureDirection: 'vertical',
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ animation: 'none', gestureEnabled: false }}
      />
      <Stack.Screen name="Phone" component={PhoneScreen} />
      <Stack.Screen name="Verify" component={VerifyScreen} />
      <Stack.Screen name="Country" component={CountryScreen} />
      <Stack.Screen name="PinSetup" component={PinSetupScreen} />
      <Stack.Screen name="PinConfirm" component={PinConfirmScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="Email" component={EmailScreen} />
      <Stack.Screen
        name="LoginPin"
        component={LoginPinScreen}
        options={{
          animation: 'slide_from_right',
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{
          animation: 'fade',
          gestureEnabled: false,
          fullScreenGestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="AssetDetail"
        component={AssetDetailScreen}
        options={{
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
      <Stack.Screen
        name="StakeAmount"
        component={StakeAmountScreen}
        options={{
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
      <Stack.Screen
        name="StakeConfirm"
        component={StakeConfirmScreen}
        options={{
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
      <Stack.Screen
        name="StakeSuccess"
        component={StakeSuccessScreen}
        options={{
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
    </Stack.Navigator>
  );
};

const tabStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 34,
    paddingTop: 8,
    paddingHorizontal: 14,
    backgroundColor: Colors.background,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tab: {
    flex: 1,
  },
  pillTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  pillTabActive: {
    backgroundColor: Colors.white,
  },
  pillLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  pillLabelActive: {
    color: Colors.lightText,
  },
  homeTab: {
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  homeLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  homeLabelActive: {
    color: Colors.textPrimary,
  },
});
