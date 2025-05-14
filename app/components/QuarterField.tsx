import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Quarter {
  id: string;
  name: string;
  city: string;
  isCustom?: boolean;
}

interface QuarterFieldProps {
  label: string;
  onChangeText: (text: string, quarter?: Quarter) => void;
  helperText?: string;
  placeholder?: string;
  clearButtonVisible?: boolean;
  onClear?: () => void;
  defaultValue?: string;
  selectedCity?: string; // To filter quarters by city
}

// Sample quarters in major Cameroonian cities
const cameroonQuarters: Quarter[] = [
  // Yaoundé
  { id: "1", name: "Bastos", city: "Yaoundé" },
  { id: "2", name: "Messa", city: "Yaoundé" },
  { id: "3", name: "Nlongkak", city: "Yaoundé" },
  { id: "4", name: "Efoulan", city: "Yaoundé" },
  { id: "5", name: "Mokolo", city: "Yaoundé" },

  // Douala
  { id: "6", name: "Bonapriso", city: "Douala" },
  { id: "7", name: "Bonanjo", city: "Douala" },
  { id: "8", name: "Akwa", city: "Douala" },
  { id: "9", name: "Deïdo", city: "Douala" },
  { id: "10", name: "New Bell", city: "Douala" },

  // Bafoussam
  { id: "11", name: "Banengo", city: "Bafoussam" },
  { id: "12", name: "Djeleng", city: "Bafoussam" },
  { id: "13", name: "Ndiangdam", city: "Bafoussam" },

  // Bamenda
  { id: "14", name: "Commercial Avenue", city: "Bamenda" },
  { id: "15", name: "Nkwen", city: "Bamenda" },
  { id: "16", name: "Mankon", city: "Bamenda" },

  // Garoua
  { id: "17", name: "Roumdé Adjia", city: "Garoua" },
  { id: "18", name: "Lamy", city: "Garoua" },

  // Maroua
  { id: "19", name: "Domayo", city: "Maroua" },
  { id: "20", name: "Zokok", city: "Maroua" },

  // Buea
  { id: "21", name: "Molyko", city: "Buea" },
  { id: "22", name: "Bonduma", city: "Buea" },

  // Limbe
  { id: "23", name: "Down Beach", city: "Limbe" },
  { id: "24", name: "Bota", city: "Limbe" },

  // Ebolowa
  { id: "25", name: "Melen", city: "Ebolowa" },
  { id: "26", name: "Mvog-Betsi", city: "Ebolowa" },

  // Ngaoundéré
  { id: "27", name: "Djalingo", city: "Ngaoundéré" },
  { id: "28", name: "Sabongari", city: "Ngaoundéré" },
];

