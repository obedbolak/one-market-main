import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ProfileFormData {
  name: string;
  email: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  answer: string;
}

export default function ProfileScreen() {
  const { 
    userProfile, 
    tokenAvailable, 
    getUserProfile, 
    signout 
  } = useAuth();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    email: "",
    address: "",
    city: "",
    country: "",
    phone: "",
    answer: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [sections, setSections] = useState({
    personal: false,
    orders: false,
    security: false,
    terms: false,
  });

  // Initialize form with user data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        await getUserProfile();
        setLoading(false);
      } catch (error) {
        console.error("Failed to load profile:", error);
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Update form when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        email: userProfile.email || "",
        address: userProfile.address || "",
        city: userProfile.city || "",
        country: userProfile.country || "",
        phone: userProfile.phone || "",
        answer: userProfile.answer || "",
      });
    }
  }, [userProfile]);

  const handleLogout = async () => {
    await signout();
    router.replace(userProfile?.role === "administrator" 
      ? "/(auth)/AuthScreen" 
      : "/(tabs)");
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "We need access to your photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      await uploadProfilePicture(result.assets[0].uri);
    }
  };

  const uploadProfilePicture = async (uri: string) => {
    const token = await SecureStore.getItemAsync("token");
    if (!token) return;

    const formData = new FormData();
    formData.append("file", {
      uri,
      type: "image/jpeg",
      name: "profile.jpg",
    });

    try {
      await axios.put(
        "https://onemarketapi.xyz/api/v1/user/profile/picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await getUserProfile();
      Alert.alert("Success", "Profile picture updated");
    } catch (error) {
      console.error("Upload error", error);
      Alert.alert("Error", "Failed to update profile picture");
    }
  };

  const handleUpdateProfile = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setUpdating(true);
    try {
      const token = await SecureStore.getItemAsync("token");
      await axios.put(
        "https://onemarketapi.xyz/api/v1/user/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await getUserProfile();
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error("Update error", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const toggleSection = (section: keyof typeof sections) => {
    setSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChangeText = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!tokenAvailable) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authTitle}>Please sign in to view your profile</Text>
        <View style={styles.authButtons}>
          <TouchableOpacity 
            style={styles.authButton}
            onPress={() => router.push("/(auth)/AuthScreen")}
          >
            <Text style={styles.authButtonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.authButton, styles.signUpButton]}
            onPress={() => router.push({
              pathname: "/(auth)/AuthScreen",
              params: { mode: "signup" },
            })}
          >
            <Text style={styles.authButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          {userProfile?.profilePic?.url ? (
            <Image
              source={{ uri: userProfile.profilePic.url }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color="#fff" />
            </View>
          )}
          <View style={styles.editIcon}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.userName}>{userProfile?.name || "User"}</Text>
        <Text style={styles.userEmail}>{userProfile?.email}</Text>
      </View>

      {/* Personal Details Section */}
      <TouchableOpacity 
        onPress={() => toggleSection("personal")}
        style={styles.sectionHeader}
      >
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <Ionicons 
          name={sections.personal ? "chevron-up" : "chevron-down"} 
          size={24} 
        />
      </TouchableOpacity>

      {sections.personal && (
        <View style={styles.sectionContent}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={formData.name}
            onChangeText={(text) => handleChangeText("name", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={formData.email}
            onChangeText={(text) => handleChangeText("email", text)}
            keyboardType="email-address"
            editable={false} // Email often can't be changed
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={formData.phone}
            onChangeText={(text) => handleChangeText("phone", text)}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={formData.address}
            onChangeText={(text) => handleChangeText("address", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="City"
            value={formData.city}
            onChangeText={(text) => handleChangeText("city", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Country"
            value={formData.country}
            onChangeText={(text) => handleChangeText("country", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Security Answer"
            value={formData.answer}
            onChangeText={(text) => handleChangeText("answer", text)}
          />
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleUpdateProfile}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Security Section */}
      <TouchableOpacity 
        onPress={() => toggleSection("security")}
        style={styles.sectionHeader}
      >
        <Text style={styles.sectionTitle}>Security</Text>
        <Ionicons 
          name={sections.security ? "chevron-up" : "chevron-down"} 
          size={24} 
        />
      </TouchableOpacity>

      {sections.security && (
        <View style={styles.sectionContent}>
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            secureTextEntry
          />
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Change Password</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  authTitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  authButtons: {
    flexDirection: "row",
    gap: 15,
  },
  authButton: {
    backgroundColor: "skyblue",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  signUpButton: {
    backgroundColor: "#4CAF50",
  },
  authButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "skyblue",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  sectionContent: {
    paddingVertical: 15,
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "skyblue",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 30,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f44336",
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});