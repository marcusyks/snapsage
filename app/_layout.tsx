import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '/index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

/**
 * Navigation stack for the application
 * @returns {RootLayoutNav} - Returns the navigation stack for the application
 */
function RootLayoutNav() {
  return (
    <ThemeProvider value={DarkTheme}>
      <Stack screenOptions={{
        headerShown: false,
        }}
      >
        <Stack.Screen name="(home)"/>
        <Stack.Screen name="month/[yearMonth]" options={{ presentation: 'card'}} />
        <Stack.Screen name="year/[year]" options={{ presentation: 'card'}} />
        <Stack.Screen name="image/[asset]" options={{ presentation: 'card'}} />
      </Stack>
    </ThemeProvider>
  );
}
