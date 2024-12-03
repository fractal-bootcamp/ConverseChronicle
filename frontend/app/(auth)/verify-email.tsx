import React, { useState } from "react";
import { TextInput, Button, View, Text } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

export default function VerifyEmailScreen() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      console.log(completeSignUp);

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace("/(home)");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Verification failed");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 20, textAlign: "center", marginBottom: 20 }}>
        Verify your email
      </Text>
      <Text style={{ textAlign: "center", marginBottom: 20 }}>
        Please enter the verification code sent to your email
      </Text>
      <TextInput
        value={code}
        placeholder="Enter verification code..."
        onChangeText={setCode}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      {error ? (
        <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>
      ) : null}
      <Button title="Verify Email" onPress={onVerifyPress} />
    </View>
  );
}
