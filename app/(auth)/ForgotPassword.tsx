import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../components/CustomButton";
import EmailField from "../components/EmailField";
import PasswordField from "../components/PasswordField";

const ForgotPassword = () => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const resetPassword = async () => {
    const url =
      "https://i9vqbt6zll.execute-api.eu-north-1.amazonaws.com/api/v1/user/password/reset";
    const data = {
      email: email,
      newPassword: newPassword,
      answer: "Pancakes",
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Password reset successful!");
        setNewPassword("");
        setEmail("");
        router.push("/(auth)/SignIn");
      } else {
        Alert.alert("Error", result.message || "Something went wrong.");
      }
    } catch (error) {
      Alert.alert("Error");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.centerContent}>
            <Image
              source={require("../../assets/images/gif/login.gif")}
              style={styles.image}
            />
            <Text style={styles.headerText}>Forgot Password</Text>
            <EmailField
              label="Email"
              helperText="Enter your email address"
              placeholder="example@example.com"
              clearButtonVisible={true}
              onChangeText={setEmail}
            />
            <PasswordField
              label="New Password"
              placeholder="Enter your password"
              onChangeText={setNewPassword}
            />
            <CustomButton theme="primary" onPress={resetPassword}>
              <Text style={styles.buttonText}>Set New Password</Text>
            </CustomButton>

            <View style={styles.signUpContainer}>
              <Text>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/SignUp")}>
                <Text style={styles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.termsText}>
              By signing in, you agree to our
              <TouchableOpacity>
                <Text style={styles.linkText}>Terms and Conditions</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 150,
    height: 150,
  },
  headerText: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  buttonText: {
    color: "white",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 8,
  },
  linkText: {
    color: "#007bff",
  },
  termsText: {
    textAlign: "center",
    fontSize: 12,
    color: "#6c757d",
  },
});

export default ForgotPassword;
