import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { Slot, Stack, useSegments, useRouter } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) return null;

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <ClerkLoaded>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(home)" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
