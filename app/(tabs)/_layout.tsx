import React from 'react';
import { Tabs } from 'expo-router';
import { Home, MessageSquare, PillIcon, Album, Users, Settings } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { FontSizes } from '@/constants/Fonts';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary[600],
        tabBarInactiveTintColor: Colors.gray[400],
        tabBarLabelStyle: {
          fontSize: FontSizes.sm,
          fontWeight: '500',
        },
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <MessageSquare size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="medication"
        options={{
          title: 'Medication',
          tabBarIcon: ({ color, size }) => (
            <PillIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="family/index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Users size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="family/settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          title: 'Memories',
          tabBarIcon: ({ color, size }) => (
            <Album size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}