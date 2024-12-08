import React, { useEffect } from "react";
import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { Text, View, StyleSheet, Animated } from "react-native";
import LottieView from "lottie-react-native";

// Match theme colors from AudioRecorder
const themeColors = {
  matteBlue: "#2C3E50",
  lightBlue: "#34495E",
  orange: "#E67E22",
  lightOrange: "#F39C12",
  white: "#FFFFFF",
  borderColor: "rgba(255, 255, 255, 0.3)",
};

export default function Page() {
  const { user } = useUser();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <LottieView
        source={require("@/assets/animations/background-sparkles.json")}
        autoPlay
        loop
        style={styles.backgroundAnimation}
      />
      <SignedIn>
        <View style={styles.signedInContainer}>
          <Text style={styles.greeting}>
            Hello {user?.emailAddresses[0]?.emailAddress}
          </Text>
        </View>
      </SignedIn>
      <SignedOut>
        <View style={styles.signedOutContainer}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Link href="/sign-in" style={styles.link}>
              <Text style={styles.linkText}>Sign In</Text>
            </Link>
          </Animated.View>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Link href="/sign-up" style={styles.link}>
              <Text style={styles.linkText}>Sign Up</Text>
            </Link>
          </Animated.View>
        </View>
      </SignedOut>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: themeColors.matteBlue,
  },
  backgroundAnimation: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  signedInContainer: {
    alignItems: "center",
    backgroundColor: themeColors.lightBlue,
    padding: 20,
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
  signedOutContainer: {
    alignItems: "center",
    gap: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: themeColors.white,
    letterSpacing: 1,
  },
  link: {
    backgroundColor: themeColors.lightBlue,
    padding: 15,
    borderRadius: 30,
    width: 200,
    borderWidth: 1,
    borderColor: themeColors.borderColor,
    shadowColor: themeColors.white,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  linkText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: themeColors.white,
    letterSpacing: 1,
  },
});
