import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type IdType = "NID" | "Passport" | "Driver's License";

interface IdFieldProps {
  label: string;
  selectedIdType: IdType | null;
  onIdTypeChange: (type: IdType) => void;
  idNumber: string;
  onIdNumberChange: (text: string) => void;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
}

const IdField: React.FC<IdFieldProps> = ({
  label,
  selectedIdType,
  onIdTypeChange,
  idNumber,
  onIdNumberChange,
  placeholder = "Enter ID number",
  helperText,
  required = false,
}) => {
  const [showIdTypePicker, setShowIdTypePicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const idTypeOptions: { type: IdType; icon: string; label: string }[] = [
    { type: "NID", icon: "id-card", label: "National ID" },
    { type: "Passport", icon: "book", label: "Passport" },
    { type: "Driver's License", icon: "car", label: "Driver's License" },
  ];

  const getIconForIdType = (
    type: IdType
  ): "id-card" | "book" | "car" | "help-circle" => {
    const option = idTypeOptions.find((opt) => opt.type === type);
    return option ? (option.icon as "id-card" | "book" | "car") : "help-circle";
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.requiredIndicator}>*</Text>}
      </View>

      {/* ID Type Selection */}
      <TouchableOpacity
        onPress={() => setShowIdTypePicker(true)}
        style={[
          styles.idTypeContainer,
          isFocused ? styles.focusedBorder : styles.defaultBorder,
        ]}
      >
        <View style={styles.idTypeContent}>
          {selectedIdType ? (
            <>
              <Ionicons
                name={getIconForIdType(selectedIdType)}
                size={20}
                color="#3b82f6"
                style={styles.idTypeIcon}
              />
              <Text style={styles.idTypeText}>
                {
                  idTypeOptions.find((opt) => opt.type === selectedIdType)
                    ?.label
                }
              </Text>
            </>
          ) : (
            <Text style={[styles.idTypeText, styles.placeholderText]}>
              Select ID type
            </Text>
          )}
        </View>
        <Ionicons
          name={showIdTypePicker ? "chevron-up" : "chevron-down"}
          size={16}
          color="#6b7280"
        />
      </TouchableOpacity>

      {/* ID Number Input */}
      {selectedIdType && (
        <View
          style={[
            styles.inputContainer,
            isFocused ? styles.focusedBorder : styles.defaultBorder,
          ]}
        >
          <TextInput
            style={styles.input}
            value={idNumber}
            placeholder={placeholder}
            onChangeText={onIdNumberChange}
            onBlur={() => setIsFocused(false)}
            keyboardType="phone-pad"
            autoCapitalize="characters"
          />
          {idNumber ? (
            <TouchableOpacity
              onPress={() => onIdNumberChange("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="gray" />
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {helperText && <Text style={styles.helperText}>{helperText}</Text>}

      {/* ID Type Picker Modal */}
      <Modal
        visible={showIdTypePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowIdTypePicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowIdTypePicker(false)}
        />
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerTitle}>Select ID Type</Text>
          <View style={styles.optionsContainer}>
            {idTypeOptions.map((option) => (
              <TouchableOpacity
                key={option.type}
                style={[
                  styles.optionItem,
                  selectedIdType === option.type && styles.selectedOptionItem,
                ]}
                onPress={() => {
                  onIdTypeChange(option.type);
                  setShowIdTypePicker(false);
                }}
              >
                <Ionicons
                  name={
                    option.icon as "id-card" | "book" | "car" | "help-circle"
                  }
                  size={20}
                  color={selectedIdType === option.type ? "#3b82f6" : "#6b7280"}
                  style={styles.optionIcon}
                />
                <Text
                  style={[
                    styles.optionText,
                    selectedIdType === option.type && styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: "100%",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  requiredIndicator: {
    color: "#ef4444",
    marginLeft: 4,
  },
  idTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    height: 48,
    backgroundColor: "white",
    marginBottom: 8,
  },
  idTypeContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  idTypeIcon: {
    marginRight: 8,
  },
  idTypeText: {
    fontSize: 16,
    color: "#111827",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: "white",
  },
  focusedBorder: {
    borderColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  defaultBorder: {
    borderColor: "#d1d5db",
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#111827",
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  placeholderText: {
    color: "#9ca3af",
  },
  helperText: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  pickerContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedOptionItem: {
    backgroundColor: "#f0f9ff",
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
  },
  selectedOptionText: {
    color: "#3b82f6",
    fontWeight: "500",
  },
});

export default IdField;
