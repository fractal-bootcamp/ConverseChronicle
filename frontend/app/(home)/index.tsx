import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useTheme } from "@react-navigation/native";

export default function HomePage() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { colors } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={[styles.welcomeText, { color: colors.text }]}>
              Welcome back, {user?.firstName || "User"}!
            </Text>
            <TouchableOpacity
              style={[
                styles.signOutButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleSignOut}
            >
              <Text style={[styles.signOutText, { color: colors.card }]}>
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Your Daily Summary
          </Text>
          <Text style={[styles.cardText, { color: colors.text }]}>
            Here's what's new today...
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Quick Actions
          </Text>
          <View
            style={[styles.actionItem, { borderBottomColor: colors.border }]}
          >
            <Text style={{ color: colors.text }}>🎯 Complete your profile</Text>
          </View>
          <View
            style={[styles.actionItem, { borderBottomColor: colors.border }]}
          >
            <Text style={{ color: colors.text }}>📝 Add a new task</Text>
          </View>
          <View
            style={[styles.actionItem, { borderBottomColor: colors.border }]}
          >
            <Text style={{ color: colors.text }}>📊 View your statistics</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Recent Activity
          </Text>
          <Text style={[styles.cardText, { color: colors.text }]}>
            No recent activity to show.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "SpaceMono",
  },
  signOutButton: {
    alignSelf: "flex-end",
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  signOutText: {
    fontWeight: "bold",
    fontFamily: "SpaceMono",
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    fontFamily: "SpaceMono",
  },
  cardText: {
    fontSize: 16,
    fontFamily: "SpaceMono",
  },
  actionItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
});
