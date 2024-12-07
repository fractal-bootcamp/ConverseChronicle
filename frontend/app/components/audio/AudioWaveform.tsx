import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, Text, ScrollView } from "react-native";
import { Audio } from "expo-av";
import { useTheme } from "@react-navigation/native";
import { transformAudioLevelWithExponentialScaling } from "./utils";

// Custom theme colors
const themeColors = {
  matteBlue: "#2C3E50",
  lightBlue: "#34495E",
  orange: "#E67E22",
  lightOrange: "#F39C12",
  white: "#FFFFFF",
  darkGray: "#1a1a1a",
  borderColor: "rgba(255, 255, 255, 0.3)",
};

interface AudioWaveformProps {
  isRecording: boolean;
  time?: string;
  bpm?: number;
  offset?: string;
  loudnessHistory: number[];
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
  loudnessHistory = [],
}) => {
  const { colors } = useTheme();

  const waveformHistory = loudnessHistory.map((meter, index) => ({
    amplitude: transformAudioLevelWithExponentialScaling(meter) + 5,
    timestamp: Date.now() - index * 100,
  }));

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
        // Scroll to the end of the timeline
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isRecording]);

  // Live waveform animation
  useEffect(() => {
    if (isRecording) {
      const animations = animatedBars.map((bar, index) => {
        return Animated.sequence([
          Animated.timing(bar, {
            toValue: waveformHistory[index]?.amplitude || 0,
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
                backgroundColor: themeColors.orange,
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
                    backgroundColor: themeColors.lightOrange,
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
          <Text style={[styles.parameterValue, { color: themeColors.orange }]}>
            {bpm}
          </Text>
        </View>
        <View style={styles.parameterBox}>
          <Text style={styles.parameterLabel}>OFFSET</Text>
          <Text
            style={[styles.parameterValue, { color: themeColors.lightOrange }]}
          >
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
    padding: 15,
    backgroundColor: themeColors.matteBlue,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: themeColors.borderColor,
    shadowColor: themeColors.white,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    gap: 2,
    backgroundColor: themeColors.lightBlue,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: themeColors.borderColor,
    padding: 10,
    marginVertical: 10,
    shadowColor: themeColors.white,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bar: {
    width: 4,
    borderRadius: 10,
  },
  timeDisplayContainer: {
    borderWidth: 2,
    borderColor: themeColors.borderColor,
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    backgroundColor: themeColors.lightBlue,
    shadowColor: themeColors.white,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
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
    color: themeColors.white,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: 1,
  },
  timeDisplayText: {
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
    backgroundColor: themeColors.matteBlue,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.borderColor,
    shadowColor: themeColors.white,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  parameterLabel: {
    color: themeColors.white,
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
    backgroundColor: themeColors.lightBlue,
    borderRadius: 12,
    marginVertical: 10,
    position: "relative",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: themeColors.borderColor,
    shadowColor: themeColors.white,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  timelineBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  timelineGridLine: {
    width: 1,
    height: "100%",

    backgroundColor: themeColors.borderColor,
  },
  timelineScroll: {
    height: "100%",
    backgroundColor: "transparent",
  },
  timelineWaveform: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: "100%",
    paddingHorizontal: 5,
    gap: 0.2,
  },
  timelineBar: {
    width: 5,
    opacity: 0.8,
  },
  timelineOverlay: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 50,
    width: 400,
    backgroundColor: themeColors.matteBlue,
    opacity: 0.5,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 0,
  },
});
