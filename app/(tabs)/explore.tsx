import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios"; // For API calls
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const { getUserProfile, signout, tokenAvailable, userProfile } = useAuth();

  const handlelogout = async () => {
    await signout();
    if (userProfile?.role === "administrator") {
      router.push("/(auth)/AuthScreen");
    } else {
      router.push("/(tabs)");
    }
  };

  // Fetch user profile when the component is mounted
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await getUserProfile();
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchProfile();
  }, []);

  if (!userProfile) {
    return <Text>Loading profile...</Text>;
  }

  // Default profile data
  const defaultProfile = {
    name: userProfile.name || "",
    email: userProfile.email || "",
    address: userProfile.address || "",
    city: userProfile.city || "",
    country: userProfile.country || "",
    phone: userProfile.phone || "",
    answer: userProfile.answer || "",
    orders: ["Order #1234", "Order #5678"],
  };

  // State hooks
  const [name, setName] = useState(defaultProfile.name);
  const [email, setEmail] = useState(defaultProfile.email);
  const [address, setAddress] = useState(defaultProfile.address);
  const [city, setCity] = useState(defaultProfile.city);
  const [country, setCountry] = useState(defaultProfile.country);
  const [phone, setPhone] = useState(defaultProfile.phone);
  const [answer, setAnswer] = useState(defaultProfile.answer);
  const [orders, setOrders] = useState(defaultProfile.orders);
  const [profileImage, setProfileImage] = useState(null);
  const [showPersonal, setShowPersonal] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Sorry, we need camera roll permissions");
      return;
    }

    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      uploadProfilePicture(uri);
    }
  };

  const uploadProfilePicture = async (uri: string) => {
    const token = await SecureStore.getItemAsync("userToken");
    const formData = new FormData();
    formData.append("file", {
      uri,
      type: "image/jpeg",
      name: "profile.jpg",
    });

    try {
      const response = await axios.put(
        "https://onemarketapi.xyz/api/v1/user/profile/picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state or trigger profile refresh
      await getUserProfile();
      Alert.alert("Success", "Profile picture updated");
    } catch (error) {
      console.error("Upload error", error);
      Alert.alert("Error", "Failed to upload profile picture");
    }
  };

  // Function to handle form submission
  const handleSubmit = () => {
    if (name && email && phone && address && city && country && answer) {
      Alert.alert(
        "Profile Updated",
        "Your profile has been updated successfully!"
      );
    } else {
      Alert.alert("Error", "Please fill out all the fields.");
    }
  };

  const handlesignup = () => {
    router.push({
      pathname: "/(auth)/AuthScreen",
      params: { mode: "signup" },
    });
  };
  const handlesignin = () => {
    router.push({
      pathname: "/(auth)/AuthScreen",
      params: { mode: "signin" },
    });
  };

  // Function to toggle visibility of sections
  const toggleShowPersonal = () => setShowPersonal(!showPersonal);
  const toggleShowOrders = () => setShowOrders(!showOrders);
  const toggleShowSecurity = () => setShowSecurity(!showSecurity);
  const toggleShowTerms = () => setShowTerms(!showTerms);

  return tokenAvailable ? (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Image */}
        <View style={styles.imageContainer}>
          {userProfile.profilePic?.url ? (
            <TouchableOpacity onPress={pickImage}>
              <Image
                source={{ uri: userProfile.profilePic.url }}
                style={styles.dummyImage}
              />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                onPress={pickImage}
                style={{
                  zIndex: 1003,
                  position: "absolute",
                  top: "70%",
                  backgroundColor: "lightgray",
                  width: 30,
                  borderRadius: 30,
                  paddingHorizontal: 5,
                  paddingVertical: 5,
                  right: "40%",
                }}
              >
                <Ionicons name="image" size={20} color={"green"} style={{}} />
              </TouchableOpacity>
              <TouchableOpacity onPress={pickImage}>
                <Image
                  source={require("@/assets/images/prodimg/user.png")}
                  style={styles.dummyImage}
                />
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Hi, {userProfile.name}</Text>
        </View>

        {/* Personal Details */}
        <TouchableOpacity onPress={toggleShowPersonal}>
          <Text style={styles.addImageText}>Personal Details</Text>
        </TouchableOpacity>

        {showPersonal && (
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            {address !== "123 Main St" && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Address"
                  value={address}
                  onChangeText={setAddress}
                />
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  value={city}
                  onChangeText={setCity}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Country"
                  value={country}
                  onChangeText={setCountry}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Security Answer"
                  value={answer}
                  onChangeText={setAnswer}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value="********" // Hide password value
                  secureTextEntry={true}
                  editable={false}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                {/* Save Changes Button */}
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Password is hidden */}
          </View>
        )}

        {/* Orders Section */}
        <TouchableOpacity onPress={toggleShowOrders}>
          <Text style={styles.addImageText}>Orders</Text>
        </TouchableOpacity>

        {showOrders && (
          <View style={styles.section}>
            {orders.map((order, index) => (
              <Text key={index} style={styles.orderItem}>
                {order}
              </Text>
            ))}
          </View>
        )}

        {/* Security Section */}
        <TouchableOpacity onPress={toggleShowSecurity}>
          <Text style={styles.addImageText}>Security</Text>
        </TouchableOpacity>

        {showSecurity && (
          <View style={styles.section}>
            <Text>Change Password</Text>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry={true}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              secureTextEntry={true}
            />
            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Terms and Conditions Section */}
        <TouchableOpacity onPress={toggleShowTerms}>
          <Text style={styles.addImageText}>Terms and Conditions</Text>
        </TouchableOpacity>
        {showTerms && (
          <View style={styles.section}>
            <Text>Terms and conditions content goes here...</Text>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handlelogout}>
          <Text style={styles.closeButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  ) : (
    <View style={styles.centeredContainer}>
      <Text style={{ color: "skyblue" }}>
        Not logged in. Please sign in or sign up.
      </Text>
      <View style={styles.authButtonsContainer}>
        <TouchableOpacity onPress={handlesignup} style={styles.authButton}>
          <Text style={styles.authButtonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handlesignin} style={styles.authButton}>
          <Text style={styles.authButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f4f4f4",
    padding: 20,
    marginTop: 50,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  dummyImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  addImageText: {
    fontSize: 16,
    color: "#007bff",
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 15,
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  orderItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  logoutButton: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  centeredContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  authButtonsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  authButton: {
    backgroundColor: "skyblue",
    padding: 12,
    borderRadius: 10,
  },
  authButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
