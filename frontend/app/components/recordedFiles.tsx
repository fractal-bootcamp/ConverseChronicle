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

// interface for the audio file
interface Recording {
  id: string;
  createdAt: string;
  title: string;
  duration?: number;
  topics?: string[]; // todo: display this under title ? 
}

export function RecordedFiles() {
  const { getToken } = useAuth();

  // dark/light mode
  const { colors } = useTheme();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // load files when the component mounts
  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      setError(null);
      const token = await getToken();
      const response = await fetch(`${ENV.prod}/recordings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setRecordings(data.data);
    } catch (error) {
      console.error('Error fetching recordings:', error);
      setError('Failed to load recordings, please retry');
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
    return date.toLocaleDateString('en-US', {
      weekday: 'long', // "Monday"
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true // for AM/PM
    });  
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '--:--';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing}  // When true, shows built-in spinner
          onRefresh={onRefresh} 
        />
      }
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Your Recordings
      </Text>
      {isLoading && !refreshing && (
        <ActivityIndicator size="large" color={colors.primary} />
      )}
      {error && (
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
      )}
      {/* list the files */}
      {recordings.map((recording: Recording) => (
        <TouchableOpacity
          key={recording.id}
          style={[styles.fileItem, { backgroundColor: colors.card }]}
        >
          <Ionicons name="musical-note" size={24} color={colors.text} />

          {/* file info */}
          <View style={styles.fileInfo}>
            <Text style={[styles.fileName, { color: colors.text }]}>
              {recording.title}
            </Text>
            <Text style={[styles.fileDate, { color: colors.text + "80" }]}>
              {formatDate(recording.createdAt)}
            </Text>
          </View>

          {/* play button */}
          <View style={styles.rightContainer}>
            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.duration, { color: colors.text + "80" }]}>
              {formatDuration(recording.duration)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rightContainer: {
    alignItems: 'center',  // Center items vertically
    justifyContent: 'center',
  },
  duration: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,  // Add space between play button and duration
  },
  playButton: {
    padding: 8,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "500",
  },
  fileDate: {
    fontSize: 12,
    marginTop: 4,
  },
  playButton: {
    padding: 8,
  },
  errorText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
});
