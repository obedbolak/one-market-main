import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface RealEstateSelectorProps {
  onSelectionChange: (transactionType: string, propertyType: string) => void;
  initialTransactionType?: string;
  initialPropertyType?: string;
}

const RealEstateSelector: React.FC<RealEstateSelectorProps> = ({
  onSelectionChange,
  initialTransactionType = "",
  initialPropertyType = "",
}) => {
  const [transactionType, setTransactionType] = useState(
    initialTransactionType
  );
  const [propertyType, setPropertyType] = useState(initialPropertyType);
  const [showModal, setShowModal] = useState(false);

  const transactionTypes = [
    { id: "rent", label: "For Rent" },
    { id: "sale", label: "For Sale" },
  ];

  const propertyTypes = {
    rent: [
      //   { id: "apartment", label: "Apartment" },
      //   { id: "house", label: "House" },
      //   { id: "condo", label: "Condo" },
      //   { id: "townhouse", label: "Townhouse" },
      { id: "Land", label: "Land" },
      { id: "Studio Apartments", label: "Studio Apartments" },
      { id: "1+1 Apartments", label: "1+1 Apartments" },
      { id: "2+1 Apartments", label: "2+1 Apartments" },
      { id: "3+1 Apartments", label: "3+1 Apartments" },
      { id: "1 Room", label: "1 Room" },

      { id: "Duplexes", label: "Duplexes" },
      { id: "Office Space", label: "Office Space" },
      { id: "Commercial Properties", label: "Commercial Properties" },
    ],
    sale: [
      //   { id: "apartment", label: "Apartment" },
      //   { id: "house", label: "House" },
      //   { id: "condo", label: "Condo" },
      //   { id: "commercial", label: "Commercial" },
      //   { id: "land", label: "Land" },

      { id: "Land", label: "Land" },
      { id: "Studio Apartments", label: "Studio Apartments" },
      { id: "1+1 Apartments", label: "1+1 Apartments" },
      { id: "2+1 Apartments", label: "2+1 Apartments" },
      { id: "3+1 Apartments", label: "3+1 Apartments" },
      { id: "1 Room", label: "1 Room" },

      { id: "Duplexes", label: "Duplexes" },
      { id: "Office Space", label: "Office Space" },
      { id: "Commercial Properties", label: "Commercial Properties" },
    ],
  };

  const handleTransactionSelect = (type: string) => {
    setTransactionType(type);
    setPropertyType(""); // Reset property type when transaction type changes
  };

  const handlePropertySelect = (type: string) => {
    setPropertyType(type);
  };

  const handleAccept = () => {
    if (transactionType && propertyType) {
      onSelectionChange(transactionType, propertyType);
      setShowModal(false);
    }
  };

  const handleClear = () => {
    setTransactionType("");
    setPropertyType("");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.triggerButtonText}>
          {transactionType && propertyType
            ? `${
                transactionTypes.find((t) => t.id === transactionType)?.label
              } - ${
                propertyTypes[
                  transactionType as keyof typeof propertyTypes
                ].find((p) => p.id === propertyType)?.label
              }`
            : "Select Property"}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#64748b" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Property</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollableContent}>
              {/* Transaction Type Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Transaction Type</Text>
                <View style={styles.optionsContainer}>
                  {transactionTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.optionButton,
                        transactionType === type.id && styles.selectedOption,
                      ]}
                      onPress={() => handleTransactionSelect(type.id)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          transactionType === type.id &&
                            styles.selectedOptionText,
                        ]}
                      >
                        {type.label}
                      </Text>
                      {transactionType === type.id && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color="#fff"
                          style={styles.optionIcon}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Property Type Selection (only shown when transaction is selected) */}
              {transactionType && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Property Type</Text>
                  <View style={styles.optionsContainer}>
                    {propertyTypes[
                      transactionType as keyof typeof propertyTypes
                    ].map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        style={[
                          styles.optionButton,
                          propertyType === type.id && styles.selectedOption,
                        ]}
                        onPress={() => handlePropertySelect(type.id)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            propertyType === type.id &&
                              styles.selectedOptionText,
                          ]}
                        >
                          {type.label}
                        </Text>
                        {propertyType === type.id && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#fff"
                            style={styles.optionIcon}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Footer with action buttons */}
              <View style={styles.footer}>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleClear}
                  >
                    <Text style={styles.clearButtonText}>Clear</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.acceptButton,
                      (!transactionType || !propertyType) &&
                        styles.disabledButton,
                    ]}
                    onPress={handleAccept}
                    disabled={!transactionType || !propertyType}
                  >
                    <Text style={styles.acceptButtonText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  triggerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  triggerButtonText: {
    color: "#1e293b",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  scrollableContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    flexDirection: "row",
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  optionText: {
    color: "#64748b",
    fontSize: 14,
  },
  selectedOptionText: {
    color: "#fff",
  },
  optionIcon: {
    marginLeft: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  clearButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flex: 1,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#64748b",
    fontWeight: "500",
  },
  acceptButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#3b82f6",
    flex: 1,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
});

export default RealEstateSelector;
