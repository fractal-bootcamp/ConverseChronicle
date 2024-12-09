import React, { useState, useEffect } from "react";
import {
  TextInput,
  Button,
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter, Link } from "expo-router";
import LottieView from "lottie-react-native";
import { useTheme } from "@react-navigation/native";

const themeColors = {
  lightBlue: "#007AFF",
  borderColor: "rgba(255, 255, 255, 0.3)",
  white: "#FFFFFF",
  background: "#E6F3FF",
  matteBlue: "#2C3E50",
  inputBackground: "rgba(255, 255, 255, 0.1)",
};

export default function SignInScreen() {
  const { signIn, setActive } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("jakezegil@gmail.com");
  const [password, setPassword] = useState("iamcece1!");
  const [error, setError] = useState("");
  const { colors } = useTheme();
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
      <View
        style={[
          styles.formContainer,
          { backgroundColor: themeColors.matteBlue },
        ]}
      >
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={styles.input}
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={onSignInPress}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <View style={styles.signUpContainer}>
          <Text style={styles.text}>Don't have an account?</Text>
          <Link href="/sign-up">
            <Text style={styles.signUpLink}>Sign Up</Text>
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
    backgroundColor: themeColors.matteBlue,
  },
  backgroundAnimation: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  formContainer: {
    width: "80%",
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
  input: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: themeColors.borderColor,
    backgroundColor: themeColors.inputBackground,
    color: themeColors.white,
    minWidth: 100,
    shadowColor: themeColors.white,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    padding: 10,
    backgroundColor: themeColors.lightBlue,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: themeColors.borderColor,
    minWidth: 100,
    alignItems: "center",
    shadowColor: themeColors.white,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: themeColors.white,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    color: themeColors.white,
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
    fontWeight: "600",
    letterSpacing: 1,
    color: themeColors.lightBlue,
  },
});
