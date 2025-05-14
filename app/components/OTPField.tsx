import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import OTPTextInput from "react-native-otp-textinput";

interface OTPFieldProps {
  phoneNumber?: string;
  onCodeFilled?: (code: string) => void;
  onResendPress?: () => void;
}

const OTPField = ({
  phoneNumber,
  onCodeFilled,
  onResendPress,
}: OTPFieldProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter your verification code</Text>
      <Text style={styles.description}>
        We've sent a 6-digit code to {phoneNumber || "your phone number"}
      </Text>

      <OTPTextInput
        inputCount={6}
        tintColor="#2563eb" // Focused border color (blue-600)
        offTintColor="#e5e7eb" // Unfocused border color (gray-200)
        textInputStyle={styles.otpBox}
        handleTextChange={onCodeFilled}
        keyboardType="number-pad"
        autoFocus
      />

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn't receive a code?</Text>
        <TouchableOpacity onPress={onResendPress}>
          <Text style={styles.resendLink}>Resend</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111827", // gray-900
    textAlign: "center",
    fontFamily: "Inter_600SemiBold",
  },
  description: {
    fontSize: 14,
    color: "#6b7280", // gray-500
    textAlign: "center",
    marginBottom: 24,
    fontFamily: "Inter_400Regular",
  },
  otpBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb", // gray-200
    borderRadius: 8,
    width: 44,
    height: 56,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    color: "#111827", // gray-900
    backgroundColor: "#f9fafb", // gray-50
    fontFamily: "Inter_600SemiBold",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 4,
  },
  resendText: {
    fontSize: 14,
    color: "#6b7280", // gray-500
    fontFamily: "Inter_400Regular",
  },
  resendLink: {
    fontSize: 14,
    color: "#2563eb", // blue-600
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
});

export default OTPField;
