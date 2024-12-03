import React, { useState, useEffect } from "react";
import {
  TextInput,
  Button,
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter, Link } from "expo-router";
import LottieView from "lottie-react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function SignUpScreen() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const colorScheme = useColorScheme();
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

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      const signUpAttempt = await signUp.create({
        emailAddress,
        password,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.push("/(home)");
        return;
      }

      if (signUpAttempt.status === "missing_requirements") {
        const requirements = signUpAttempt.requiredFields;
        if (requirements.includes("email_address")) {
          await signUpAttempt.prepareEmailAddressVerification();
          router.push("/(auth)/verify-email");
        }
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Sign up failed");
    }
  };

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
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Email..."
        onChangeText={setEmailAddress}
        style={styles.input}
      />
      <TextInput
        value={password}
        placeholder="Password..."
        secureTextEntry={true}
        onChangeText={setPassword}
        style={styles.input}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Button
        title="Sign Up"
        onPress={onSignUpPress}
        color={Colors[colorScheme ?? "light"].tint}
      />
      <View style={styles.linkContainer}>
        <Text>Already have an account? </Text>
        <Link href="/sign-in">
          <Text style={styles.link}>Sign In</Text>
        </Link>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backgroundAnimation: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  linkContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  link: {
    color: "blue",
    textDecorationLine: "underline",
  },
});
