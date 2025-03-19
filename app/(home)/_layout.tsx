import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={22} style={{ marginBottom: 2 }} {...props} />;
}

/**
 * React Component that displays the layout for the home screen
 * @returns HomeLayout
 */
export default function HomeLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].text,
        tabBarStyle: {backgroundColor: Colors[colorScheme ?? 'light'].background},
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="all"
        options={{
          title: 'All',
          tabBarIcon: ({ color }) => <TabBarIcon name="image" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="month"
        options={{
          title: 'Month',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="year"
        options={{
          title: 'Year',
          tabBarIcon: ({ color }) => <TabBarIcon name="bars" color={color} />,
          headerShown: false
        }}
      />
    </Tabs>
  );
}
