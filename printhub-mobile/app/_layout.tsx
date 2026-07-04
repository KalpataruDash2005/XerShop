import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { Colors } from '@/src/constants/Colors';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Inter: require('@/src/assets/fonts/Inter-Regular.ttf'),
    InterMedium: require('@/src/assets/fonts/Inter-Medium.ttf'),
    InterSemiBold: require('@/src/assets/fonts/Inter-SemiBold.ttf'),
    InterBold: require('@/src/assets/fonts/Inter-Bold.ttf'),
    PoppinsMedium: require('@/src/assets/fonts/Poppins-Medium.ttf'),
    PoppinsSemiBold: require('@/src/assets/fonts/Poppins-SemiBold.ttf'),
    PoppinsBold: require('@/src/assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="shops/[id]" options={{ headerShown: true, title: 'Shop Details' }} />
          <Stack.Screen name="orders/[id]" options={{ headerShown: true, title: 'Order Details' }} />
          <Stack.Screen name="upload/index" options={{ headerShown: true, title: 'Upload' }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
