import { useAuth } from "@/context/AuthContext";
import { useProduct } from "@/context/ProductContext";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Category {
  _id: string;
  category: string;
}

const CreateProduct = () => {
  const { userProfile } = useAuth();

  const Uid = userProfile?._id;
  const initialProductData = {
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
  };

  const [productData, setProductData] = useState(initialProductData);
  const [token, setToken] = useState<string | null>(null);

  const [category, setCategory] = useState<string>("");
  // const [categories, setCategories] = useState<Category[]>([]);
  const {categories, createProduct} = useProduct();
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setloading] = useState(false);

  const handleSelectProduct = (productType: string) => {
    setSelectedProduct(productType);
  };

  const handleResetState = () => {
    setSelectedProduct(null);
    setProductData(initialProductData);
    setImages([]);
  };

const isProductFormValid = () => {
  return (
    productData.name.trim() !== "" &&
    productData.price.trim() !== "" &&
    productData.description.trim() !== "" &&
    productData.category.trim() !== "" &&
    productData.stock.trim() !== "" &&
    images.length > 0
  );
};


  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await SecureStore.getItem("token");
      if (storedToken) {
        setToken(storedToken);
      } else {
        Alert.alert("Error", "Authentication token is missing.");
      }
    };

    fetchToken();
  }, []);

 const handleSubmit = async () => {
  try {
    // Validation
    if (images.length === 0) {
      throw new Error("Please select at least one image.");
    }
    if (!productData.category) {
      throw new Error("Please select a category.");
    }
    if (!Uid) {
      throw new Error("User ID is missing.");
    }

    setloading(true);

    // Prepare FormData
    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("description", productData.description);
    formData.append("stock", productData.stock.toString());
    formData.append("price", productData.price.toString());
    formData.append("category", productData.category);
    formData.append("sellerId", Uid);

    // Append images properly
    images.forEach((uri, index) => {
      const filename = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : "image/jpeg";
      
      formData.append("files", {
        uri,
        name: filename || `image_${index}.jpg`,
        type,
      } as any); // Still need 'as any' for React Native FormData
    });

    // Call createProduct with just the FormData
    await createProduct(
      {
        name: productData.name,
        description: productData.description,
        stock: Number(productData.stock),
        price: Number(productData.price),
        category: categories.find((c) => c._id === productData.category) as { _id: string; category: string },
        sellerId: Uid,
        images: images,
        _id: "",
        boosted: 0,
      },
      formData // Pass FormData as second parameter
    );

    handleSuccessfulSubmission();
  } catch (error) {
    console.error("Product submission error:", error);
    Alert.alert(
      "Error",
      error instanceof Error ? error.message : "Failed to create product"
    );
  } finally {
    setloading(false);
  }
};

  const pickImages = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      setImages((prevImages) =>
        [...prevImages, ...result.assets.map((asset) => asset.uri)].slice(0, 5)
      );
    }
  };

  const handleSuccessfulSubmission = () => {
    //clear all fields
    setloading(false);
    setProductData(initialProductData);
    setSelectedProduct(null);
    setImages([]);

    console.log("Product created successfully!");
  };

  const renderInputField = (
    placeholder: string,
    field: keyof typeof productData,
    keyboardType:
      | "default"
      | "numeric"
      | "email-address"
      | "phone-pad" = "default"
  ) => (
    <TextInput
      placeholder={placeholder}
      style={{
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
      }}
      value={productData[field]}
      onChangeText={(text) => setProductData({ ...productData, [field]: text })}
      keyboardType={keyboardType}
    />
  );

  // Update the dropdown renderer
  const renderCategoryDropdown = () => (
    <View style={{ marginBottom: 12 }}>
      <TouchableOpacity
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 8,
          padding: 12,
          justifyContent: "space-between",
          flexDirection: "row",
          alignItems: "center",
        }}
        onPress={() => setShowCategoryDropdown(true)}
      >
        <Text style={{ color: productData.category ? "#000" : "#888" }}>
          {categories.find((c) => c._id === productData.category)?.category ||
            "Select Category"}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="#888" />
      </TouchableOpacity>

      <Modal
        visible={showCategoryDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryDropdown(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCategoryDropdown(false)}
        >
          <View style={styles.dropdownContainer}>
            <ScrollView>
              {categories.map((cat) => (
                <Pressable
                  key={cat._id}
                  style={styles.categoryItem}
                  onPress={() => {
                    setProductData({ ...productData, category: cat._id });
                    setShowCategoryDropdown(false);
                  }}
                >
                  <Text>{cat.category}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
  const renderInputFields = () => {
    switch (selectedProduct) {
      case "Item":
        return (
          <>
            {renderInputField("Name", "name")}
            {renderInputField("Price", "price", "numeric")}
            {/* Numeric keyboard */}
            {renderInputField("Description", "description")}
            {renderCategoryDropdown()}
            {renderInputField("Stock", "stock", "numeric")}
            {/* Numeric keyboard */}
            <Text style={{ marginBottom: 8, fontSize: 16, color: "lightgray" }}>
              Upload Images (6 max)
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 20,
              }}
            >
              {images.map((uri, index) => (
                <View
                  key={index}
                  style={{
                    width: (Dimensions.get("window").width - 52) / 4,
                    height: (Dimensions.get("window").width - 52) / 4,
                    position: "relative",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <Image
                    source={{ uri }}
                    style={{ width: "100%", height: "100%", borderRadius: 8 }}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      const newImages = [...images];
                      newImages.splice(index, 1);
                      setImages(newImages);
                    }}
                    style={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      backgroundColor: "rgba(255, 0, 0, 0.8)",
                      borderRadius: 15,
                      width: 30,
                      height: 30,
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 1,
                    }}
                  >
                    <MaterialIcons name="delete" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity
                  onPress={pickImages}
                  style={[
                    {
                      width: (Dimensions.get("window").width - 52) / 4,
                      height: (Dimensions.get("window").width - 52) / 4,
                      position: "relative",
                      borderRadius: 8,
                      overflow: "hidden",
                    },
                    {
                      borderWidth: 2,
                      borderColor: "#007bff",
                      borderStyle: "dashed",
                      borderRadius: 8,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#f8f9fa",
                    },
                  ]}
                >
                  <MaterialIcons
                    name="add-photo-alternate"
                    size={32}
                    color="#007bff"
                  />
                  <Text
                    style={{
                      color: "#007bff",
                      fontSize: 12,
                      marginTop: 4,
                      textAlign: "center",
                    }}
                  >
                    Add Image
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              onPress={() => {
                if (!isProductFormValid()) {
                  const emptyFields = [];
                  if (productData.name.trim() === "") emptyFields.push("Product Name");
                  if (productData.price.trim() === "") emptyFields.push("Price");
                  if (productData.description.trim() === "") emptyFields.push("Description");
                  if (productData.category.trim() === "") emptyFields.push("Category");
                  if (productData.stock.trim() === "") emptyFields.push("Stock");
                  if (images.length === 0) emptyFields.push("Images");

                  Alert.alert(
                    "Missing Fields",
                    `Please fill in the following fields:\n- ${emptyFields.join("\n- ")}`
                  );
                } else {
                  handleSubmit();
                }
              }}
              style={{
                marginTop: 20,
                padding: 15,
                backgroundColor: isProductFormValid() ? "#1e90ff" : "gray",
                borderRadius: 8,
              }}
              disabled={!isProductFormValid()}
            >
              {loading ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ActivityIndicator size="small" color="#fff" />
                <Text
                  style={{
                    textAlign: "center",
                    color: "#fff",
                    fontSize: 16,
                  }}
                >
                  Creating Product...
                </Text>
</View>
              ) : (
              <Text
                style={{
                  textAlign: "center",
                  color: "#fff",
                  fontSize: 16,
                }}
              >
                Create Product
              </Text>)}
            </TouchableOpacity>
          </>
        );
      default:
        return null;
    }
  };

  const ProductTypeButton = ({
    type,
    imageUrl,
  }: {
    type: string;
    imageUrl: string;
  }) => (
    <TouchableOpacity
      style={{
        width: "30%",
        height: 100,
        justifyContent: "center",
        alignItems: "center",
        margin: 10,
        backgroundColor: "#e0e0e0",
        borderRadius: 10,
        elevation: 2,
      }}
      onPress={() => handleSelectProduct(type)}
    >
      <Image
        source={{ uri: imageUrl }}
        style={{ width: 50, height: 50, marginBottom: 8 }}
      />
      <Text style={{ fontSize: 16 }}>{type}</Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
        }}
      >
        {selectedProduct ? "" : "Select the type of Product"}
      </Text>

      {!selectedProduct ? (
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <ProductTypeButton
            type="Item"
            imageUrl="https://e7.pngegg.com/pngimages/930/556/png-clipart-shopping-cart-shopping-cart-logo-online-shopping-service-shopping-cart-retail-rectangle.png"
          />
          <ProductTypeButton
            type="Vehicles"
            imageUrl="https://img.freepik.com/premium-vector/illustration-three-american-muscle-cars-each-with-different-colour_889743-1066.jpg?w=740"
          />
          <ProductTypeButton
            type="Property"
            imageUrl="https://img.freepik.com/premium-vector/old-house-housing-ferma-vector-illustration_110233-3980.jpg?w=740"
          />
        </View>
      ) : (
        <View style={{ width: "100%" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
            Enter Details for {selectedProduct}
          </Text>
          {renderInputFields()}
          <TouchableOpacity
            onPress={handleResetState}
            style={{
              marginTop: 20,
              padding: 12,
              backgroundColor: "#eee",
              borderRadius: 8,
            }}
          >
            <Text style={{ textAlign: "center", fontSize: 16 }}>Return</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dropdownContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    maxHeight: Dimensions.get("window").height * 0.5,
    width: Dimensions.get("window").width * 0.8,
    elevation: 5,
  },
  categoryItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});

export default CreateProduct;

// Helper to check if all required fields are filled
