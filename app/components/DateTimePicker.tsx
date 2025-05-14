import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DateTimeFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  helperText?: string;
  mode?: "date" | "time" | "datetime";
  minimumDate?: Date;
  maximumDate?: Date;
}

const DateTimeField: React.FC<DateTimeFieldProps> = ({
  label,
  value = new Date(),
  onChange,
  placeholder = "Select date and time",
  helperText,
  mode = "datetime",
  minimumDate,
  maximumDate,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">(
    mode === "datetime" ? "date" : mode
  );
  const [internalDate, setInternalDate] = useState(value);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (event.type === "dismissed") {
      setShowPicker(false);
      return;
    }

    const currentDate = selectedDate || internalDate;
    setInternalDate(currentDate);

    if (mode === "datetime" && pickerMode === "date") {
      // After selecting date, switch to time picker
      setPickerMode("time");
    } else {
      // For time-only or after time selection, close the picker
      setShowPicker(false);
      onChange(currentDate);
    }
  };

  const handlePress = () => {
    if (mode === "datetime") {
      // For datetime, start with date picker
      setPickerMode("date");
    } else {
      // For date or time only, use the specified mode
      setPickerMode(mode);
    }
    setShowPicker(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity onPress={handlePress} style={styles.inputContainer}>
        <View style={styles.inputContent}>
          <Ionicons
            name="calendar"
            size={20}
            color="#6b7280"
            style={styles.icon}
          />
          <Text style={[styles.inputText, value ? {} : styles.placeholderText]}>
            {value
              ? mode === "date"
                ? formatDate(value)
                : mode === "time"
                ? formatTime(value)
                : `${formatDate(value)} ${formatTime(value)}`
              : placeholder}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={16} color="#6b7280" />
      </TouchableOpacity>

      {helperText && <Text style={styles.helperText}>{helperText}</Text>}

      {/* Date/Time Picker */}
      {showPicker &&
        (Platform.OS === "android" ? (
          <DateTimePicker
            value={internalDate}
            mode={pickerMode}
            display="default"
            onChange={handleDateChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        ) : (
          <Modal
            transparent
            animationType="slide"
            visible={showPicker}
            onRequestClose={() => setShowPicker(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowPicker(false)}
            />
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={internalDate}
                mode={pickerMode}
                display="spinner"
                onChange={handleDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                textColor="#000000"
                themeVariant="light"
                style={styles.picker}
              />
              <View style={styles.pickerActions}>
                <TouchableOpacity
                  onPress={() => setShowPicker(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowPicker(false);
                    onChange(internalDate);
                  }}
                  style={styles.confirmButton}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        ))}
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
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    height: 48,
    backgroundColor: "white",
  },
  inputContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
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
  picker: {
    width: "100%",
  },
  pickerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#6b7280",
    fontSize: 16,
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#3b82f6",
    borderRadius: 4,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default DateTimeField;
