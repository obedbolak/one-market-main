import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dummy data for lost items

interface LostItemImage {
  public_id: string;
  url: string;
}

interface LostItem {
  _id: string;
  itemName: string;
  description: string;
  location: string;
  status: "Lost" | "Found"; // You can modify the status type if needed
  contactInfo: string;
  images: LostItemImage[];
  createdAt: string;
  updatedAt: string;
}

const Lostitems = () => {
  const { id } = useLocalSearchParams();
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Track the index of the current image
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch lost items from the backend
  const fetchLostItems = async () => {
    try {
      const response = await axios.get(
        "https://onemarketapi.xyz/api/v1/lost/lost-items"
      );
      setLostItems(response.data.items); // Assuming the response structure is similar to your example
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch lost items");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLostItems();
  }, []); // Empty array to run only once when the component mounts

  useEffect(() => {
    if (lostItems.length > 0) {
      // Select the initial item based on the id parameter if available
      const initialItem = lostItems.find((item) => item._id === id);
      setSelectedItem(initialItem || lostItems[0]); // Fallback to the first item
    }
  }, [lostItems, id]);

  useEffect(() => {
    if (selectedItem && selectedItem.images.length > 0) {
      setCurrentImageIndex(0); // Reset to the first image when a new item is selected
    }
  }, [selectedItem]);

  const handleNextImage = () => {
    if (selectedItem && selectedItem.images.length > 1) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex < selectedItem.images.length - 1 ? prevIndex + 1 : 0
      );
    }
  };

  const handlePrevImage = () => {
    if (selectedItem && selectedItem.images.length > 1) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : selectedItem.images.length - 1
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{}}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{}}>
        <Text style={{ color: "red" }}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!selectedItem) {
    return (
      <SafeAreaView style={{}}>
        <Text>No item found</Text>
      </SafeAreaView>
    );
  }

  // Filter out the selected item from related items
  const relatedItems = lostItems.filter(
    (item) => item._id !== selectedItem._id
  );

  return (
    <SafeAreaView>
      <ScrollView style={{ padding: 20 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            top: 1,
            zIndex: 20,
            padding: 5,
            backgroundColor: "skyblue",
            width: 30,
            height: 30,
            borderRadius: 50,
            paddingHorizontal: 2,
            paddingVertical: 2,
            alignItems: "center",
            justifyContent: "center",
            left: 6,
          }}
        >
          <Ionicons name="arrow-back" size={23} color={"white"} />
        </TouchableOpacity>
        {/* Displaying the selected item */}
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>
          {selectedItem.itemName}
        </Text>
        <Text style={{ marginVertical: 10 }}>{selectedItem.description}</Text>
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: selectedItem.images[currentImageIndex]?.url }}
            style={{ width: "100%", height: 250, borderRadius: 10 }}
          />
          {selectedItem.images.length > 1 && (
            <>
              {currentImageIndex === 0 ? null : (
                <TouchableOpacity
                  onPress={handlePrevImage}
                  style={{
                    padding: 5,
                    backgroundColor: "skyblue",
                    width: 30,
                    height: 30,
                    borderRadius: 50,
                    paddingHorizontal: 2,
                    paddingVertical: 2,
                    alignItems: "center",
                    justifyContent: "center",
                    left: 6,
                    position: "absolute",
                    top: "50%",
                  }}
                >
                  <Ionicons name="arrow-back" size={23} color={"white"} />
                </TouchableOpacity>
              )}
              {currentImageIndex === selectedItem.images.length - 1 ? null : (
                <TouchableOpacity
                  onPress={handleNextImage}
                  style={{
                    padding: 5,
                    backgroundColor: "skyblue",
                    width: 30,
                    height: 30,
                    borderRadius: 50,
                    paddingHorizontal: 2,
                    paddingVertical: 2,
                    alignItems: "center",
                    justifyContent: "center",
                    right: 6,
                    position: "absolute",
                    top: "50%",
                  }}
                >
                  <Ionicons name="arrow-forward" size={23} color={"white"} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
        <Text style={{ marginTop: 20, fontSize: 18 }}>Location</Text>
        <View
          style={{
            flexDirection: "row",
            maxWidth: "80%",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Ionicons name="location" size={23} color={"skyblue"} />
          <Text style={{ marginTop: 5, fontSize: 20, fontWeight: "600" }}>
            {selectedItem.location}
          </Text>
        </View>
        {/* Contact Information and Input */}
        <Text style={{ marginTop: 5, fontSize: 18 }}>Contact Information</Text>
        <TextInput
          placeholder="Enter your contact info"
          style={{
            height: 40,
            borderColor: "gray",
            borderWidth: 1,
            borderRadius: 5,
            marginTop: 10,
            paddingLeft: 10,
          }}
        />
        {/* Displaying related items in a horizontal ScrollView */}
        <Text style={{ marginTop: 30, fontSize: 20, fontWeight: "bold" }}>
          Related Items
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 10 }}
        >
          {relatedItems.map((relatedItem) => (
            <TouchableOpacity
              key={relatedItem._id}
              onPress={() => setSelectedItem(relatedItem)} // Update the selected item on click
            >
              <View
                style={{
                  marginRight: 15,
                  width: 150,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "gray",
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <Image
                  source={{ uri: relatedItem.images[0]?.url }}
                  style={{ width: "100%", height: 100, borderRadius: 10 }}
                />
                <Text
                  style={{ fontSize: 14, fontWeight: "bold", marginTop: 5 }}
                >
                  {relatedItem.itemName}
                </Text>
                <Text style={{ fontSize: 12, color: "gray" }}>
                  {relatedItem.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity>
          <Text
            style={{
              backgroundColor: "skyblue",
              padding: 5,
              textAlign: "center",
              color: "white",
              width: "20%",
              marginTop: 10,
              borderRadius: 10,
              alignSelf: "flex-end",
            }}
            onPress={() => router.push("/LostItem/LostItem")}
          >
            More ..
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Lostitems;
