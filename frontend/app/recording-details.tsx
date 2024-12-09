import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import RecordingDetails from './components/RecordingDetails';

export default function RecordingDetailsPage() {
  const { recordingId, title } = useLocalSearchParams<{
    recordingId: string;
    title: string;
  }>();
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen 
        options={{
          title: '',
          headerShown: true,
          headerBackTitle: 'back',
          headerTintColor: "black",
        }} 
      />
      <View style={styles.container}>
        <RecordingDetails recordingId={recordingId} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
  },
});