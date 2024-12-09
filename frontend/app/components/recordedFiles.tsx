import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ENV } from "../config";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import LottieView from "lottie-react-native";

// interface for the audio file
interface Recording {
  id: string;
  createdAt: string;
  title: string;
  duration?: number;
  topics?: string[]; // todo: display this under title ?
}

// Update themeColors to match AudioRecorder
const themeColors = {
  primary: "#007AFF",
  secondary: "#2C3E50",
  accent: "#E67E22",
  background: "rgba(18, 18, 18, 0.95)",
  surface: "rgba(30, 30, 30, 0.8)",
  border: "rgba(255, 255, 255, 0.15)",
  text: "#FFFFFF",
  textSecondary: "rgba(255, 255, 255, 0.7)",
};

export function RecordedFiles() {
  const { getToken } = useAuth();
  const router = useRouter();

  // dark/light mode
  const { colors } = useTheme();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRecordingPress = (recording: Recording) => {
    router.push({
      pathname: "/recording-details",
      params: {
        recordingId: recording.id,
        title: recording.title,
      },
    });
  };
  // load files when the component mounts
  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      setError(null);
      const token = await getToken();
      const response = await fetch(`${ENV.prod}/recordings`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setRecordings(data.data);
    } catch (error) {
      console.error("Error fetching recordings:", error);
      setError("Failed to load recordings, please retry");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Pull to refresh handler
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchRecordings();
  }, []);

  // format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long", // "Monday"
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true, // for AM/PM
    });
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return "--:--";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.pageContainer}>
      <LottieView
        source={require("@/assets/animations/background-sparkles.json")}
        autoPlay
        loop
        style={styles.backgroundAnimation}
      />
      <View style={styles.container}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => router.push("/(home)")}
          >
            <Text style={styles.tabText}>Record</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, styles.activeTab]}
            onPress={() => router.push("/(home)/files")}
          >
            <Text style={[styles.tabText, styles.activeTabText]}>
              Recordings
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.contentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {isLoading && !refreshing && (
            <ActivityIndicator size="large" color={themeColors.primary} />
          )}
          {error && <Text style={styles.errorText}>{error}</Text>}
          {recordings.map((recording: Recording) => (
            <TouchableOpacity
              key={recording.id}
              style={styles.fileItem}
              onPress={() => handleRecordingPress(recording)}
            >
              <FontAwesome5
                name="user-friends"
                size={24}
                color={themeColors.text}
              />
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{recording.title}</Text>
                <View style={styles.metadataContainer}>
                  <Text style={styles.metadata}>
                    {formatDate(recording.createdAt)}
                  </Text>
                  <View style={styles.durationContainer}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={themeColors.textSecondary}
                      style={styles.timeIcon}
                    />
                    <Text style={styles.duration}>
                      {formatDuration(recording.duration)}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    padding: 16,
  },
  backgroundAnimation: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: themeColors.background,
    opacity: 0.8,
    zIndex: -20,
  },
  container: {
    flex: 1,
    borderRadius: 26,
    backgroundColor: themeColors.surface,
    overflow: "hidden",
    borderWidth: 0,
    borderColor: themeColors.border,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: themeColors.textSecondary,
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: themeColors.text,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "600",
    color: themeColors.text,
    letterSpacing: 0.5,
  },
  metadata: {
    fontSize: 12,
    color: themeColors.textSecondary,
    letterSpacing: 0.5,
  },
  duration: {
    fontSize: 12,
    color: themeColors.textSecondary,
    letterSpacing: 0.5,
  },
  errorText: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 16,
    color: themeColors.accent,
    letterSpacing: 0.5,
  },
  metadataContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    marginRight: 4,
  },
});
