import {
  TouchableOpacity,
  View,
  StyleSheet,
  ViewStyle,
  Text,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface AppHeaderProps {
  style?: ViewStyle;
  title?: string;
}

export function AppHeader({ style, title }: AppHeaderProps) {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/(auth)");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <View style={[styles.header, style]}>
      <TouchableOpacity onPress={handleLogout} style={styles.button}>
        {title && <Text style={styles.text}>{title}</Text>}
        <Ionicons name="log-out-outline" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 2,
  },
  button: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    marginRight: 8,
    fontSize: 16, // Increased font size to make text more visible
    color: "#007AFF", // Added color to match icon
  },
});
