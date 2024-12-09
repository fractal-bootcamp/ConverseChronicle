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

const DbMarkers = () => {
  const dbLevels = [0, -6, -12, -18, -24, -30, -36, -42, -48, -54, -60];

  return (
    <View style={styles.dbMarkersContainer}>
      {dbLevels.map((db) => (
        <Text key={db} style={styles.dbText}>
          {db} dB
        </Text>
      ))}
    </View>
  );
};

interface AudioMetricsProps {
  peakLevel: number;
  rmsLevel: number;
  crestFactor: number;
  dynamicRange: number;
  clipCount: number;
  lufs: number;
  bpm: number;
  offset: string;
}

const AudioMetrics: React.FC<AudioMetricsProps> = ({
  peakLevel = -12,
  rmsLevel = -24,
  crestFactor = 12,
  dynamicRange = 18,
  clipCount = 0,
  lufs = -14,
  bpm = 120,
  offset = "00:00:00:00",
}) => (
  <View style={styles.metricsContainer}>
    <View style={styles.metricsGrid}>
      <View style={styles.metricsRow}>
        <MetricCell
          label="PEAK"
          value={`${peakLevel.toFixed(1)} dB`}
          alert={peakLevel > -1}
        />
        <MetricCell label="DR" value={`${dynamicRange.toFixed(1)} dB`} />
      </View>
      <View style={styles.metricsRow}>
        <MetricCell label="RMS" value={`${rmsLevel.toFixed(1)} dB`} />
        <MetricCell
          label="CLIPS"
          value={clipCount.toString()}
          alert={clipCount > 0}
        />
      </View>
      <View style={styles.metricsRow}>
        <MetricCell label="LUFS" value={`${lufs.toFixed(1)}`} />
        <MetricCell label="BPM" value={bpm.toString()} />
      </View>
      <View style={styles.metricsRow}>
        <MetricCell label="CREST" value={`${crestFactor.toFixed(1)} dB`} />
        <MetricCell label="OFFSET" value={offset} />
      </View>
    </View>
  </View>
);

const MetricCell: React.FC<{
  label: string;
  value: string;
  alert?: boolean;
}> = ({ label, value, alert = false }) => (
  <View style={styles.metricCell}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={[styles.metricValue, alert && styles.metricValueAlert]}>
      {value}
    </Text>
  </View>
);

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
  time,
  bpm,
  offset,
  loudnessHistory,
}) => {
  const { colors } = useTheme();

  const waveformHistory = loudnessHistory.map((meter, index) => ({
    amplitude: transformAudioLevelWithExponentialScaling(meter) + 2,
    timestamp: Date.now() - index * 200,
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
            duration: 650,
            useNativeDriver: false,
          }),
          Animated.timing(bar, {
            toValue: INITIAL_HEIGHT,
            duration: 100,
            useNativeDriver: false,
          }),
        ]);
      });

      const loop = Animated.loop(Animated.stagger(11, animations));
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
        <DbMarkers />

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

      {/* Time Display - Moved here */}
      <View style={styles.timeDisplayContainer}>
        <Text style={styles.timeDisplayText}>{time || "00:00.0"}</Text>
      </View>

      {/* Existing AudioMetrics */}
      <AudioMetrics
        peakLevel={-3}
        rmsLevel={-18}
        crestFactor={15}
        dynamicRange={20}
        clipCount={0}
        lufs={-14}
        bpm={120}
        offset="00:00:00:00"
      />
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
    </View>
    <AudioMetrics
      peakLevel={-3}
      rmsLevel={-18}
      crestFactor={15}
      dynamicRange={20}
      clipCount={0}
      lufs={-14}
      bpm={120}
      offset="00:00:00:00"
    />
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
    height: 55,
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
  dbMarkersContainer: {
    position: "absolute",
    left: -10,
    top: 0,
    bottom: 0,
    width: 35,
    justifyContent: "space-between",
    paddingVertical: 10,
    zIndex: 2,
  },
  dbText: {
    color: themeColors.white,
    fontSize: 6,
    textAlign: "right",
    opacity: 0.8,
  },

  bar: {
    width: 4,
    borderRadius: 10,
  },
  timeDisplayContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 8,
    padding: 1,
    alignSelf: "center",
    marginVertical: 20,
    minWidth: 120,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  timeDisplayRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  timeDisplayMain: {
    flex: 1,
    padding: 2,
  },
  timeLabel: {
    color: themeColors.white,
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 1,
    letterSpacing: 1,
  },
  timeDisplayText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
    textShadowColor: "rgba(255, 255, 255, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 2,
  },
  parametersContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 10,
  },
  parameterBox: {
    backgroundColor: themeColors.matteBlue,
    padding: 2,
    borderRadius: 2,
    borderWidth: 6,
    borderColor: themeColors.borderColor,
    shadowColor: themeColors.white,
    shadowOffset: {
      width: 2,
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
    height: 150,
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
    paddingLeft: 50,
  },
  timelineBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  timelineGridLine: {
    width: 0.5,
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
    gap: 0.5,
  },
  timelineBar: {
    width: 2,
    opacity: 0.8,
  },
  timelineOverlay: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 90,
    width: 400,
    backgroundColor: themeColors.matteBlue,
    opacity: 0.5,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 0,
  },
  metricsContainer: {
    backgroundColor: themeColors.matteBlue,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: themeColors.borderColor,
    overflow: "hidden",
  },
  metricsHeader: {
    backgroundColor: `${themeColors.lightBlue}80`,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.borderColor,
  },
  metricsTitle: {
    color: themeColors.white,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
    opacity: 0.7,
  },
  metricsContent: {
    padding: 6,
    gap: 6,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 6,
  },
  metricCell: {
    flex: 1,
    backgroundColor: `${themeColors.lightBlue}40`,
    borderRadius: 4,
    padding: 4,
    borderWidth: 1,
    borderColor: themeColors.borderColor,
  },
  metricCellAlert: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderColor: "#FF3B30",
  },
  metricLabel: {
    color: themeColors.white,
    fontSize: 8,
    fontWeight: "600",
    letterSpacing: 0.5,
    opacity: 0.7,
    marginBottom: 2,
  },
  metricValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 2,
  },
  metricValue: {
    color: themeColors.orange,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  metricUnit: {
    color: themeColors.orange,
    fontSize: 8,
    fontWeight: "600",
    opacity: 0.7,
    fontFamily: "monospace",
  },
  metricValueAlert: {
    color: "#FF3B30",
  },
});
