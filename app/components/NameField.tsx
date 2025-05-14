import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface FullNameFieldProps {
  label: string;
  placeholder: string;
  onChangeText: (text: string) => void; // Add onChangeText prop
}

const FullNameField: React.FC<FullNameFieldProps> = ({
  label,
  placeholder,
  onChangeText, // Destructure onChangeText prop
}) => {
  const [fullName, setFullName] = useState("");
  const [isValid, setIsValid] = useState(false);

  const handleChange = (text: string) => {
    setFullName(text);
    // Validate: Check if the name has at least two words
    const words = text.trim().split(" ");
    const valid = words.length >= 2;
    setIsValid(valid);
    onChangeText(text); // Call the onChangeText function from props
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          isValid ? styles.validBorder : styles.invalidBorder,
        ]}
      >
        <Ionicons name="person" size={20} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={fullName}
          placeholder={placeholder}
          onChangeText={handleChange}
        />
        {isValid && (
          <Ionicons name="checkmark-circle" size={20} color="green" />
        )}
      </View>
      {!isValid && fullName.length > 0 && (
        <Text style={styles.errorText}>
          Please enter your full name (first and last).
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    padding: 4,
  },
  validBorder: {
    borderColor: "green",
  },
  invalidBorder: {
    borderColor: "gray",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 30,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 4,
  },
});

export default FullNameField;
