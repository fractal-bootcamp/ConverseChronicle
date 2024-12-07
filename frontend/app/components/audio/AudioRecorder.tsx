import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";
import { Audio } from "expo-av";
import { AudioWaveform } from "./AudioWaveform";
import * as FileSystem from "expo-file-system";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@clerk/clerk-expo";
import { ENV } from "../../config";

interface Marker {
  timestamp: number;
  label: string;
}
interface AudioRecorderProps {
  onRecordingComplete?: (uri: string) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
}) => {
  const { getToken } = useAuth();

  const { colors } = useTheme();
  const [timer, setTimer] = useState<number>(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

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
        Audio.RecordingOptionsPresets.HIGH_QUALITY
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
        const data = await sendRecordingToBackend(uri)
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
      formData.append('file', {
        uri: uri,
        name: 'file',
        type: 'audio/m4a',
      } as any)

        const token = await getToken();
        console.log(`token is ${token}`);
        const response = await fetch(`${ENV.dev}/recordings/create`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });

      if (!response.ok) {
        console.log(`response`, response);
        throw new Error(`Failed to send recording to backend ${response.statusText}`);
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
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <AudioWaveform
        isRecording={isRecording && !isPaused}
        time={isRecording ? formatTime(timer) : undefined}
        bpm={120}
        offset="00:00:00:00"
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
  container: {
    padding: 20,
    borderRadius: 10,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
    color: "#fff",
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
});
