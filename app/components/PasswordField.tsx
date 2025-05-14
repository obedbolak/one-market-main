import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface PasswordFieldProps {
  label: string;
  placeholder: string;
  onChangeText: (text: string) => void; // Add onChangeText prop
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  placeholder,
  onChangeText, // Destructure onChangeText prop
}) => {
  const [password, setPassword] = useState("");
  const [isValid, setIsValid] = useState(false);

  const handleChange = (text: string) => {
    setPassword(text);
    // Basic validation: at least 8 characters, including a number
    const isValid = text.length >= 8 && /\d/.test(text);
    setIsValid(isValid);
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
        <Ionicons
          name="lock-closed"
          size={20}
          color="gray"
          style={styles.icon}
        />
        <TextInput
          secureTextEntry
          style={styles.input}
          value={password}
          placeholder={placeholder}
          onChangeText={handleChange}
        />
        {isValid && (
          <Ionicons name="checkmark-circle" size={20} color="green" />
        )}
      </View>
      {!isValid && password.length > 0 && (
        <Text style={styles.errorText}>
          Password must be at least 8 characters and include a number.
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

export default PasswordField;
