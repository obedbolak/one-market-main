import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AccountSettings from "../Merchant/AccountSettings";
import MyProduct from "../Merchant/MyProduct";
import PlansUpgrade from "../Merchant/PlansUpgrade";
import ViewOrders from "../Merchant/ViewOrders";
import CreateProduct from "../Seller/CreateProduct";

const settings = () => {
  const { userProfile } = useAuth();
  const { t } = useLanguage();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showoptions, setshowoptions] = useState(false);
  const [productCount, setProductCount] = useState<number>(0); // State to store product length

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setshowoptions(false);
  };
  const capitalizeWords = (str: string | undefined) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <Text style={[styles.title, { color: "#16a34a" }]}>
         {t("welcome")}, {capitalizeWords(userProfile?.name)}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ width: "100%" }}
      >
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            onPress={() => handleOptionSelect("createProduct")}
            style={[
              styles.option,
              selectedOption === "createProduct" && styles.selectedOption,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                selectedOption === "createProduct" && styles.selectedOptionText,
              ]}
            >
              {t("Create New Product")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleOptionSelect("viewOrders")}
            style={[
              styles.option,
              selectedOption === "viewOrders" && styles.selectedOption,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                selectedOption === "viewOrders" && styles.selectedOptionText,
              ]}
            >
              {t("View Orders")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleOptionSelect("Products")}
            style={[
              styles.option,
              selectedOption === "Products" && styles.selectedOption,
            ]}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedOption === "Products" && styles.selectedOptionText,
                ]}
              >
                {t("My Products")}
              </Text>
              <Text
                style={[
                  styles.optionText,
                  selectedOption === "Products" && styles.selectedOptionText,
                ]}
              ></Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleOptionSelect("accountSettings")}
            style={[
              styles.option,
              selectedOption === "accountSettings" && styles.selectedOption,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                selectedOption === "accountSettings" &&
                  styles.selectedOptionText,
              ]}
            >
              {t("Account Settings")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleOptionSelect("Plans-Upgrade")}
            style={[
              styles.option,
              selectedOption === "Plans-Upgrade" && styles.selectedOption,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                selectedOption === "Plans-Upgrade" && styles.selectedOptionText,
              ]}
            >
              {t("Plans & Upgrade")}
            </Text>
          </TouchableOpacity>
        </View>

        {selectedOption === "createProduct" && <CreateProduct />}
        {selectedOption === "viewOrders" && <ViewOrders />}
        {selectedOption === "accountSettings" && <AccountSettings />}
        {selectedOption === "Products" && (
          <MyProduct onProductCountChange={setProductCount} />
        )}
        {selectedOption === "Plans-Upgrade" && <PlansUpgrade />}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
    color: "#212529",
  },
  optionsContainer: {
    marginTop: 16,
  },
  option: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,

    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#495057",
  },
  selectedOption: {
    backgroundColor: "#007bff", // Highlighted background color

    transform: [{ scale: 1.01 }], // Slightly increase size
    marginHorizontal: 4, // Add horizontal margin
    borderColor: "#0056b3", // Darker border color
  },
  selectedOptionText: {
    color: "#ffffff", // Change text color to white
    fontWeight: "600", // Make text bold
  },
});

export default settings;
