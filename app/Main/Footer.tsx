import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
// send a post reuest
// send a post reuest
// send a post reuest

const Footer: React.FC = () => {
  const { userProfile } = useAuth();
  return (
    <View style={styles.container}>
      {/* Links to important pages */}
      <View style={styles.linksContainer}>
        <TouchableOpacity onPress={() => console.log("Terms pressed")}>
          <Text style={styles.linkText}>Terms & Conditions</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log("Privacy pressed")}>
          <Text style={styles.linkText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log("About pressed")}>
          <Text style={styles.linkText}>About Us</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log("Contact pressed")}>
          <Text style={styles.linkText}>Contact Us</Text>
        </TouchableOpacity>
        {(userProfile?.role === "user" ||
          userProfile?.role === "administrator") && (
          <TouchableOpacity
            onPress={() => router.push("/Merchant/BecomeSeller")}
          >
            <Text style={styles.linkText}>Create a sellers account</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Copyright information */}
      <Text style={styles.copyrightText}>
        © {new Date().getFullYear()} V-Market. All rights reserved.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f8f8",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    alignItems: "center",
  },
  linksContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 10,
  },
  linkText: {
    color: "#007BFF",
    fontSize: 14,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  copyrightText: {
    color: "#666",
    fontSize: 12,
    textAlign: "center",
  },
});

export default Footer;
