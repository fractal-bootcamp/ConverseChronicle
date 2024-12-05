import { Tabs } from "expo-router"; // import navigation
import { Ionicons } from "@expo/vector-icons";

// main layout for the home screen
export default function HomeLayout() {
  return (
    <Tabs
      // tab bar appearance
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        headerShown: true,
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
