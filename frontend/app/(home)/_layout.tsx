import { Tabs } from "expo-router"; // import navigation
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/app/components/AppHeader";

// main layout for the home screen
export default function HomeLayout() {
  return (
    <Tabs
      // tab bar appearance
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        headerShown: true,
        headerRight: () => <AppHeader title="" />,
        headerStyle: {
          height: 120,
        },
        headerTitleStyle: {
          fontSize: 20,
        },
        tabBarStyle: {
          height: 95, // Increased height from default ~50
          paddingBottom: 10, // Add some padding at bottom for comfort
          paddingTop: 15, // Add some padding at top
        },
      }}
    >
      {/* record screen here */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Record",
          tabBarIcon: ({ color }) => (
            <Ionicons name="mic" size={24} color={color} />
          ),
        }}
      />
      {/* files screen here */}
      <Tabs.Screen
        name="files"
        options={{
          title: "Recordings",
          tabBarIcon: ({ color }) => (
            <Ionicons name="document-text" size={24} color={color} />
          ),
        }}
      />
      {/* editor screen here */}
      <Tabs.Screen
        name="editor"
        options={{
          title: "Notes",
          tabBarIcon: ({ color }) => (
            <Ionicons name="create" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
