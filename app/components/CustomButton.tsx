import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface CustomButtonProps {
  theme: "primary" | "secondary" | "tertiary" | "error";
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean; // Add a disabled prop
}

const CustomButton: React.FC<CustomButtonProps> = ({
  theme,
  children,
  onPress,
  disabled = false, // Default to false
}) => {
  return (
    <TouchableOpacity
      onPress={!disabled ? onPress : undefined} // Disable onPress if disabled
      style={[
        styles.button,
        styles[theme],
        disabled && styles.disabled, // Apply disabled style if disabled
      ]}
      disabled={disabled} // Disable touch events
    >
      <Text
        style={[
          styles.buttonText,
          theme === "tertiary" ? styles.tertiaryText : {},
          disabled && styles.disabledText, // Apply disabled text style if disabled
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  disabled: {
    backgroundColor: "#d3d3d3", // Gray background for disabled state
  },
  disabledText: {
    color: "#a9a9a9", // Light gray text for disabled state
  },
  primary: {
    backgroundColor: "blue",
    color: "white",
  },
  secondary: {
    backgroundColor: "gray",
    color: "black",
  },
  tertiary: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "blue",
    color: "blue",
  },
  error: {
    backgroundColor: "red",
    color: "white",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  tertiaryText: {
    color: "blue",
  },
});

export default CustomButton;
