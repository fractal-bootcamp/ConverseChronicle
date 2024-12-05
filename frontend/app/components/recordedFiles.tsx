import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";

// interface for the audio file
interface AudioFile {
  uri: string; // uri of the file
  name: string; // name of the file
  createdAt: Date; // timestamp
}

export function RecordedFiles() {
  // dark/light mode
  const { colors } = useTheme();

  // state to store list of audio files
  const [files, setFiles] = useState<AudioFile[]>([]);

  // load files when the component mounts
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const documentsDir = FileSystem.documentDirectory; // get the documents directory
      if (!documentsDir) return; // if the documents directory is not found, return

      const files = await FileSystem.readDirectoryAsync(documentsDir); // read the directory
      const audioFiles = files
        .filter((file) => file.endsWith(".m4a")) // filter the files to only include .m4a files
        .map((file) => ({
          uri: documentsDir + file,
          name: file,
          createdAt: new Date(), // In a real app, you'd get this from file metadata
        }));

      setFiles(audioFiles);
    } catch (error) {
      console.error("Error loading files:", error);
    }
  };

  // format the date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        Your Recordings
      </Text>
      {/* list the files */}
      {files.map((file, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.fileItem, { backgroundColor: colors.card }]}
        >
          <Ionicons name="musical-note" size={24} color={colors.text} />

          {/* file info */}
          <View style={styles.fileInfo}>
            <Text style={[styles.fileName, { color: colors.text }]}>
              {file.name}
            </Text>
            <Text style={[styles.fileDate, { color: colors.text + "80" }]}>
              {formatDate(file.createdAt)}
            </Text>
          </View>

          {/* play button */}
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play" size={24} color={colors.primary} />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});
