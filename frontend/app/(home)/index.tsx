import React, { useEffect } from "react";
import { SignedIn, SignedOut, useUser, useAuth } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { Button, Text, View, StyleSheet, Animated, Easing } from "react-native";
import LottieView from "lottie-react-native";

export default function Page() {
  const { user } = useUser();
  const { signOut } = useAuth();
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

  const rotateAnim = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

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
        <Animated.View
          style={[
            styles.signedInContainer,
            { transform: [{ rotate: rotateAnim }] },
          ]}
        >
          <Text style={styles.greeting}>
            Welcome back, {user?.emailAddresses[0]?.emailAddress}!
          </Text>
          {/* <LottieView
            source={require("../../assets/animations/celebration.json")}
            autoPlay
            loop
            style={styles.celebrationAnimation}
          /> */}
          <Button
            title="Sign Out"
            onPress={() => {
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }).start(() => signOut());
            }}
            color="#FF6347"
          />
        </Animated.View>
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
  greeting: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    color: "#333",
  },
  celebrationAnimation: {
    width: 200,
    height: 200,
  },
  signedOutContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
  },
  link: {
    padding: 15,
    backgroundColor: "#4CAF50",
    borderRadius: 25,
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
  linkText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});
