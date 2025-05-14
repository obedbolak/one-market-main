import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LostItemImage {
  public_id: string;
  url: string;
}

interface LostItem {
  _id: string;
  itemName: string;
  description: string;
  location: string;
  status: "lost" | "found";
  contactInfo: string;
  images: LostItemImage[];
  createdAt: string;
  updatedAt: string;
}

const LostItem = () => {
  const { mode } = useLocalSearchParams<{ mode?: "lostItem" | "searchItem" }>();
  const [isLostItem, setIsLostItem] = useState(mode === "lostItem");

  const [reportStatus, setReportStatus] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [location, setLocation] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImages = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Permission to access camera roll is required!"
      );
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

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const fetchLostItems = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "https://onemarketapi.xyz/api/v1/lost/lost-items"
      );
      setLostItems(response.data.items);
      setError(null);
    } catch (err) {
      setError("Failed to fetch lost items");
      Alert.alert(
        "Error",
        "Failed to fetch lost items. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLostItems();
  }, []);

  const validateForm = () => {
    if (!itemName.trim()) {
      setReportStatus("Please enter an item name");
      return false;
    }
    if (!itemDescription.trim()) {
      setReportStatus("Please enter an item description");
      return false;
    }
    if (!location.trim()) {
      setReportStatus("Please enter a location");
      return false;
    }
    if (!contactInfo.trim()) {
      setReportStatus("Please enter contact information");
      return false;
    }
    if (images.length === 0) {
      setReportStatus("Please add at least one image");
      return false;
    }
    if (!status.trim()) {
      setReportStatus("Please select whether the item is lost or found");
      return false;
    }
    return true;
  };

  const handleReport = async () => {
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      await handleSaveLostItem();

      // Reset form after successful submission
      setItemName("");
      setItemDescription("");
      setLocation("");
      setContactInfo("");
      setImages([]);
      setStatus("");
      setReportStatus(
        `Item has been reported as ${reportStatus} successfully.`
      );
    } catch (error) {
      setReportStatus("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveLostItem = async () => {
    const formData = new FormData();
    formData.append("itemName", itemName.trim());
    formData.append("description", itemDescription.trim());
    formData.append("location", location.trim());
    formData.append("status", status.trim());
    formData.append("contactInfo", contactInfo.trim());

    images.forEach((uri, index) => {
      const type = uri.endsWith(".jpg") ? "image/jpeg" : "image/png";
      formData.append("files", {
        uri,
        name: `product_image${index + 1}.jpg`,
        type,
      } as any);
    });

    try {
      const response = await fetch(
        "https://onemarketapi.xyz/api/v1/lost/item/new",
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.message || "Failed to create item.");
      }

      Alert.alert("Success", "Item reported successfully!");
    } catch (error) {
      console.error("Error submitting item:", error);
      throw error;
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredItems = lostItems.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const renderItemCard = ({ item }: { item: LostItem }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => router.push(`/LostItem/${item._id}`)}
      key={item._id}
    >
      {item.images.length > 0 && (
        <Image source={{ uri: item.images[0].url }} style={styles.itemImage} />
      )}
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle}>{item.itemName}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.itemFooter}>
          <Text style={styles.itemLocation}>{item.location}</Text>
          <Text style={styles.itemStatus}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const renderSearchResults = () => (
    <SafeAreaView style={styles.container}>
      {filteredItems.length > 0 ? (
        <View style={styles.listContainer}>
          {filteredItems.map((item) => renderItemCard({ item }))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery
              ? "No items match your search"
              : `No ${mode === "lostItem" ? "Lost" : "Found"} Items Found`}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );

  const renderImages = () => (
    <View style={styles.imageGridContainer}>
      {images.map((uri, index) => (
        <View key={index} style={styles.imageContainer}>
          <Image source={{ uri }} style={styles.image} />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => removeImage(index)}
          >
            <Text style={styles.removeImageText}>×</Text>
          </TouchableOpacity>
        </View>
      ))}
      {images.length < 5 && (
        <TouchableOpacity
          style={[styles.imageContainer, styles.addImageButton]}
          onPress={pickImages}
        >
          <Text style={styles.addImageText}>+ Add Image</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderInputFields = () => (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Item Name"
        value={itemName}
        onChangeText={setItemName}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Item Description"
        value={itemDescription}
        onChangeText={setItemDescription}
        multiline
        numberOfLines={4}
      />
      <TextInput
        style={styles.input}
        placeholder="Area of Lost or Found Item"
        value={location}
        onChangeText={setLocation}
      />
      <TextInput
        style={styles.input}
        placeholder="Contact Information"
        value={contactInfo}
        onChangeText={setContactInfo}
      />
    </View>
  );

  const renderReportButtons = () => (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[
          styles.button,
          styles.foundButton,
          status === "found" && styles.activeButton,
        ]}
        onPress={() => handleReport()}
        disabled={isSubmitting}
      >
        {isSubmitting && status === "found" ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.buttonText}>Report {status} Item</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {isLostItem ? (
          <View style={styles.content}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={23} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>Report Item</Text>

            {renderInputFields()}
            {renderImages()}
            <View style={{ marginBottom: 10, flexDirection: "row", gap: 2 }}>
              <TouchableOpacity
                style={[
                  styles.foundButton,
                  status === "lost" && styles.activeButton,
                  { padding: 10, borderRadius: 5 },
                ]}
                onPress={() => setStatus("lost")}
                disabled={isSubmitting}
              >
                {isSubmitting && status === "lost" ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Lost Item</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.lostButton,
                  status === "lost" && styles.activeButton,
                  { padding: 10, borderRadius: 5 },
                ]}
                onPress={() => setStatus("found")}
                disabled={isSubmitting}
              >
                {isSubmitting && status === "found" ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>found Item</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {reportStatus ? (
              <Text
                style={[
                  styles.statusText,
                  reportStatus.includes("successfully")
                    ? styles.successText
                    : styles.errorText,
                ]}
              >
                {reportStatus}
              </Text>
            ) : null}
            {renderReportButtons()}
          </View>
        ) : (
          <View style={styles.content}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={23} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>Search Items</Text>
            <View>
              <TextInput
                placeholder="Search items"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>

            <View style={styles.gridContainer}>
              {isLoading ? (
                <ActivityIndicator size="large" color="#4ecdc4" />
              ) : (
                renderSearchResults()
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  itemLocation: {
    color: "#888",
  },
  itemStatus: {
    fontWeight: "bold",
    color: "#2ecc71",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
  },
  searchContainer: {
    padding: 15,
    backgroundColor: "white",
  },
  searchInput: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  listContainer: {
    padding: 15,
  },
  itemCard: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    resizeMode: "cover",
  },
  itemDetails: {
    padding: 15,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  itemDescription: {
    color: "#666",
    marginBottom: 10,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  lostButton: {
    backgroundColor: "#ff6b6b",
  },
  foundButton: {
    backgroundColor: "#4ecdc4",
  },
  activeButton: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  statusText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
  },
  successText: {
    color: "#4ecdc4",
  },
  errorText: {
    color: "#ff6b6b",
  },
  backButton: {
    position: "absolute",
    top: 15,
    left: 20,
    backgroundColor: "#4ecdc4",
    borderRadius: 50,
    padding: 10,
    zIndex: 20,
  },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  gridItem: {
    width: Dimensions.get("window").width / 2 - 30,
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 3,
    marginBottom: 15,
  },
  gridImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  gridItemContent: {
    padding: 10,
  },
  gridItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  gridItemDescription: {
    fontSize: 14,
    color: "#666",
  },
  noResultsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
  imageGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  imageContainer: {
    width: Dimensions.get("window").width / 3 - 20,
    height: 100,
    position: "relative",
    borderRadius: 10,

    overflow: "hidden",
    padding: 4,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 15,
    padding: 5,
  },
  removeImageText: {
    color: "white",
    fontSize: 16,
  },
  addImageButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    height: 100,
    borderRadius: 10,
    borderStyle: "dashed",
    borderWidth: 2.3,
    borderColor: "skyblue",
  },
  addImageText: {
    fontSize: 18,
    color: "#888",
  },
  placeholderText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 20,
  },
});

export default LostItem;
