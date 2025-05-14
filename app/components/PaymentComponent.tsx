import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PaymentComponentProps {
  disabled?: boolean;
  mobileMoneyNumber: string;
  amount: number;
  userId: string;
  orderDescription: string;
  onPaymentSuccess: () => Promise<void> | void;
  onPaymentFailure?: (error: Error) => void;
  maxPollingAttempts?: number;
  pollingIntervalMs?: number;
  apiBaseUrl?: string;
  paymentMethod?: "mobile_money" | "card" | "bank_transfer";
}

const PaymentComponent: React.FC<PaymentComponentProps> = ({
  mobileMoneyNumber,
  disabled = false,
  amount,
  userId,
  orderDescription,
  onPaymentSuccess,
  onPaymentFailure,
  maxPollingAttempts = 12,
  pollingIntervalMs = 5000,
  apiBaseUrl = "https://onemarketapi.xyz/api/v1/payments",
  paymentMethod = "mobile_money",
}) => {
  const [paymentState, setPaymentState] = useState<
    "idle" | "pending" | "success" | "failed"
  >("idle");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [pollingAttempts, setPollingAttempts] = useState(0);

  const handlePayment = async () => {
    if (disabled) return;

    try {
      setIsProcessingPayment(true);
      setPaymentState("pending");

      const paymentData = {
        payer: mobileMoneyNumber.replace("+", ""),
        amount: amount,
        externalId: userId,
        description: orderDescription,
        paymentMethod,
      };

      const response = await fetch(`${apiBaseUrl}/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment initiation failed");
      }

      setReferenceId(data.referenceId || data.reference);
      startPaymentStatusPolling(data.referenceId || data.reference);
    } catch (error) {
      console.error("Payment Failed:", error);
      setPaymentState("failed");
      setIsProcessingPayment(false);
      onPaymentFailure?.(
        error instanceof Error ? error : new Error("Payment failed")
      );
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Payment failed"
      );
    }
  };

  const startPaymentStatusPolling = (paymentReference: string) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    setPollingAttempts(0);

    const interval = setInterval(async () => {
      try {
        setPollingAttempts((prev) => prev + 1);

        const response = await fetch(
          `${apiBaseUrl}/status/${paymentReference}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch payment status");
        }

        if (data.status === "SUCCESS") {
          clearInterval(interval);
          setPollingInterval(null);
          setPaymentState("success");
          setIsProcessingPayment(false);
          await onPaymentSuccess();
        } else if (data.status === "PENDING") {
          setPaymentState("pending");
        } else if (data.status === "FAILED") {
          clearInterval(interval);
          setPollingInterval(null);
          setPaymentState("failed");
          setIsProcessingPayment(false);
          onPaymentFailure?.(new Error("Payment failed"));
          Alert.alert("Error", "Payment failed. Please try again.");
        } else if (pollingAttempts >= maxPollingAttempts) {
          clearInterval(interval);
          setPollingInterval(null);
          setPaymentState("failed");
          setIsProcessingPayment(false);
          onPaymentFailure?.(new Error("Payment status check timed out"));
          Alert.alert(
            "Timeout",
            "Payment status check timed out. Please verify your payment."
          );
        }
      } catch (error) {
        console.error("Error fetching payment status:", error);
        if (pollingAttempts >= maxPollingAttempts) {
          clearInterval(interval);
          setPollingInterval(null);
          setPaymentState("failed");
          setIsProcessingPayment(false);
          onPaymentFailure?.(
            error instanceof Error
              ? error
              : new Error("Failed to verify payment status")
          );
          Alert.alert(
            "Error",
            error instanceof Error
              ? error.message
              : "Failed to verify payment status"
          );
        }
      }
    }, pollingIntervalMs);

    setPollingInterval(interval);
  };

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const getButtonText = () => {
    if (disabled) return "Fill All Fields To Pay";
    switch (paymentState) {
      case "pending":
        return "Processing Payment...";
      case "success":
        return "Payment Successful!";
      case "failed":
        return "Payment Failed - Try Again";
      default:
        return `Pay ${amount.toLocaleString()} XAF`;
    }
  };

  const getButtonColor = () => {
    if (disabled) return "#9CA3AF"; // gray-400
    switch (paymentState) {
      case "pending":
        return "#F59E0B"; // amber-500
      case "success":
        return "#10B981"; // emerald-500
      case "failed":
        return "#EF4444"; // red-500
      default:
        return "#3B82F6"; // blue-500
    }
  };

  const getButtonIcon = () => {
    if (disabled)
      return <Ionicons name="close-circle" size={20} color="white" />;
    switch (paymentState) {
      case "pending":
        return <ActivityIndicator color="white" />;
      case "success":
        return <Ionicons name="checkmark-circle" size={20} color="white" />;
      case "failed":
        return <Ionicons name="alert-circle" size={20} color="white" />;
      default:
        return <Ionicons name="wallet" size={20} color="white" />;
    }
  };

  const getButtonOpacity = () => {
    return disabled ? 0.7 : 1;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.paymentButton,
          {
            backgroundColor: getButtonColor(),
            opacity: getButtonOpacity(),
          },
        ]}
        onPress={handlePayment}
        disabled={isProcessingPayment || disabled}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          {getButtonIcon()}
          <Text style={styles.buttonText}>{getButtonText()}</Text>
        </View>
      </TouchableOpacity>

      {referenceId && (
        <>
          <Text style={styles.referenceText}>Reference: {referenceId}</Text>
          {paymentState.toLocaleUpperCase() !== "FAILED" && "SUCCESS" ? (
            <Text style={styles.statusText}>Please Dial Code: *126#</Text>
          ) : (
            <></>
          )}
        </>
      )}

      {paymentState === "pending" && (
        <Text style={styles.statusText}>
          Checking payment status... Attempt {pollingAttempts} of
          {maxPollingAttempts}
        </Text>
      )}

      {disabled && (
        <Text style={styles.disabledText}>
          Please verify all fields in the form and field .
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    width: "100%",
  },
  paymentButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  referenceText: {
    marginTop: 8,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  statusText: {
    marginTop: 8,
    fontSize: 12,
    color: "#F59E0B",
    textAlign: "center",
  },
  disabledText: {
    marginTop: 8,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default PaymentComponent;
