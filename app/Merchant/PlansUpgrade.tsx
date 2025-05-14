import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PaymentComponent from "../components/PaymentComponent";
import PhoneField from "../components/PhoneField";

const PlansUpgrade = () => {
  const { userProfile } = useAuth();

  const [selectedAmount, setSelectedAmount] = React.useState<number | null>(
    1000
  );
  const [momoPayNumber, setMomoPayNumber] = useState("");
  const handlePlans = async () => {
    // Added 'async' since you're using await
    const Uid = userProfile?._id;

    if (!Uid) {
      console.error("User ID is missing");
      return; // or handle this case appropriately
    }

    const data = {
      productPayments:
        selectedAmount === 1000
          ? 1
          : selectedAmount === 1500
          ? 2
          : selectedAmount === 2000
          ? 3
          : selectedAmount === 4000
          ? 4
          : null,
    };

    try {
      const response = await fetch(
        `https://onemarketapi.xyz/api/v1/user/${Uid}/product-payments`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update product payments"
        );
      }

      const result = await response.json();
      console.log("Update successful:", result);
      // Handle successful response here (e.g., show success message)
    } catch (error) {
      console.error("Error updating product payments:", error);
      // Handle error here (e.g., show error message to user)
    }
  };
  const amounts = [
    { value: 1000, points: "10" },
    { value: 1500, points: "20" },
    { value: 2000, points: "40" },
    { value: 4000, points: "50+" },
  ];

  return (
    <View>
      <View style={styles.buttonGroup}>
        {amounts.map((amount) => (
          <TouchableOpacity
            key={amount.value}
            style={[
              styles.button,
              selectedAmount === amount.value && styles.selectedButton,
            ]}
            onPress={() => setSelectedAmount(amount.value)}
          >
            <Text
              style={[
                styles.amountText,
                selectedAmount === amount.value && styles.selectedAmountText,
              ]}
            >
              {amount.value} CFA
            </Text>
            <Text
              style={[
                styles.pointsText,
                selectedAmount === amount.value && styles.selectedPointsText,
              ]}
            >
              {amount.points} pts
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <PhoneField
        label="Enter Momo Number"
        placeholder="Enter your phone number"
        value={momoPayNumber}
        onChangeText={(text) => setMomoPayNumber(text)}
        onClear={() => setMomoPayNumber("")}
        // Removed the style prop as PhoneField does not support it
        helperText="Please enter a valid Momo number"
        // Removed isInvalid as it is not a valid prop for PhoneField
        clearButtonVisible={true}
        // Removed isFocused as it is not a valid prop for PhoneField
      />
      <PaymentComponent
        mobileMoneyNumber={momoPayNumber}
        amount={selectedAmount || 1000}
        userId={userProfile?._id || ""}
        orderDescription="Payment for groceries"
        onPaymentSuccess={async () => {
          console.log("Payment successful!");
          handlePlans();

          // Submit order or navigate to success screen
        }}
        onPaymentFailure={(error) => {
          Alert.alert("Payment Failed", "Please try again later.", [
            { text: "OK" },
          ]);
        }}
        maxPollingAttempts={15} // Wait up to 75 seconds (15 * 5s)
        paymentMethod="mobile_money"
        disabled={momoPayNumber.length <= 12}
      />
    </View>
  );
};

export default PlansUpgrade;

const styles = StyleSheet.create({
  readTermsText: {
    fontSize: 14,
    color: "#007bff",
    textDecorationLine: "underline",
    marginBottom: 15,
  },
  termsContainer: {
    marginBottom: 20,
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  termsText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  termsBody: {
    fontSize: 14,
    color: "#333",
  },
  noteText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  successMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  successText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#28a745",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  container: {
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 15,
    borderRadius: 4,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  lastInput: {
    marginBottom: 20,
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#007bff",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkedCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007bff",
  },
  checkboxText: {
    fontSize: 14,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 5,
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0", // slate-200
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 1,
    minWidth: 80,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  selectedButton: {
    backgroundColor: "#f0fdf4", // emerald-50
    borderColor: "#34d399", // emerald-400
    shadowColor: "#34d399",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  amountText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b", // slate-500
  },
  selectedAmountText: {
    color: "#047857", // emerald-700
  },
  pointsText: {
    fontSize: 12,
    color: "#94a3b8", // slate-400
    marginTop: 2,
  },
  selectedPointsText: {
    color: "#34d399", // emerald-400
  },
});
