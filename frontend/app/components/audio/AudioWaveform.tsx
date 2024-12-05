import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, Text, ScrollView } from "react-native";
import { Audio } from "expo-av";
import { useTheme } from "@react-navigation/native";

interface AudioWaveformProps {
  isRecording: boolean;
  time?: string;
  bpm?: number;
  offset?: string;
}

interface WaveformPoint {
  amplitude: number;
  timestamp: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isRecording,
  time = "00:00:00:00",
  bpm = "--",
  offset = "00:00:00:00",
}) => {
  const { colors } = useTheme();
  const [waveformHistory, setWaveformHistory] = useState<WaveformPoint[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const animatedBars = useRef<Animated.Value[]>(
    Array(BAR_COUNT)
      .fill(0)
      .map(() => new Animated.Value(INITIAL_HEIGHT))
  ).current;

  // Store waveform data while recording
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        const newPoint = {
          amplitude: Math.random() * 50 + 5, // Replace with actual audio amplitude
          timestamp: Date.now(),
        };
        setWaveformHistory((prev) => [...prev, newPoint]);

        // Scroll to the end of the timeline
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isRecording]);

  // Live waveform animation
  useEffect(() => {
    if (isRecording) {
      const animations = animatedBars.map((bar) => {
        return Animated.sequence([
          Animated.timing(bar, {
            toValue: Math.random() * 50 + 5,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(bar, {
            toValue: INITIAL_HEIGHT,
            duration: 500,
            useNativeDriver: false,
          }),
        ]);
      });

      const loop = Animated.loop(Animated.stagger(50, animations));
      loop.start();

      return () => {
        loop.stop();
        animatedBars.forEach((bar) => bar.setValue(INITIAL_HEIGHT));
      };
    }
  }, [isRecording]);

  return (
    <View style={styles.mainContainer}>
      {/* Live Waveform */}
      <View style={styles.waveformContainer}>
        {animatedBars.map((bar, index) => (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              {
                height: bar,
                backgroundColor: colors.primary,
              },
            ]}
          />
        ))}
      </View>

      {/* Timeline Waveform */}
      <View style={styles.timelineContainer}>
        <View style={styles.timelineBackground}>
          {Array.from({ length: 12 }).map((_, i) => (
            <View key={i} style={styles.timelineGridLine} />
          ))}
        </View>
        <ScrollView
          horizontal
          ref={scrollViewRef}
          style={styles.timelineScroll}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.timelineWaveform}>
            {waveformHistory.map((point, index) => (
              <View
                key={index}
                style={[
                  styles.timelineBar,
                  {
                    height: point.amplitude,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            ))}
          </View>
        </ScrollView>
        <View style={styles.timelineOverlay} />
      </View>

      <TimeDisplay time={time} colors={colors} bpm={bpm} offset={offset} />
    </View>
  );
};

const TimeDisplay: React.FC<TimeDisplayProps> = ({
  time,
  colors,
  bpm = "--",
  offset = "00:00:00:00",
}) => (
  <View style={[styles.timeDisplayContainer, { backgroundColor: colors.card }]}>
    <View style={styles.timeDisplayRow}>
      <View style={styles.timeDisplayMain}>
        <Text style={styles.timeLabel}>TIMECODE</Text>
        <Text style={styles.timeDisplayText}>{time}</Text>
      </View>
      <View style={styles.parametersContainer}>
        <View style={styles.parameterBox}>
          <Text style={styles.parameterLabel}>BPM</Text>
          <Text style={[styles.parameterValue, { color: colors.primary }]}>
            {bpm}
          </Text>
        </View>
        <View style={styles.parameterBox}>
          <Text style={styles.parameterLabel}>OFFSET</Text>
          <Text style={[styles.parameterValue, { color: colors.notification }]}>
            {offset}
          </Text>
        </View>
      </View>
    </View>
  </View>
);

const BAR_COUNT = 30;
const INITIAL_HEIGHT = 2;

const styles = StyleSheet.create({
  mainContainer: {
    width: "100%",
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    gap: 2,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 30,
    padding: 10,
    marginVertical: 10,
  },
  bar: {
    width: 4,
    borderRadius: 10,
  },
  timeDisplayContainer: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    backgroundColor: "#111",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timeDisplayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeDisplayMain: {
    flex: 2,
  },
  timeLabel: {
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: 1,
  },
  timeDisplayText: {
    color: "#00ff00",
    fontSize: 32,
    fontWeight: "700",
    fontFamily: "monospace",
    letterSpacing: 2,
  },
  parametersContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 10,
  },
  parameterBox: {
    backgroundColor: "#222",
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#444",
  },
  parameterLabel: {
    color: "#666",
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 2,
    letterSpacing: 1,
  },
  parameterValue: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  timelineContainer: {
    height: 100,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 8,
    marginVertical: 10,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  timelineBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  timelineGridLine: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  timelineScroll: {
    height: "100%",
    backgroundColor: "transparent",
  },
  timelineWaveform: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
    paddingHorizontal: 20,
    gap: 1,
  },
  timelineBar: {
    width: 2,
    backgroundColor: "#fff",
    opacity: 0.8,
  },
  timelineOverlay: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    background:
      "linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.8))",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
});
