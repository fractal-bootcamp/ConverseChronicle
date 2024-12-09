import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Dimensions,
} from "react-native";
import { Audio } from "expo-av";
import { AudioWaveform } from "./AudioWaveform";
import * as FileSystem from "expo-file-system";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@clerk/clerk-expo";
import { ENV } from "../../config";
import HomeLayout from "@/app/(home)/_layout";
import { Tabs, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

interface Marker {
  timestamp: number;
  label: string;
}
interface AudioRecorderProps {
  onRecordingComplete?: (uri: string) => void;
}

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

const useRecordingStatusUpdate = () => {
  const [loudnessHistory, setLoudnessHistory] = useState<number[]>([]);

  const appendLoudness = (metering: number | undefined) => {
    if (typeof metering === "undefined") return;

    setLoudnessHistory((prev) => {
      const newHistory = [...prev, metering];

      return newHistory;
    });
  };

  return {
    loudnessHistory,
    appendLoudness,
  };
};

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecord,
  onRecordingComplete,
}) => {
  const { getToken } = useAuth();

  const { colors } = useTheme();
  const [timer, setTimer] = useState<number>(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const router = useRouter();

  const { loudnessHistory, appendLoudness } = useRecordingStatusUpdate();

  useEffect(() => {
    setupAudio();
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 100);
      }, 100);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording, isPaused]);

  const setupAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error("Audio setup failed:", error);
    }
  };

  const startRecording = async () => {
    try {
      setTimer(0);
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          appendLoudness(status.metering);
        },
        100
      );
      setRecording(recording);
      setIsRecording(true);
      setIsPaused(false);
    } catch (error) {
      console.error("Start recording failed:", error);
    }
  };

  const pauseRecording = async () => {
    if (!recording) return;
    try {
      await recording.pauseAsync();
      setIsPaused(true);
    } catch (error) {
      console.error("Pause recording failed:", error);
    }
  };

  const resumeRecording = async () => {
    if (!recording) return;
    try {
      await recording.startAsync();
      setIsPaused(false);
    } catch (error) {
      console.error("Resume recording failed:", error);
    }
  };

  const convertAudioToBase64 = async (uri: string): Promise<string> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log("Converted to base64");
      return base64;
    } catch (error) {
      console.error("Error converting audio:", error);
      throw error;
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);
      setRecording(null);

      if (uri) {
        console.log("Original recording at:", uri);
        const data = await sendRecordingToBackend(uri);
        if (onRecordingComplete) {
          onRecordingComplete(uri);
        }
      }
    } catch (error) {
      console.error("Stop recording failed:", error);
    }
  };

  const sendRecordingToBackend = async (uri: string) => {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: uri,
        type: "audio/m4a",
        name: "recording.m4a",
      } as any);

      const token = await getToken();
      const response = await fetch(`${ENV.prod}/recordings/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to send recording to backend: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Response from backend:", data);
      return data;
    } catch (error) {
      console.error("Error sending recording to backend:", error);
      throw error;
    }
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = milliseconds % 1000;
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${Math.floor(
      ms / 100
    )}`;
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
            style={[styles.tabButton, styles.activeTab]}
            onPress={() => router.push("/(home)")}
          >
            <Text style={[styles.tabText, styles.activeTabText]}>Record</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => router.push("/(home)/files")}
          >
            <Text style={styles.tabText}>Recordings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <AudioWaveform
            isRecording={isRecording && !isPaused}
            time={isRecording ? formatTime(timer) : undefined}
            bpm={120}
            offset="00:00:00:00"
            loudnessHistory={loudnessHistory}
          />

          <View style={styles.controlsContainer}>
            {!isRecording ? (
              <RecordButton onPress={startRecording} colors={colors} />
            ) : (
              <RecordingControls
                isPaused={isPaused}
                onPause={pauseRecording}
                onResume={resumeRecording}
                onStop={stopRecording}
                colors={colors}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

interface ControlButtonProps {
  onPress: () => void;
  label: string;
  color: string;
  textColor?: string;
  icon?: React.ReactNode;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  onPress,
  color,
  icon,
}) => (
  <TouchableOpacity
    style={[
      styles.button,
      {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        transform: [{ scale: 1.1 }],
      },
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {icon}
  </TouchableOpacity>
);

interface RecordButtonProps {
  onPress: () => void;
  colors: any;
}

const RecordButton: React.FC<RecordButtonProps> = ({ onPress, colors }) => (
  <ControlButton
    onPress={onPress}
    color="rgba(0, 0, 0, 0.8)"
    textColor={colors.primary}
    icon={<FontAwesome name="microphone" size={24} color={colors.primary} />}
  />
);

interface RecordingControlsProps {
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  colors: any;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isPaused,
  onPause,
  onResume,
  onStop,
  colors,
}) => (
  <>
    {!isPaused ? (
      <ControlButton
        onPress={onPause}
        color="rgba(0, 0, 0, 0.8)"
        textColor={colors.notification}
        icon={
          <MaterialIcons name="pause" size={24} color={colors.notification} />
        }
      />
    ) : (
      <ControlButton
        onPress={onResume}
        color="rgba(0, 0, 0, 0.8)"
        textColor={colors.primary}
        icon={
          <MaterialIcons name="play-arrow" size={24} color={colors.primary} />
        }
      />
    )}
    <ControlButton
      onPress={onStop}
      color="rgba(0, 0, 0, 0.8)"
      textColor={colors.error || "#f44336"}
      icon={
        <MaterialIcons
          name="stop"
          size={24}
          color={colors.error || "#f44336"}
        />
      }
    />
  </>
);

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
    backdropFilter: "blur(20px)",
    overflow: "hidden",
    borderWidth: 0,
    borderColor: themeColors.border,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    gap: 20,
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
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 20,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: themeColors.border,
    marginTop: -10,
    position: "relative",
    zIndex: 1,
  },
});
