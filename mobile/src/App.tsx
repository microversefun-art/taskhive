import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import LoginScreen from './screens/auth/LoginScreen';
import HomeScreen from './screens/home/HomeScreen';
import JobsScreen from './screens/jobs/JobsScreen';
import JobDetailScreen from './screens/jobs/JobDetailScreen';
import ChatScreen from './screens/chat/ChatScreen';
import ChatDetailScreen from './screens/chat/ChatDetailScreen';
import ProfileScreen from './screens/profile/ProfileScreen';
import AchievementsScreen from './screens/achievements/AchievementsScreen';
import SubscriptionsScreen from './screens/subscriptions/SubscriptionsScreen';

// Navigation
import { useAuthStore } from './store/authStore';
import { trpcClient } from './services/trpc';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: true,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

// Home Stack
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#fff',
      },
      headerTintColor: '#000',
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}
  >
    <Stack.Screen 
      name="HomeMain" 
      component={HomeScreen}
      options={{ title: 'TaskHive' }}
    />
  </Stack.Navigator>
);

// Jobs Stack
const JobsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#fff',
      },
      headerTintColor: '#000',
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}
  >
    <Stack.Screen 
      name="JobsList" 
      component={JobsScreen}
      options={{ title: 'Вакансии' }}
    />
    <Stack.Screen 
      name="JobDetail" 
      component={JobDetailScreen}
      options={{ title: 'Детали вакансии' }}
    />
  </Stack.Navigator>
);

// Chat Stack
const ChatStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#fff',
      },
      headerTintColor: '#000',
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}
  >
    <Stack.Screen 
      name="ChatList" 
      component={ChatScreen}
      options={{ title: 'Чаты' }}
    />
    <Stack.Screen 
      name="ChatDetail" 
      component={ChatDetailScreen}
      options={{ title: 'Сообщения' }}
    />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#fff',
      },
      headerTintColor: '#000',
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}
  >
    <Stack.Screen 
      name="ProfileMain" 
      component={ProfileScreen}
      options={{ title: 'Профиль' }}
    />
    <Stack.Screen 
      name="Achievements" 
      component={AchievementsScreen}
      options={{ title: 'Достижения' }}
    />
    <Stack.Screen 
      name="Subscriptions" 
      component={SubscriptionsScreen}
      options={{ title: 'Подписки' }}
    />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#3B82F6',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingBottom: 5,
        paddingTop: 5,
      },
    }}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeStack}
      options={{
        tabBarLabel: 'Главная',
        tabBarIcon: ({ color }) => (
          <View style={{ width: 24, height: 24, backgroundColor: color }} />
        ),
      }}
    />
    <Tab.Screen 
      name="Jobs" 
      component={JobsStack}
      options={{
        tabBarLabel: 'Вакансии',
        tabBarIcon: ({ color }) => (
          <View style={{ width: 24, height: 24, backgroundColor: color }} />
        ),
      }}
    />
    <Tab.Screen 
      name="Chat" 
      component={ChatStack}
      options={{
        tabBarLabel: 'Чаты',
        tabBarIcon: ({ color }) => (
          <View style={{ width: 24, height: 24, backgroundColor: color }} />
        ),
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileStack}
      options={{
        tabBarLabel: 'Профиль',
        tabBarIcon: ({ color }) => (
          <View style={{ width: 24, height: 24, backgroundColor: color }} />
        ),
      }}
    />
  </Tab.Navigator>
);

// Root Navigator
const RootStack = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="MainApp" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

// Main App Component
export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <RootStack />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
