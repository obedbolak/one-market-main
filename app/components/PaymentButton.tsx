import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type PaymentStatus = "idle" | "pending" | "success" | "failed";

const PaymentButton = ({
  paymentMethod,
  onPayment,
  onDeliveryConfirmation,
}: {
  paymentMethod: "Mobile_Money" | "Payment_On_Delivery";
  onPayment: () => Promise<boolean>;
  onDeliveryConfirmation?: () => void;
}) => {
  const [status, setStatus] = useState<PaymentStatus>("idle");

  const handlePress = async () => {
    if (paymentMethod === "Payment_On_Delivery") {
      Alert.alert(
        "Order Confirmation",
        "Seller will contact you to confirm your order",
        [
          {
            text: "OK",
            onPress: () => {
              onDeliveryConfirmation?.();
              setStatus("success");
              setTimeout(() => setStatus("idle"), 2000);
            },
          },
        ]
      );
      return;
    }

    try {
      setStatus("pending");
      const success = await onPayment();
      setStatus(success ? "success" : "failed");

      // Reset after 2 seconds
      setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      setStatus("failed");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const getButtonState = () => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-blue-500",
          text: "Processing...",
          icon: <ActivityIndicator color="white" />,
        };
      case "success":
        return {
          bg: "bg-green-500",
          text: "Payment Successful",
          icon: <MaterialIcons name="check" size={20} color="white" />,
        };
      case "failed":
        return {
          bg: "bg-red-500",
          text: "Payment Failed",
          icon: <MaterialIcons name="close" size={20} color="white" />,
        };
      default:
        return {
          bg: "bg-black",
          text: paymentMethod === "Mobile_Money" ? "Pay Now" : "Place Order",
          icon: null,
        };
    }
  };

  const state = getButtonState();

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={status === "pending"}
      style={[
        styles.button,
        {
          backgroundColor:
            status === "pending"
              ? "#3b82f6"
              : status === "success"
              ? "#10b981"
              : status === "failed"
              ? "#ef4444"
              : paymentMethod === "Mobile_Money"
              ? "#000000"
              : "#22c55e",
        },
      ]}
    >
      <View style={styles.buttonContent}>
        {state.icon && <View style={styles.iconContainer}>{state.icon}</View>}
        <Text style={styles.buttonText}>{state.text}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default PaymentButton;
