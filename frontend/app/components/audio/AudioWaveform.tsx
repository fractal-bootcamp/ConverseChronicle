import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Audio } from "expo-av";
import { useTheme } from "@react-navigation/native";

interface AudioWaveformProps {
  isRecording: boolean;
}

const BAR_COUNT = 30;
const INITIAL_HEIGHT = 2;

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isRecording,
}) => {
  const { colors } = useTheme();
  const animatedBars = useRef<Animated.Value[]>(
    Array(BAR_COUNT)
      .fill(0)
      .map(() => new Animated.Value(INITIAL_HEIGHT))
  ).current;

  useEffect(() => {
    if (isRecording) {
      // Animate bars randomly when recording
      const animations = animatedBars.map((bar) => {
        return Animated.sequence([
          Animated.timing(bar, {
            toValue: Math.random() * 50 + 5, // Random height between 5 and 55
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
        // Reset bars to initial height
        animatedBars.forEach((bar) => bar.setValue(INITIAL_HEIGHT));
      };
    }
  }, [isRecording]);

  return (
    <View style={styles.container}>
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
  );
};

const styles = StyleSheet.create({
  container: {
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
});
