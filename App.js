import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import HomeScreen from './screens/HomeScreen';

const Stack = createNativeStackNavigator();

const APP_OWNER = {
  name: 'Nadav Golan-Yanay',
  title: 'Founder',
  contact: 'nadavgy1@gmail.com',
  github: 'https://github.com/nadav-golan-yanay',
  thanks: 'Thanks to VSCode and Copilot for making development a breeze!',
};

const APP_VERSION = '1.0.1';

export default function App() {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (isBooting) {
    return (
      <View style={styles.splashWrap}>
        <StatusBar style="light" />
        <Text style={styles.splashTitle}>Bearing Finder</Text>
        <Text style={styles.splashTagline}>Navigate with confidence</Text>
        <Text style={styles.splashVersion}>Version {APP_VERSION}</Text>

        <View style={styles.ownerCard}>
          <Text style={styles.ownerLabel}>Built by</Text>
          <Text style={styles.ownerName}>{APP_OWNER.name}</Text>
          <Text style={styles.ownerMeta}>{APP_OWNER.title}</Text>
          <Text style={styles.ownerMeta}>{APP_OWNER.contact}</Text>
        </View>

        <ActivityIndicator size="large" color="#e94560" style={styles.loader} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#16213e' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="Bearing" options={{ title: 'Bearing Finder' }}>
          {(props) => <HomeScreen {...props} appOwner={APP_OWNER} appVersion={APP_VERSION} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashWrap: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  splashTitle: {
    color: '#f8fafc',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  splashTagline: {
    color: '#94a3b8',
    marginTop: 6,
    fontSize: 14,
    marginBottom: 4,
  },
  splashVersion: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 24,
  },
  ownerCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#111827',
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  ownerLabel: {
    color: '#64748b',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  ownerName: {
    marginTop: 6,
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '700',
  },
  ownerMeta: {
    marginTop: 4,
    color: '#cbd5e1',
    fontSize: 13,
  },
  loader: {
    marginTop: 26,
  },
});