const QuarterField: React.FC<QuarterFieldProps> = ({
  label,
  helperText,
  placeholder = "Select a quarter",
  clearButtonVisible = false,
  onClear,
  onChangeText,
  defaultValue = "",
  selectedCity,
}) => {
  const [quarter, setQuarter] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showQuarterPicker, setShowQuarterPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateOption, setShowCreateOption] = useState(false);
  const quarterInputRef = useRef<TextInput>(null);

  // Filter quarters by selected city if provided
  const filteredQuarters = selectedCity
    ? cameroonQuarters.filter((q) => q.city === selectedCity)
    : cameroonQuarters;

  // Further filter by search query
  const searchedQuarters = searchQuery
    ? filteredQuarters.filter(
        (q) =>
          q.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.city.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredQuarters;

  // Check if the current input doesn't match any quarter
  useEffect(() => {
    if (
      quarter &&
      !filteredQuarters.some(
        (q) => q.name.toLowerCase() === quarter.toLowerCase()
      )
    ) {
      setShowCreateOption(true);
    } else {
      setShowCreateOption(false);
    }
  }, [quarter, filteredQuarters]);

  useEffect(() => {
    if (defaultValue) {
      const defaultQuarter = cameroonQuarters.find(
        (q) => q.name === defaultValue
      );
      if (defaultQuarter) {
        setSelectedQuarter(defaultQuarter);
        setQuarter(defaultQuarter.name);
      }
    }
  }, [defaultValue]);

  const handleQuarterSelect = (q: Quarter) => {
    setSelectedQuarter(q);
    setQuarter(q.name);
    setShowQuarterPicker(false);
    setSearchQuery("");
    onChangeText(q.name, q);
  };

  const handleClear = () => {
    setQuarter("");
    setSelectedQuarter(null);
    if (onClear) {
      onClear();
    }
    onChangeText("", undefined);
  };

  const handleInputChange = (text: string) => {
    setQuarter(text);
    // If the text doesn't match any quarter, clear the selection
    if (
      !filteredQuarters.some((q) => q.name.toLowerCase() === text.toLowerCase())
    ) {
      setSelectedQuarter(null);
      onChangeText(text, undefined);
    }
  };

  const handleCreateNewQuarter = () => {
    if (!quarter.trim()) return;

    Alert.alert(
      "Create New Quarter",
      `Do you want to create "${quarter}"${
        selectedCity ? ` in ${selectedCity}` : ""
      }?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Create",
          onPress: () => {
            const newQuarter: Quarter = {
              id: `custom-${Date.now()}`,
              name: quarter.trim(),
              city: selectedCity || "Unknown City",
              isCustom: true,
            };
            handleQuarterSelect(newQuarter);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          isFocused ? styles.focusedBorder : styles.defaultBorder,
        ]}
      >
        <TouchableOpacity
          onPress={() => setShowQuarterPicker(true)}
          style={styles.selector}
        >
          <Ionicons
            name="map"
            size={20}
            color="#6b7280"
            style={styles.mapIcon}
          />
        </TouchableOpacity>

        <TextInput
          ref={quarterInputRef}
          style={styles.input}
          value={quarter}
          placeholder={placeholder}
          onChangeText={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            setShowQuarterPicker(true);
          }}
          onBlur={() => setIsFocused(false)}
        />

        {clearButtonVisible && quarter ? (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="gray" />
          </TouchableOpacity>
        ) : null}
      </View>

      {helperText && <Text style={styles.helperText}>{helperText}</Text>}

      {/* Quarter Picker Modal */}
      <Modal
        visible={showQuarterPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQuarterPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowQuarterPicker(false)}
        />
        <View style={styles.quarterPickerContainer}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#9ca3af"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search quarters${
                selectedCity ? ` in ${selectedCity}` : ""
              }...`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>

          {selectedCity && (
            <Text style={styles.cityFilterText}>
              Showing quarters in: {selectedCity}
            </Text>
          )}

          <FlatList
            data={searchedQuarters}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.quarterItem,
                  selectedQuarter?.id === item.id && styles.selectedQuarterItem,
                ]}
                onPress={() => handleQuarterSelect(item)}
              >
                <View>
                  <Text style={styles.quarterName}>{item.name}</Text>
                  <Text style={styles.quarterCity}>{item.city}</Text>
                </View>
                {selectedQuarter?.id === item.id && (
                  <Ionicons name="checkmark" size={20} color="#3b82f6" />
                )}
              </Pressable>
            )}
            ListFooterComponent={
              showCreateOption && quarter.trim() ? (
                <Pressable
                  style={styles.createQuarterItem}
                  onPress={handleCreateNewQuarter}
                >
                  <View style={styles.createQuarterContent}>
                    <Ionicons name="add-circle" size={20} color="#3b82f6" />
                    <Text style={styles.createQuarterText}>
                      Create "{quarter.trim()}"
                      {selectedCity ? ` in ${selectedCity}` : ""}
                    </Text>
                  </View>
                </Pressable>
              ) : null
            }
            keyboardShouldPersistTaps="handled"
          />
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
  selector: {
    paddingRight: 8,
    marginRight: 8,
  },
  mapIcon: {
    marginTop: 2,
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
  helperText: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  quarterPickerContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: Platform.OS === "ios" ? "50%" : "60%",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "#111827",
  },
  cityFilterText: {
    paddingBottom: 8,
    color: "#4b5563",
    fontStyle: "italic",
  },
  quarterItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  selectedQuarterItem: {
    backgroundColor: "#f0f9ff",
  },
  quarterName: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  quarterCity: {
    fontSize: 14,
    color: "#6b7280",
  },
  createQuarterItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  createQuarterContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  createQuarterText: {
    fontSize: 16,
    color: "#3b82f6",
    marginLeft: 8,
  },
});

export default QuarterField;
