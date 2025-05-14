import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Button, Card, Snackbar, Text } from "react-native-paper";

interface SellerProfile {
  city: string;
  address: string;
  country: string;
  storeName: string;
  businessAddress: string;
  businessDescription: string;
  businessPhone: string;
}

const SellerSettings: React.FC = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState<Record<string, boolean>>({
    city: false,
    address: false,
    country: false,
    storeName: false,
    businessAddress: false,
    businessDescription: false,
    businessPhone: false,
  });

  const capitalizeWords = (str: string) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Form states
  const [city, setCity] = useState(`${userProfile?.city}`);
  const [address, setAddress] = useState(`${userProfile?.address}`);
  const [country, setCountry] = useState(`${userProfile?.country}`);
  const [storeName, setStoreName] = useState(`${userProfile?.storeName}`);
  const [businessAddress, setBusinessAddress] = useState(
    `${userProfile?.businessAddress}`
  );
  const [businessDescription, setBusinessDescription] = useState(
    `${userProfile?.businessDescription}`
  );
  const [businessPhone, setBusinessPhone] = useState(
    `${userProfile?.businessPhone}`
  );

  const handleFocus = (field: string) => {
    setIsFocused((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: string) => {
    setIsFocused((prev) => ({ ...prev, [field]: false }));
  };

  const updateBusinessDetails = async () => {
    const data = {
      city,
      address,
      country,
      storeName,
      businessAddress,
      businessDescription,
      businessPhone,
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
      } else {
        throw new Error("Failed to submit data");
      }
    } catch (error) {
      Alert.alert("Error", `There was an error: ${error}`, [{ text: "OK" }]);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your seller account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await axios.delete(
                `https://onemarketapi.xyz/api/v1/seller/delete/${userProfile?._id}`
              );
            } catch (error) {
              setMessage("Failed to delete account");
              console.error("Error deleting account:", error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Card style={styles.section}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Business Information</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Store Name</Text>
              <TextInput
                style={[
                  styles.input,
                  isFocused.storeName && styles.inputFocused,
                ]}
                placeholder="Enter store name"
                value={storeName}
                onChangeText={setStoreName}
                onFocus={() => handleFocus("storeName")}
                onBlur={() => handleBlur("storeName")}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Business Phone</Text>
              <TextInput
                style={[
                  styles.input,
                  isFocused.businessPhone && styles.inputFocused,
                ]}
                placeholder="Enter business phone"
                value={businessPhone}
                onChangeText={setBusinessPhone}
                keyboardType="phone-pad"
                onFocus={() => handleFocus("businessPhone")}
                onBlur={() => handleBlur("businessPhone")}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Business Description</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  isFocused.businessDescription && styles.inputFocused,
                ]}
                placeholder="Describe your business"
                value={businessDescription}
                onChangeText={setBusinessDescription}
                multiline
                numberOfLines={4}
                onFocus={() => handleFocus("businessDescription")}
                onBlur={() => handleBlur("businessDescription")}
              />
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Location Details</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Business Address</Text>
              <TextInput
                style={[
                  styles.input,
                  isFocused.businessAddress && styles.inputFocused,
                ]}
                placeholder="Enter business address"
                value={businessAddress}
                onChangeText={setBusinessAddress}
                onFocus={() => handleFocus("businessAddress")}
                onBlur={() => handleBlur("businessAddress")}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={[styles.input, isFocused.city && styles.inputFocused]}
                placeholder="Enter city"
                value={city}
                onChangeText={setCity}
                onFocus={() => handleFocus("city")}
                onBlur={() => handleBlur("city")}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[styles.input, isFocused.address && styles.inputFocused]}
                placeholder="Enter address"
                value={address}
                onChangeText={setAddress}
                onFocus={() => handleFocus("address")}
                onBlur={() => handleBlur("address")}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Country</Text>
              <TextInput
                style={[styles.input, isFocused.country && styles.inputFocused]}
                placeholder="Enter country"
                value={country}
                onChangeText={setCountry}
                onFocus={() => handleFocus("country")}
                onBlur={() => handleBlur("country")}
              />
            </View>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={updateBusinessDetails}
            style={styles.updateButton}
            labelStyle={styles.buttonLabel}
          >
            Update Profile
          </Button>

          <Button
            mode="contained"
            onPress={handleDeleteAccount}
            style={styles.deleteButton}
            labelStyle={styles.buttonLabel}
          >
            Delete Account
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={!!message}
        onDismiss={() => setMessage(null)}
        duration={3000}
      >
        {message}
      </Snackbar>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginVertical: 16,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    color: "#1a1a1a",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3f3f46",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    fontSize: 14,
    color: "#18181b",
    height: 44,
  },
  inputFocused: {
    borderColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  updateButton: {
    borderRadius: 8,
    backgroundColor: "#3b82f6",
    paddingVertical: 8,
  },
  deleteButton: {
    borderRadius: 8,
    backgroundColor: "#ef4444",
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
  },
});

export default SellerSettings;
