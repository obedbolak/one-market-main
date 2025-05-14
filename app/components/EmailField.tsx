import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface EmailFieldProps {
  label: string;
  onChangeText: (text: string) => void; // Change type to a function
  helperText?: string;
  placeholder: string;
  clearButtonVisible?: boolean;
  onClear?: () => void;
}

const EmailField: React.FC<EmailFieldProps> = ({
  label,
  helperText,
  placeholder,
  clearButtonVisible = false,
  onClear,
  onChangeText,
}) => {
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

  const handleChange = (text: string) => {
    setEmail(text);
    setIsInvalid(!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(text)); // Basic email validation
    onChangeText(text); // Call the onChangeText function from props
  };

  const handleClear = () => {
    setEmail("");
    if (onClear) {
      onClear();
    }
    onChangeText(""); // Call the onChangeText function from props when clearing
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          isFocused ? styles.focusedBorder : styles.defaultBorder,
          isInvalid ? styles.invalidBorder : {},
        ]}
      >
        <Ionicons name="mail" size={20} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={email}
          placeholder={placeholder}
          onChangeText={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {clearButtonVisible && email ? (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="gray" />
          </TouchableOpacity>
        ) : null}
      </View>
      {helperText && <Text style={styles.helperText}>{helperText}</Text>}
      {isInvalid && <Text style={styles.errorText}>Invalid email address</Text>}
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
    padding: 3,
  },
  focusedBorder: {
    borderColor: "blue",
  },
  defaultBorder: {
    borderColor: "gray",
  },
  invalidBorder: {
    borderColor: "red",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 30,
  },
  clearButton: {
    padding: 4,
  },
  helperText: {
    color: "gray",
    fontSize: 14,
    marginTop: 4,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 4,
  },
});

export default EmailField;
