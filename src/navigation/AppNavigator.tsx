import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList, MainStackParamList } from '../types/navigation';
import { colors } from '../theme';

// Screens
import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';
import DashboardScreen from '../screens/DashboardScreen';
import NewSessionScreen from '../screens/NewSessionScreen';
import LiveRecordingScreen from '../screens/LiveRecordingScreen';
import ProcessingScreen from '../screens/ProcessingScreen';
import SummaryScreen from '../screens/SummaryScreen';
import SettingsScreen from '../screens/SettingsScreen';

// ============================================
// STACK NAVIGATORS
// ============================================
const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

// ============================================
// MAIN NAVIGATOR (Authenticated)
// ============================================
function MainNavigator() {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <MainStack.Screen name="Dashboard" component={DashboardScreenWrapper} />
      <MainStack.Screen name="NewSession" component={NewSessionScreenWrapper} />
      <MainStack.Screen 
        name="LiveRecording" 
        component={LiveRecordingScreenWrapper}
        options={{ gestureEnabled: false }}
      />
      <MainStack.Screen 
        name="Processing" 
        component={ProcessingScreenWrapper}
        options={{ gestureEnabled: false }}
      />
      <MainStack.Screen name="Summary" component={SummaryScreenWrapper} />
      <MainStack.Screen name="Settings" component={SettingsScreenWrapper} />
    </MainStack.Navigator>
  );
}

// ============================================
// SCREEN WRAPPERS
// ============================================
function DashboardScreenWrapper({ navigation }: any) {
  return (
    <DashboardScreen
      onNewSession={() => navigation.navigate('NewSession')}
      onSessionPress={(sessionId) => navigation.navigate('Summary', { sessionId })}
      onSettingsPress={() => navigation.navigate('Settings')}
    />
  );
}

function NewSessionScreenWrapper({ navigation }: any) {
  return (
    <NewSessionScreen
      onBack={() => navigation.goBack()}
      onStartRecording={(title, goal) => {
        // In a real app, create session first then navigate
        navigation.navigate('LiveRecording', { 
          sessionId: 'temp-' + Date.now(),
          title,
          goal,
        });
      }}
    />
  );
}

function LiveRecordingScreenWrapper({ navigation, route }: any) {
  return (
    <LiveRecordingScreen
      sessionId={route.params?.sessionId}
      title={route.params?.title}
      goal={route.params?.goal}
      onEnd={(transcript, duration) => {
        navigation.replace('Processing', { 
          sessionId: route.params?.sessionId,
        });
      }}
    />
  );
}

function ProcessingScreenWrapper({ navigation, route }: any) {
  return (
    <ProcessingScreen
      sessionId={route.params?.sessionId}
      onComplete={() => {
        navigation.replace('Summary', { 
          sessionId: route.params?.sessionId,
        });
      }}
      onCancel={() => navigation.navigate('Dashboard')}
    />
  );
}

function SummaryScreenWrapper({ navigation, route }: any) {
  return (
    <SummaryScreen
      sessionId={route.params?.sessionId}
      onBack={() => navigation.navigate('Dashboard')}
    />
  );
}

function SettingsScreenWrapper({ navigation }: any) {
  const { signOut } = useAuth();
  
  return (
    <SettingsScreen
      onBack={() => navigation.goBack()}
      onSignOut={async () => {
        await signOut();
      }}
    />
  );
}

// ============================================
// AUTH NAVIGATOR
// ============================================
function AuthNavigator() {
  const { signIn, loginWithGoogle } = useAuth();

  return (
    <AuthScreen
      onLogin={signIn}
      onGoogleLogin={loginWithGoogle}
    />
  );
}

// ============================================
// ROOT NAVIGATOR
// ============================================
export default function AppNavigator() {
  const { isAuthenticated, initialized, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // Show splash for minimum time
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Show loading while initializing
  if (!initialized || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {showSplash ? (
          <RootStack.Screen name="Splash">
            {() => <SplashScreen onFinish={() => setShowSplash(false)} />}
          </RootStack.Screen>
        ) : isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
