import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { Slot, Stack, useSegments, useRouter } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import LottieView from "lottie-react-native";

const themeColors = {
  matteBlue: "#2C3E50",
  lightBlue: "#007AFF",
  borderColor: "rgba(255, 255, 255, 0.3)",
  white: "#FFFFFF",
};

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
          <View style={styles.container}>
            <LottieView
              source={require("@/assets/animations/background-sparkles.json")}
              autoPlay
              loop
              style={styles.backgroundAnimation}
            />
            <RootLayoutNav />
          </View>
        </ThemeProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

function RootLayoutNav() {
  const { signOut, isSignedIn } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  // Only show logout in authenticated sections
  const showLogout = isSignedIn && segments[0] === "(home)";

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/(auth)");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Stack
      screenOptions={{
        headerRight: showLogout
          ? () => (
              <TouchableOpacity
                onPress={handleLogout}
                style={{ marginRight: 16 }}
              >
                <Ionicons
                  name="log-out-outline"
                  size={24}
                  color={themeColors.lightBlue}
                />
              </TouchableOpacity>
            )
          : undefined,
        headerStyle: {
          backgroundColor: themeColors.matteBlue,
        },
        headerTintColor: themeColors.white,
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(home)" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.matteBlue,
  },
  backgroundAnimation: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
});
