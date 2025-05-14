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

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag?: string;
  pattern: RegExp;
}

interface PhoneFieldProps {
  value: string; // Added the 'value' property
  toggleBranch?: boolean; // Added toggleBranch prop

  label: string;
  onChangeText: (text: string, isValid: boolean) => void;
  helperText?: string;
  placeholder?: string;
  clearButtonVisible?: boolean;
  onClear?: () => void;
  defaultCountry?: string;
}

const countries: Country[] = [
  { code: "US", name: "United States", dialCode: "+1", pattern: /^\d{10}$/ },
  { code: "GB", name: "United Kingdom", dialCode: "+44", pattern: /^\d{10}$/ },
  { code: "FR", name: "France", dialCode: "+33", pattern: /^\d{9}$/ },
  { code: "DE", name: "Germany", dialCode: "+49", pattern: /^\d{6,11}$/ },
  { code: "IT", name: "Italy", dialCode: "+39", pattern: /^\d{9,10}$/ },
  { code: "ES", name: "Spain", dialCode: "+34", pattern: /^\d{9}$/ },
  { code: "CA", name: "Canada", dialCode: "+1", pattern: /^\d{10}$/ },
  { code: "AU", name: "Australia", dialCode: "+61", pattern: /^\d{9}$/ },
  { code: "JP", name: "Japan", dialCode: "+81", pattern: /^\d{10}$/ },
  { code: "IN", name: "India", dialCode: "+91", pattern: /^\d{10}$/ },
  { code: "CM", name: "Cameroon", dialCode: "+237", pattern: /^\d{9}$/ },
  { code: "NG", name: "Nigeria", dialCode: "+234", pattern: /^\d{10}$/ },
  { code: "KE", name: "Kenya", dialCode: "+254", pattern: /^\d{9}$/ },
];

const PhoneField: React.FC<PhoneFieldProps> = ({
  label,
  helperText,
  placeholder = "Phone number",
  clearButtonVisible = false,
  onClear,
  onChangeText,
  defaultCountry = "CM",
}) => {
  const [phone, setPhone] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find((c) => c.code === defaultCountry) || countries[0]
  );
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const phoneInputRef = useRef<TextInput>(null);

  const filteredCountries = searchQuery
    ? countries.filter(
        (country) =>
          country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          country.dialCode.includes(searchQuery)
      )
    : countries;

  useEffect(() => {
    validatePhoneNumber();
  }, [phone, selectedCountry]);

  const validatePhoneNumber = () => {
    if (!phone) {
      onChangeText("", false);
      return;
    }
    const numericPhone = phone.replace(/\D/g, "");
    const isValid = selectedCountry.pattern.test(numericPhone);
    setIsInvalid(!isValid);
    onChangeText(`${selectedCountry.dialCode}${numericPhone}`, isValid);
  };

  const handleChange = (text: string) => {
    const numericText = text.replace(/\D/g, "");
    setPhone(numericText);
  };

  const handleClear = () => {
    setPhone("");
    if (onClear) {
      onClear();
    }
    onChangeText("", false);
  };

  const selectCountry = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    setSearchQuery("");
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
        <TouchableOpacity
          onPress={() => setShowCountryPicker(true)}
          style={styles.countrySelector}
        >
          <Text style={styles.countryCode}>{selectedCountry.dialCode}</Text>
          <Ionicons
            name={showCountryPicker ? "chevron-up" : "chevron-down"}
            size={16}
            color="#6b7280"
            style={styles.chevronIcon}
          />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={phone}
          placeholder={placeholder}
          onChangeText={handleChange}
          keyboardType="phone-pad"
          maxLength={9}
        />
        {/* Clear button */}

        {clearButtonVisible && phone ? (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="gray" />
          </TouchableOpacity>
        ) : null}
      </View>

      {helperText && <Text style={styles.helperText}>{helperText}</Text>}
      {isInvalid && phone && (
        <Text style={styles.errorText}>
          Invalid phone number for {selectedCountry.name}
        </Text>
      )}

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCountryPicker(false)}
        />
        <View style={styles.countryPickerContainer}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#9ca3af"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search countries..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.countryItem,
                  selectedCountry.code === item.code &&
                    styles.selectedCountryItem,
                ]}
                onPress={() => selectCountry(item)}
              >
                <Text style={styles.countryName}>{item.name}</Text>
                <Text style={styles.countryDialCode}>{item.dialCode}</Text>
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
  invalidBorder: {
    borderColor: "#ef4444",
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
    marginRight: 8,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  countryCode: {
    color: "#374151",
    fontWeight: "500",
    marginRight: 4,
  },
  chevronIcon: {
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
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  countryPickerContainer: {
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
  countryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  countryItemPressed: {
    backgroundColor: "#f3f4f6",
  },
  selectedCountryItem: {
    backgroundColor: "#e0f2fe",
  },
  countryName: {
    fontSize: 16,
    color: "#111827",
  },
  countryDialCode: {
    fontSize: 16,
    color: "#6b7280",
  },
});

export default PhoneField;
