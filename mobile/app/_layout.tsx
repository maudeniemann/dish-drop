import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/AuthContext';
import { Colors } from '../lib/constants';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: Colors.background,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile/[userId]"
          options={{
            title: 'Profile',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="restaurant/[restaurantId]"
          options={{
            title: 'Restaurant',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="post/[postId]"
          options={{
            title: 'Post',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="collection/[collectionId]"
          options={{
            title: 'Collection',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
