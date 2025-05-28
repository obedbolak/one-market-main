import { useAuth } from "@/context/AuthContext";
import { useProduct } from "@/context/ProductContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ProfilePic {
  public_id: string;
  url: string;
}

// Define the Seller type interface
interface Seller {
  _id: string; // Matching the _id from the response
  name: string;
  businessName?: string;
  address: string;
  description?: string;
  email: string;
  phoneNumber: string;
  profilePic?: ProfilePic;
  createdAt: string;
  storeName: string;
  businessDescription: string;
  businessAddress: string;
  businessPhone: string;
}
interface Image {
  public_id: string;
  url: string;
  _id: string;
}

interface Product {
  _id: string;
  sellerId: string;
  name: string;
  email: string;
  images: Image[];
  price: number;
  description: string;
}

const SellerComponent: React.FC = () => {
  const { sellerId } = useLocalSearchParams();
  const { products } = useProduct(); // Get products from context
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();

  // Fetch the seller data
  useEffect(() => {
    const fetchSeller = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all sellers
        const sellerResponse = await fetch(
          "https://onemarketapi.xyz/api/v1/user/getusers"
        );
        const sellerData = await sellerResponse.json();

        // Find the seller matching the sellerId
        const matchedSeller = sellerData.find(
          (s: Seller) => s._id === sellerId
        );

        if (!matchedSeller) {
          setError("Seller not found.");
          setLoading(false);
          return;
        }

        setSeller(matchedSeller);
      } catch (err) {
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSeller();
  }, [sellerId]);

  // Filter products from context by sellerId
  const filteredProducts = ((products as unknown) as Product[]).filter(
    (product) => product.sellerId === sellerId
  );

  // Handle product click (Navigate to product details)
  const handleItemDetails = (item: Product) => {
    router.push(`/Product/${item._id}`);
  };

  // Render each product as a grid item
  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity onPress={() => handleItemDetails(item)}>
      <View style={styles.productContainer}>
        <RNImage
          source={{ uri: item.images[0].url }}
          style={styles.productImage}
        />
        <View>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>${item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!seller) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Seller not found</Text>
      </View>
    );
  }

  const capitalizeWords = (str: string) => {
    return str
      .split(" ") // Split the string into an array of words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter and make the rest lowercase
      .join(" "); // Join the words back into a string
  };

  const sentence = `${seller.name}`;
  const sentence2 = `${seller.storeName}`;
  const sentence3 = `${seller.businessDescription}`;
  const sentence4 = `${seller._id}`;
  const capitalizedSentence = capitalizeWords(sentence);
  const capitalizedSentence2 = capitalizeWords(sentence2);
  const capitalizedSentence3 = capitalizeWords(sentence3);
  const capitalizedSentence4 = capitalizeWords(sentence4);

  const getLastFourDigits = (id: string) => {
    return id.slice(-8); // Extract the last 4 digits from the ID
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={23} color={"skyblue"} />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.sellerInfoContainer}>
          <View>
            {seller.profilePic?.url ? (
              <RNImage
                source={{ uri: seller.profilePic.url }}
                style={styles.image}
              />
            ) : (
              <RNImage
                source={require("../../assets/images/prodimg/user.png")}
                style={styles.image}
              />
            )}

            <View style={styles.sellerId}>
              <Text style={styles.labelText}>Seller ID: </Text>
              <Text style={styles.idText}>
                1M:{getLastFourDigits(capitalizedSentence4).toLocaleUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.sellerDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.labelText}>Store Name:</Text>
              <Text style={styles.storeName}>
                {capitalizedSentence2 || "N/A"}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.labelText}>Seller Information:</Text>
              <Text>{capitalizedSentence3 || "No description available"}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.labelText}>Location:</Text>
              <Text>{seller.businessAddress}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.productsHeader}>Vendor's Products</Text>

        {filteredProducts.length > 0 ? (
          <View style={styles.productsGrid}>
            {filteredProducts.map((item) => (
              <TouchableOpacity
                key={item._id}
                onPress={() => handleItemDetails(item)}
                style={styles.productWrapper}
              >
                <View style={styles.productContainer}>
                  <RNImage
                    source={{ uri: item.images[0].url }}
                    style={styles.productImage}
                  />
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>${item.price}</Text>
                  {item.sellerId !== userProfile?._id ? (
                    <TouchableOpacity
                      style={{
                        position: "absolute",
                        bottom: "5%",
                        right: "8%",
                        backgroundColor: "skyblue",
                        paddingHorizontal: "5%",
                        borderRadius: 5,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "bold" }}>
                        Boost
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.noProducts}>
            No products available for this seller
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 8,
    marginTop: -40,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 10,
    zIndex: 100,
    backgroundColor: "white",
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sellerInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0, 0.05)",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 20,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 20,
  },
  sellerId: {
    marginTop: 8,
  },
  sellerDetails: {
    marginLeft: 16,
    maxWidth: 200,
  },
  detailItem: {
    marginTop: 8,
  },
  labelText: {
    fontWeight: "bold",
  },
  idText: {
    color: "green",
  },
  storeName: {
    color: "green",
    fontWeight: "bold",
    letterSpacing: 3,
  },
  productsHeader: {
    left: "4%",
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  productWrapper: {
    width: "48%",
  },
  productContainer: {
    backgroundColor: "rgba(166, 176, 180, 0.2)",
    padding: 10,
    marginBottom: 3,
    borderRadius: 8,
    marginTop: 12,
  },
  productImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontWeight: "bold",
    maxWidth: 150,
    fontSize: 12,
    marginBottom: 4,
  },
  productPrice: {
    color: "orange",
  },
  noProducts: {
    alignSelf: "center",
    marginTop: "30%",
  },
});

export default SellerComponent;
