import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface USSDInputProps {
  value: string;
  label: string;
  onChangeText: (fullCode: string, isValid: boolean) => void;
  helperText?: string;
  placeholder?: string;
  clearButtonVisible?: boolean;
  onClear?: () => void;
  defaultValue?: string;
}

const USSDInput: React.FC<USSDInputProps> = ({
  label,
  helperText,
  placeholder = "*126*service*account*",
  clearButtonVisible = false,
  onClear,
  onChangeText,
  defaultValue = "",
}) => {
  // [prefix, service, account] - removed amount part
  const [values, setValues] = useState(["", "", ""]);
  const [activeField, setActiveField] = useState<number | null>(null);
  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  // Parse default value if provided
  useEffect(() => {
    if (defaultValue) {
      const parts = defaultValue.split("*").filter((part) => part !== "");
      if (parts.length >= 3 && parts[0] === "126") {
        // Only take the first three parts (126, service, account)
        setValues([parts[0], parts[1], parts[2].replace("#", "")]);
      }
    }
  }, [defaultValue]);

  // Combine values into full USSD code
  useEffect(() => {
    const fullCode = `*${values[0]}*${values[1]}*${values[2]}*`;
    const isValid =
      values[0].length === 3 && // 126 must be 3 digits
      (values[1].length === 1 || values[1].length === 2) && // service 1-2 digits
      values[2].length >= 6 &&
      values[2].length <= 9; // account 6-9 digits
    onChangeText(fullCode, isValid);
  }, [values]);

  const handleChange = (text: string, index: number) => {
    // Remove any non-numeric characters
    const numericText = text.replace(/[^0-9]/g, "");

    const newValues = [...values];
    newValues[index] = numericText;
    setValues(newValues);

    // Auto-advance to next field when reaching expected length
    const expectedLengths = [3, 2, 9]; // 126, service (max 2), account (max 9)
    if (index < 2 && numericText.length >= expectedLengths[index]) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleFocus = (index: number) => {
    setActiveField(index);
  };

  const handleBlur = () => {
    setActiveField(null);
  };

  const handleClear = () => {
    setValues(["", "", ""]);
    inputRefs[0].current?.focus();
    if (onClear) {
      onClear();
    }
    onChangeText("*126**", false);
  };

  const renderInputField = (index: number) => {
    let prefix = "";
    let suffix = "";

    if (index === 0) prefix = "*";
    if (index === 1 || index === 2) suffix = "*";

    return (
      <View key={index} style={styles.inputPartContainer}>
        <Text style={styles.inputSymbol}>{prefix}</Text>
        <TextInput
          ref={inputRefs[index]}
          style={[
            styles.partInput,
            activeField === index && styles.activeInput,
          ]}
          value={values[index]}
          onChangeText={(text) => handleChange(text, index)}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          keyboardType="number-pad"
          maxLength={index === 0 ? 3 : index === 1 ? 2 : 9}
          placeholder={
            index === 0 ? "126" : index === 1 ? "4 or 14" : "385129..."
          }
        />
        <Text style={styles.inputSymbol}>{suffix}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <View style={styles.combinedInput}>
          {[0, 1, 2].map(renderInputField)}
          {/* Display closing * but not as an input field */}
          <Text style={styles.inputSymbol}>*</Text>
        </View>

        {clearButtonVisible && values.some((v) => v) ? (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="gray" />
          </TouchableOpacity>
        ) : null}
      </View>

      {helperText && <Text style={styles.helperText}>{helperText}</Text>}

      {/* Display the combined USSD code for verification */}
      <Text style={styles.previewText}>
        USSD Code: *{values[0]}*{values[1]}*{values[2]}*
      </Text>

      {/* Validation indicators */}
      <View style={styles.validationContainer}>
        <Text
          style={[
            styles.validationText,
            values[0].length === 3 ? styles.valid : styles.invalid,
          ]}
        >
          126: {values[0].length}/3
        </Text>
        <Text
          style={[
            styles.validationText,
            values[1].length === 1 || values[1].length === 2
              ? styles.valid
              : styles.invalid,
          ]}
        >
          Service: {values[1].length} (1-2)
        </Text>
        <Text
          style={[
            styles.validationText,
            values[2].length >= 6 && values[2].length <= 9
              ? styles.valid
              : styles.invalid,
          ]}
        >
          Account: {values[2].length}/6-9
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: "100%",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
    color: "#374151",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: "white",
    borderColor: "#d1d5db",
  },
  combinedInput: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  inputPartContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  partInput: {
    minWidth: 40,
    paddingHorizontal: 4,
    height: 40,
    textAlign: "center",
    fontSize: 16,
    color: "#111827",
  },
  activeInput: {
    backgroundColor: "#f0f9ff",
    borderRadius: 4,
  },
  inputSymbol: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "bold",
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  helperText: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 4,
  },
  previewText: {
    marginTop: 8,
    color: "#4b5563",
    fontSize: 14,
    fontStyle: "italic",
  },
  validationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  validationText: {
    fontSize: 12,
  },
  valid: {
    color: "#10b981",
  },
  invalid: {
    color: "#ef4444",
  },
});

export default USSDInput;
