import React, { useEffect } from "react";
import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { Text, View, StyleSheet, Animated } from "react-native";
import LottieView from "lottie-react-native";

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
        source={require("../../assets/animations/background-sparkles.json")}
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
    backgroundColor: "#F5FCFF",
  },
  backgroundAnimation: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  signedInContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signedOutContainer: {
    alignItems: "center",
    gap: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  link: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 15,
    borderRadius: 10,
    width: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  linkText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
