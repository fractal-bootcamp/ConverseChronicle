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

interface Marker {
  timestamp: number;
  label: string;
}
interface AudioRecorderProps {
  onRecordingComplete?: (uri: string) => void;
}

const themeColors = {
  lightBlue: "#007AFF",
  borderColor: "rgba(255, 255, 255, 0.1)",
  white: "#FFFFFF",
  background: "#121212",
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
        name: "file",
        type: "audio/m4a",
      } as any);

      const token = await getToken();
      console.log(`token is ${token}`);
      const response = await fetch(`${ENV.dev}/recordings/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        console.log(`response`, response);
        throw new Error(
          `Failed to send recording to backend ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Response from backend:", data);
    } catch (error) {
      console.error("Error sending recording to backend:", error);
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
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, { borderBottomColor: colors.primary }]}
            onPress={() => router.push("/(home)")}
          >
            <Text style={[styles.tabText, { color: colors.primary }]}>
              Record
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => router.push("/(home)/files")}
          >
            <Text style={[styles.tabText, { color: colors.text }]}>
              Recordings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => router.push("/(home)/editor")}
          >
            <Text style={[styles.tabText, { color: colors.text }]}>Notes</Text>
          </TouchableOpacity>
        </View>
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
  );
};

interface ControlButtonProps {
  onPress: () => void;
  label: string;
  color: string;
  textColor?: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  onPress,
  label,
  color,
  textColor = "#fff",
}) => (
  <TouchableOpacity
    style={[styles.button, { backgroundColor: color }]}
    onPress={onPress}
  >
    <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
  </TouchableOpacity>
);

interface RecordButtonProps {
  onPress: () => void;
  colors: any;
}

const RecordButton: React.FC<RecordButtonProps> = ({ onPress, colors }) => (
  <ControlButton
    onPress={onPress}
    label="Record"
    color="rgba(0, 0, 0, 0.8)"
    textColor={colors.primary}
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
        label="Pause"
        color="rgba(0, 0, 0, 0.8)"
        textColor={colors.notification}
      />
    ) : (
      <ControlButton
        onPress={onResume}
        label="Resume"
        color="rgba(0, 0, 0, 0.8)"
        textColor={colors.primary}
      />
    )}
    <ControlButton
      onPress={onStop}
      label="End"
      color="rgba(0, 0, 0, 0.8)"
      textColor={colors.error || "#f44336"}
    />
  </>
);

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    // position: "fixed",
    padding: 0,
    margin: 4,
    // borderWidth: 1,
    // borderColor: "red",
  },
  backgroundAnimation: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    position: "absolute",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    zIndex: -1,
  },
  container: {
    padding: 2,
    borderRadius: 5,
    margin: 1,
    backgroundColor: themeColors.lightBlue,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 30,
  },
  button: {
    padding: 10,
    backgroundColor: themeColors.lightBlue,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: themeColors.borderColor,
    minWidth: 100,
    alignItems: "center",
    shadowColor: themeColors.white,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  buttonText: {
    color: themeColors.white,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  timeDisplayContainer: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 5,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  timeDisplayText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    gap: 10,
    marginTop: 20,
  },
  tabButton: {
    padding: 10,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
    color: "#fff",
  },
});
