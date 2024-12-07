import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "@clerk/clerk-expo";
import { ENV } from "../config";

interface RecordingDetailsData {
  id: string;
  title: string;
  createdAt: string;
  duration: number;
  summary?: string;
  transcript?: string;
}

export default function RecordingDetails({recordingId}: { recordingId: string }) {
  const { colors } = useTheme();
  const { getToken } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordingDetails, setRecordingDetails] = useState<RecordingDetailsData | null>(null);

  useEffect(() => {
    fetchRecordingDetails();
  }, []);

  const fetchRecordingDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = await getToken();
      const response = await fetch(`${ENV.prod}/recordings/${recordingId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recording details');
      }

      const data = await response.json();
      console.log(`recording details`, data);
      setRecordingDetails(data.data);
    } catch (error) {
      console.error('Error fetching recording details:', error);
      setError('Failed to load recording details');
    } finally {
      setIsLoading(false);
    }
  };

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

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        </View>
      ) : recordingDetails ? (
        <ScrollView style={styles.container}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={[styles.title, { color: colors.text }]}>
              {recordingDetails.title}
            </Text>
            <View style={styles.metadataContainer}>
              <View style={styles.dateTimeContainer}>
                <Text style={[styles.dateTime, { color: colors.text }]}>
                    {formatDate(recordingDetails.createdAt)}
                </Text>
              </View>
              <View style={styles.durationContainer}>
                <Ionicons name="time-outline" size={16} color={colors.text} style={styles.timeIcon}/>
                <Text style={[styles.duration, { color: colors.text }]}>
                  {formatDuration(recordingDetails.duration)}
                </Text>
              </View>
            </View>
          </View>

          {/* Summary Section */}
          {recordingDetails.summary && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Summary</Text>
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <Text style={[styles.sectionContent, { color: colors.text }]}>
                  {recordingDetails.summary}
                </Text>
              </View>
            </View>
          )}

          {/* Transcript Section */}
          {recordingDetails.transcript && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Transcript</Text>
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <Text style={[styles.sectionContent, { color: colors.text }]}>
                  {recordingDetails.transcript}
                </Text>
              </View>
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
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 16,
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    marginHorizontal: 4,
  },
  dateTimeContainer: {
    flex: 1,
  },
  dateTime: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  duration: {
    fontSize: 16,
    marginLeft: 4,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
  },
});