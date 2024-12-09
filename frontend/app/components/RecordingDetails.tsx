import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import { ENV } from "../config";

interface Utterance {
  id: string;
  speaker: string;
  transcript: string;
  start: number;
  end: number;
}

interface RecordingDetailsData {
  id: string;
  title: string;
  createdAt: string;
  duration: number;
  summary?: string;
  transcript?: string;
  utterances?: Utterance[];
}

export default function RecordingDetails({
  recordingId,
}: {
  recordingId: string;
}) {
  const { colors } = useTheme();
  const { getToken } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordingDetails, setRecordingDetails] =
    useState<RecordingDetailsData | null>(null);

  useEffect(() => {
    fetchRecordingDetails();
  }, []);

  const fetchRecordingDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      const response = await fetch(`${ENV.prod}/recordings/${recordingId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recording details");
      }

      const data = await response.json();
      console.log(`recording details`, data);
      setRecordingDetails(data.data);
    } catch (error) {
      console.error("Error fetching recording details:", error);
      setError("Failed to load recording details");
    } finally {
      setIsLoading(false);
    }
  };

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

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error}
          </Text>
        </View>
      ) : recordingDetails ? (
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={[styles.title, { color: colors.text }]}>
              {recordingDetails.title}
            </Text>
            <View style={styles.metadataContainer}>
              <View style={styles.dateTimeContainer}>
                <Text style={[styles.metadata, { color: colors.text + "80" }]}>
                  {formatDate(recordingDetails.createdAt)}
                </Text>
              </View>
              <View style={styles.durationContainer}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={colors.text + "80"}
                  style={styles.timeIcon}
                />
                <Text style={[styles.duration, { color: colors.text + "80" }]}>
                  {formatDuration(recordingDetails.duration)}
                </Text>
              </View>
            </View>
          </View>

          {/* Summary Section */}
          {recordingDetails.summary && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Summary
              </Text>
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <Text style={[styles.sectionContent, { color: colors.text }]}>
                  {recordingDetails.summary}
                </Text>
              </View>
            </View>
          )}

          {/* Utterances Section */}
          {recordingDetails.utterances &&
            recordingDetails.utterances.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Conversation
                </Text>
                {recordingDetails.utterances.map((utterance, index) => (
                  <View
                    key={index}
                    style={[
                      styles.card,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <View style={styles.utteranceHeader}>
                      <Text
                        style={[styles.speakerText, { color: colors.text }]}
                      >
                        Speaker {utterance.speaker}
                      </Text>
                      <Text
                        style={[styles.timeText, { color: colors.text + "80" }]}
                      >
                        {formatDuration(utterance.start)}
                      </Text>
                    </View>
                    <Text
                      style={[styles.utteranceText, { color: colors.text }]}
                    >
                      {utterance.transcript}
                    </Text>
                  </View>
                ))}
              </View>
            )}
        </ScrollView>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    padding: 16,
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 12,
  },
  metadataContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTimeContainer: {
    flex: 1,
  },
  metadata: {
    fontSize: 13,
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    marginHorizontal: 4,
  },
  duration: {
    fontSize: 13,
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  utteranceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  speakerText: {
    fontSize: 16,
    fontWeight: "600",
  },
  timeText: {
    fontSize: 13,
  },
  utteranceText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
