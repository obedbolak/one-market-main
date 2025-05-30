import { useProduct } from "@/context/ProductContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Get screen dimensions
const { width, height } = Dimensions.get('window');

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
  status: "Lost" | "Found";
  contactInfo: string;
  images: LostItemImage[];
  createdAt: string;
  updatedAt: string;
}

const Lostitems = () => {
  const { id } = useLocalSearchParams();
  const { lostItems } = useProduct();
  const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (lostItems.length > 0) {
      const initialItem = lostItems.find((item) => item._id === id);
      setSelectedItem(initialItem || lostItems[0]);
    }
  }, [lostItems, id]);

  useEffect(() => {
    if (selectedItem && selectedItem.images.length > 0) {
      setCurrentImageIndex(0);
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

  if (!selectedItem) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>No item found</Text>
      </SafeAreaView>
    );
  }

  const relatedItems = lostItems.filter(
    (item) => item._id !== selectedItem._id
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={23} color={"white"} />
        </TouchableOpacity>
        
        {/* Displaying the selected item */}
        <Text style={styles.itemName}>{selectedItem.itemName}</Text>
        <Text style={styles.description}>{selectedItem.description}</Text>
        
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: selectedItem.images[currentImageIndex]?.url }}
            style={styles.mainImage}
          />
          {selectedItem.images.length > 1 && (
            <>
              {currentImageIndex === 0 ? null : (
                <TouchableOpacity
                  onPress={handlePrevImage}
                  style={[styles.navButton, styles.prevButton]}
                >
                  <Ionicons name="arrow-back" size={23} color={"white"} />
                </TouchableOpacity>
              )}
              {currentImageIndex === selectedItem.images.length - 1 ? null : (
                <TouchableOpacity
                  onPress={handleNextImage}
                  style={[styles.navButton, styles.nextButton]}
                >
                  <Ionicons name="arrow-forward" size={23} color={"white"} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
        
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={23} color={"green"} />
          <Text style={styles.locationText}>{selectedItem.location}</Text>
        </View>
        
        {/* Contact Information and Input */}
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <TextInput
          placeholder="Enter your contact info"
          style={styles.input}
        />
        
        {/* Displaying related items */}
        <Text style={styles.relatedTitle}>Related Items</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.relatedScroll}
        >
          {relatedItems.map((relatedItem) => (
            <TouchableOpacity
              key={relatedItem._id}
              onPress={() => setSelectedItem(relatedItem)}
              style={styles.relatedItem}
            >
              <Image
                source={{ uri: relatedItem.images[0]?.url }}
                style={styles.relatedImage}
              />
              <Text style={styles.relatedItemName}>{relatedItem.itemName}</Text>
              <Text style={styles.relatedDescription}>{relatedItem.description}</Text>
            </TouchableOpacity>
          ))}

          {/* More button as a related item */}
          <TouchableOpacity
            style={styles.moreItem}
            onPress={() => router.push("/LostItem/LostItem")}
          >
            <View style={styles.moreItemContent}>
              <Text style={styles.moreItemText}>More</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    paddingHorizontal: width * 0.05, // 5% of screen width
  },
  backButton: {
    top: 1,
    zIndex: 20,
    position: "absolute",
    padding: 5,
    backgroundColor: "skyblue",
    width: width * 0.08, // 8% of screen width
    height: width * 0.08,
    borderRadius: 50,
    paddingHorizontal: 2,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
    left: 6,
  },
  itemName: {
    fontSize: width * 0.06, // 6% of screen width
    fontWeight: "bold",
    marginBottom: height * 0.01,
    alignSelf: "center",
  },
  description: {
    fontSize: width * 0.04,
  },
  imageContainer: {
    position: "relative",
    marginTop: height * 0.01,
  },
  mainImage: {
    width: "100%",
    height: height * 0.3, // 30% of screen height
    borderRadius: 10,
  },
  navButton: {
    padding: 5,
    backgroundColor: "skyblue",
    width: width * 0.08,
    height: width * 0.08,
    borderRadius: 50,
    paddingHorizontal: 2,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: "50%",
  },
  prevButton: {
    left: 6,
  },
  nextButton: {
    right: 6,
  },
  sectionTitle: {
    marginTop: height * 0.02,
    fontSize: width * 0.045,
  },
  locationContainer: {
    flexDirection: "row",
    maxWidth: "80%",
    alignItems: "center",
    gap: 10,
   
  },
  locationText: {
    fontSize: width * 0.05,
    fontWeight: "600",
  },
  input: {
    height: height * 0.06,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginTop: height * 0.01,
    paddingLeft: 10,
    fontSize: width * 0.04,
  },
  relatedTitle: {
    marginTop: height * 0.04,
    fontSize: width * 0.05,
    fontWeight: "bold",
  },
  relatedScroll: {
    marginTop: height * 0.01,
  },
  relatedItem: {
    marginRight: width * 0.04,
    width: width * 0.4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    padding: width * 0.02,
  },
  relatedImage: {
    width: "100%",
    height: height * 0.15,
    borderRadius: 10,
   
  },
  relatedItemName: {
    fontSize: width * 0.035,
    fontWeight: "bold",
    marginTop: height * 0.01,
    textAlign: 'center',
  },
  relatedDescription: {
    fontSize: width * 0.03,
    color: "gray",
    textAlign: 'center',
  },
  moreItem: {
    marginRight: width * 0.04,
    width: width * 0.4,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    padding: width * 0.02,
  },
  moreItemContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: height * 0.02,
  },
  moreItemText: {
    fontSize: width * 0.035,
    fontWeight: "bold",
    color: "skyblue",
  },
});

export default Lostitems;