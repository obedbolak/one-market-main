import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
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

interface City {
  id: string;
  name: string;
  region: string;
}

interface CityFieldProps {
  value: string;
  label: string;
  onChangeText: (text: string, city?: City) => void;
  helperText?: string;
  placeholder?: string;
  clearButtonVisible?: boolean;
  onClear?: () => void;
  defaultValue?: string;
  toggleBranch?: boolean;
  settoggleBranch: React.Dispatch<React.SetStateAction<boolean>>;
}

// List of major cities in Cameroon by region
const cameroonCities: City[] = [
  // Adamawa Region
  { id: "1", name: "Ngaoundéré", region: "Adamawa" },
  { id: "2", name: "Meiganga", region: "Adamawa" },
  { id: "3", name: "Tibati", region: "Adamawa" },

  // Centre Region
  { id: "4", name: "Yaoundé", region: "Centre" },
  { id: "5", name: "Mbalmayo", region: "Centre" },
  { id: "6", name: "Bafia", region: "Centre" },
  { id: "7", name: "Monatélé", region: "Centre" },

  // East Region
  { id: "8", name: "Bertoua", region: "East" },
  { id: "9", name: "Batouri", region: "East" },
  { id: "10", name: "Abong-Mbang", region: "East" },

  // Far North Region
  { id: "11", name: "Maroua", region: "Far North" },
  { id: "12", name: "Kousséri", region: "Far North" },
  { id: "13", name: "Mora", region: "Far North" },

  // Littoral Region
  { id: "14", name: "Douala", region: "Littoral" },
  { id: "15", name: "Nkongsamba", region: "Littoral" },
  { id: "16", name: "Edéa", region: "Littoral" },

  // North Region
  { id: "17", name: "Garoua", region: "North" },
  { id: "18", name: "Guider", region: "North" },
  { id: "19", name: "Poli", region: "North" },

  // Northwest Region
  { id: "20", name: "Bamenda", region: "Northwest" },
  { id: "21", name: "Kumbo", region: "Northwest" },
  { id: "22", name: "Wum", region: "Northwest" },

  // West Region
  { id: "23", name: "Bafoussam", region: "West" },
  { id: "24", name: "Dschang", region: "West" },
  { id: "25", name: "Foumban", region: "West" },

  // South Region
  { id: "26", name: "Ebolowa", region: "South" },
  { id: "27", name: "Kribi", region: "South" },
  { id: "28", name: "Sangmélima", region: "South" },

  // Southwest Region
  { id: "29", name: "Buea", region: "Southwest" },
  { id: "30", name: "Limbe", region: "Southwest" },
  { id: "31", name: "Mamfe", region: "Southwest" },
];

const CityField: React.FC<CityFieldProps> = ({
  label,
  helperText,
  placeholder = "Select a city",
  clearButtonVisible = false,
  onClear,
  onChangeText,
  defaultValue = "",
}) => {
  const [city, setCity] = useState("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const cityInputRef = useRef<TextInput>(null);

  const filteredCities = searchQuery
    ? cameroonCities.filter(
        (city) =>
          city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.region.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : cameroonCities;

  useEffect(() => {
    if (defaultValue) {
      const defaultCity = cameroonCities.find((c) => c.name === defaultValue);
      if (defaultCity) {
        setSelectedCity(defaultCity);
        setCity(defaultCity.name);
      }
    }
  }, [defaultValue]);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setCity(city.name);
    setShowCityPicker(false);
    setSearchQuery("");
    onChangeText(city.name, city);
  };

  const handleClear = () => {
    setCity("");
    setSelectedCity(null);
    if (onClear) {
      onClear();
    }
    onChangeText("", undefined);
  };

  const handleInputChange = (text: string) => {
    setCity(text);
    // If the text doesn't match any city, clear the selection
    if (
      !cameroonCities.some((c) => c.name.toLowerCase() === text.toLowerCase())
    ) {
      setSelectedCity(null);
      onChangeText(text, undefined);
    }
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
          onPress={() => setShowCityPicker(true)}
          style={styles.selector}
        >
          <Ionicons
            name="location"
            size={20}
            color="#6b7280"
            style={styles.locationIcon}
          />
        </TouchableOpacity>

        <TextInput
          ref={cityInputRef}
          style={styles.input}
          value={city}
          placeholder={placeholder}
          onChangeText={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            setShowCityPicker(true);
          }}
          onBlur={() => setIsFocused(false)}
        />

        {clearButtonVisible && city ? (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="gray" />
          </TouchableOpacity>
        ) : null}
      </View>

      {helperText && <Text style={styles.helperText}>{helperText}</Text>}

      {/* City Picker Modal */}
      <Modal
        visible={showCityPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCityPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCityPicker(false)}
        />
        <View style={styles.cityPickerContainer}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#9ca3af"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cities..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
          <FlatList
            data={filteredCities}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.cityItem,
                  selectedCity?.id === item.id && styles.selectedCityItem,
                ]}
                onPress={() => handleCitySelect(item)}
              >
                <View>
                  <Text style={styles.cityName}>{item.name}</Text>
                  <Text style={styles.cityRegion}>{item.region} Region</Text>
                </View>
                {selectedCity?.id === item.id && (
                  <Ionicons name="checkmark" size={20} color="#3b82f6" />
                )}
              </Pressable>
            )}
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
  locationIcon: {
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
  cityPickerContainer: {
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
  cityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  selectedCityItem: {
    backgroundColor: "#f0f9ff",
  },
  cityName: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  cityRegion: {
    fontSize: 14,
    color: "#6b7280",
  },
});

export default CityField;
