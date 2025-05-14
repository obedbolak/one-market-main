import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  DimensionValue,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DropdownItem {
  label: string;
  value: string;
  icon?: string;
}

interface DropdownProps {
  items: DropdownItem[];
  onSelect: (value: string) => void;
  placeholder?: string;
  selectedValue?: string;
  width?: DimensionValue; // Properly typed now
}

const Dropdown: React.FC<DropdownProps> = ({
  items,
  onSelect,
  placeholder = "Select an option",
  selectedValue,
  width = "100%",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedItem = items.find((item) => item.value === selectedValue);

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, { width }]}>
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <View style={styles.triggerContent}>
          {selectedItem?.icon && (
            <Ionicons
              name={selectedItem.icon as keyof typeof Ionicons.glyphMap}
              size={18}
              color="#64748b"
              style={styles.triggerIcon}
            />
          )}
          <Text style={styles.triggerText}>
            {selectedItem?.label || placeholder}
          </Text>
        </View>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color="#64748b"
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={[styles.dropdownMenu, { width }]}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              bounces={false}
            >
              {items.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.menuItem,
                    selectedValue === item.value && styles.menuItemSelected,
                  ]}
                  onPress={() => handleSelect(item.value)}
                  activeOpacity={0.7}
                >
                  {item.icon && (
                    <Ionicons
                      name={item.icon as keyof typeof Ionicons.glyphMap}
                      size={16}
                      color={
                        selectedValue === item.value ? "#3b82f6" : "#64748b"
                      }
                      style={styles.menuItemIcon}
                    />
                  )}
                  <Text
                    style={[
                      styles.menuItemText,
                      selectedValue === item.value &&
                        styles.menuItemTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {selectedValue === item.value && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color="#3b82f6"
                      style={styles.menuItemCheck}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Styles remain the same as previous example
const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginBottom: 16,
  },
  triggerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  triggerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  triggerIcon: {
    marginRight: 10,
  },
  triggerText: {
    color: "#1e293b",
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownMenu: {
    maxHeight: 300,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  menuItemSelected: {
    backgroundColor: "#f8fafc",
  },
  menuItemIcon: {
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    color: "#1e293b",
    fontSize: 16,
  },
  menuItemTextSelected: {
    color: "#3b82f6",
    fontWeight: "500",
  },
  menuItemCheck: {
    marginLeft: 12,
  },
});

export default Dropdown;
