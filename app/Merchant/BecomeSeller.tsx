import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store"; // Import SecureStore
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CityField from "../components/CityField";
import PhoneField from "../components/PhoneField";
import USSDInput from "../components/USSDInput";

const SendDataComponent = () => {
  const { userProfile, getUserProfile } = useAuth();
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("Cameroon");
  const [storeName, setStoreName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showTerms, setShowTerms] = useState(false); // State to control showing of terms

  const scrollViewRef = useRef<ScrollView>(null); // Reference for ScrollView with proper typing
  const [USSDCode, setUSSDCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [token, setToken] = useState<string | null>(null); // State to store
  const [momoPayNumber, setMomoPayNumber] = useState(""); // State to store Momo number
  const amounts = [
    { value: 1000, points: "10" },
    { value: 1500, points: "20" },
    { value: 2000, points: "40" },
    { value: 4000, points: "50+" },
  ];

  const [selectedAmount, setSelectedAmount] = React.useState<number | null>(
    1000
  );
  // sJWT token

  // Use useEffect to fetch the token when the component mounts
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync("token"); // Retrieve the token from SecureStore
        if (savedToken) {
          setToken(savedToken); // Set token in state if it exists
        } else {
          setResponseMessage("Token not found. Please log in again.");
        }
      } catch (error) {
        console.error("Error retrieving token from SecureStore", error);
        setResponseMessage("Error retrieving token.");
      }
    };

    fetchToken(); // Call the function to fetch token on mount
  }, []);

  const changeRole = async () => {
    if (!token) {
      setResponseMessage("No token found. Please log in first.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://onemarketapi.xyz/api/v1/user/${userProfile?._id}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Use the token from SecureStore
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResponseMessage("Role changed successfully to admin!");
      } else {
        setResponseMessage(data.message || "Failed to change role");
      }
    } catch (error) {
      console.error("Error:", error);
      setResponseMessage("Error changing role");
    } finally {
      setLoading(false);
    }
  };
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

  // Function to handle sending the data
  const sendData = async () => {
    const data = {
      city,
      address,
      country,
      storeName,
      businessAddress,
      businessDescription,
      businessPhone,
      USSDCode,
    };
    try {
      const response = await fetch(
        "https://onemarketapi.xyz/api/v1/user/update-profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const result = await response.json();
        Alert.alert("Success", "Data submitted successfully!", [
          { text: "OK" },
        ]);
        changeRole();
        // Clear all fields after successful submission
        setCity("");
        setAddress("");
        setCountry("");
        setStoreName("");
        setBusinessAddress("");
        setBusinessDescription("");
        setBusinessPhone("");
        setTermsAccepted(false);
        setIsSuccess(true);
        setUSSDCode("");
      } else {
        throw new Error("Failed to submit data");
      }
    } catch (error) {
      Alert.alert("Error", `There was an error: ${error}`, [{ text: "OK" }]);
    }
  };

  // Check if all fields are filled and terms are accepted
  const isFormValid = () => {
    return (
      city &&
      address &&
      country &&
      storeName &&
      businessAddress &&
      businessDescription &&
      businessPhone &&
      USSDCode &&
      termsAccepted
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      {isSuccess ? (
        <View style={styles.successMessageContainer}>
          <Text style={styles.successText}>Success!</Text>
          <Text style={styles.noteText}>
            Please note that it might take anywhere from Minutes to 24 hours for
            the admins to check and approve your application. Please be patient.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/(tabs)")} // Back functionality
          >
            <Text style={styles.backButtonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView ref={scrollViewRef}>
          <View
            style={{
              flexDirection: "row",

              alignItems: "center",
              justifyContent: "flex-start",
              marginHorizontal: 20,
              gap: 60,
            }}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" color={"black"} size={24} />
            </TouchableOpacity>
            <Text
              style={{ fontWeight: 600, fontSize: 24, alignSelf: "center" }}
            >
              Register as Seller
            </Text>
          </View>
          <View style={styles.container}>
            <Text style={{ alignSelf: "center" }}>Personal Information</Text>
            <CityField
              label="City/Region"
              placeholder="Enter your city"
              value={city}
              onChangeText={setCity}
              onClear={() => setCity("")}
              helperText="Please enter a valid city"
              clearButtonVisible={true}
            />
            <Text style={styles.label}>Address:</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Enter address(Bastos, etug-ebe, Shappel-Obili)"
              style={styles.input}
            />
            <Text style={styles.label}>Country:</Text>
            <TextInput
              value={country}
              onChangeText={setCountry}
              placeholder="Enter (Cameroon, Ghana, etc)"
              style={styles.input}
            />
            <Text style={{ alignSelf: "center" }}>Business Information</Text>
            <Text style={styles.label}>Store Name:</Text>
            <TextInput
              value={storeName}
              onChangeText={setStoreName}
              placeholder="Enter (Erics-Shop)"
              style={styles.input}
            />
            <Text style={styles.label}>Business Address:</Text>
            <TextInput
              value={businessAddress}
              onChangeText={setBusinessAddress}
              placeholder="Enter business (Bastos, etug-ebe, Shappel-Obili)"
              style={styles.input}
            />
            <Text style={styles.label}>Business Description:</Text>
            <TextInput
              value={businessDescription}
              onChangeText={setBusinessDescription}
              placeholder="Enter (An Electronic Shop .... value)"
              style={styles.input}
            />
            {/* <TextInput
              value={businessPhone}
              onChangeText={setBusinessPhone}
              placeholder="Enter (+237 68564756)"
              style={[styles.input, styles.lastInput]}
            /> */}
            <PhoneField
              label="Business Phone"
              placeholder="Enter your phone number"
              value={businessPhone}
              onChangeText={setBusinessPhone}
              onClear={() => setBusinessPhone("")}
              helperText="Please enter a valid phone number"
              clearButtonVisible={true}
            />
            <Text style={styles.label}>PAYMENT SECTION </Text>
            <Text style={styles.label}>
              Please make sure to provide your payment details for the
              transactions.
            </Text>
            <USSDInput
              label="USSD Code"
              placeholder="Enter your USSD code"
              onChangeText={(text) => {
                setUSSDCode(text);
              }}
              value={USSDCode}
              onClear={() => setUSSDCode("")}
              helperText="Please enter a valid USSD code"
              clearButtonVisible={true}
            />

              {/* Terms and Conditions Radio Button */}
              <View style={styles.radioButtonContainer}>
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => setTermsAccepted(true)}
                >
                  {termsAccepted && <View style={styles.checkedCircle} />}
                </TouchableOpacity>
                <Text style={styles.checkboxText}>
                  I accept the Terms and Conditions
                </Text>
              </View>
              {/* Read Terms Button */}
              <TouchableOpacity
                onPress={() => {
                  setShowTerms(!showTerms);
                  if (!showTerms) {
                    scrollViewRef.current?.scrollToEnd({ animated: true }); // Scroll to bottom when showing terms
                  }
                }}
              >
                <Text style={styles.readTermsText}>
                  {showTerms
                    ? "Hide Terms and Conditions"
                    : "Read Terms and Conditions"}
                </Text>
              </TouchableOpacity>

            

            {/* Submit Button with TouchableOpacity and opacity change */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                { opacity: isFormValid() ? 1 : 0.5 }, // Change opacity if form is not valid
              ]}
              onPress={sendData}
              disabled={!isFormValid()}
            >
              <Text style={styles.submitButtonText}>Become a Seller</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

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

export default SendDataComponent;
