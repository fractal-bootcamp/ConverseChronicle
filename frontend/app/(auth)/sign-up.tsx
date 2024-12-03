import * as React from "react";
import { TextInput, Button, View } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

export default function SignUpScreen() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      // First create the user
      const signUpAttempt = await signUp.create({
        emailAddress,
        password,
      });

      console.log(signUpAttempt);

      // Wait for the user to be fully created before attempting verification
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.push("/(home)");
        return;
      }

      // Handle email verification if needed
      if (signUpAttempt.status === "missing_requirements") {
        const requirements = signUpAttempt.requiredFields;
        if (requirements.includes("email_address")) {
          await signUpAttempt.prepareEmailAddressVerification();
          router.push("/(auth)/verify-email");
        }
      }
    } catch (err: any) {
      console.error("Sign up error:", err.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Email..."
        onChangeText={setEmailAddress}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        value={password}
        placeholder="Password..."
        secureTextEntry={true}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <Button title="Sign Up" onPress={onSignUpPress} />
    </View>
  );
}
