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
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter, Link } from "expo-router";
import LottieView from "lottie-react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function SignInScreen() {
  const { signIn, setActive } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
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

  const onSignInPress = async () => {
    if (!signIn) return;
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(home)");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Sign in failed");
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
      <View style={styles.formContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={[styles.input, { color: Colors[colorScheme].text }]}
          placeholderTextColor={Colors[colorScheme].text}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={[styles.input, { color: Colors[colorScheme].text }]}
          placeholderTextColor={Colors[colorScheme].text}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Button
          title="Sign In"
          onPress={onSignInPress}
          color={Colors[colorScheme].tint}
        />
        <View style={styles.signUpContainer}>
          <Text style={{ color: Colors[colorScheme].text }}>
            Don't have an account?
          </Text>
          <Link href="/sign-up">
            <Text
              style={[styles.signUpLink, { color: Colors[colorScheme].tint }]}
            >
              Sign Up
            </Text>
          </Link>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundAnimation: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  formContainer: {
    width: "80%",
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
  input: {
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
  signUpContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  signUpLink: {
    marginTop: 5,
    fontWeight: "bold",
  },
});
