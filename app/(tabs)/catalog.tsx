import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Types
interface ProductImage {
  public_id: string;
  url: string;
}

interface Category {
  _id: string;
  category: string;
}

interface Product {
  id: string | string[];
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: ProductImage[];
  category: Category;
  sellerId: string;
  boosted: number;
}

// Constants
const API_URL = "https://onemarketapi.xyz/api/v1/product/get-all";
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/150";
const WINDOW_WIDTH = Dimensions.get("window").width;
const ITEM_WIDTH = WINDOW_WIDTH / 3 - 12; // 3 items per row
const CACHE_KEY = "boostedProductsCache";
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch products");
      }
      setProducts(data.products);
      setError(null);

      // Cache the fetched data
      const cacheData = { data: data.products, timestamp: Date.now() };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      setError(
        `Error fetching products: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleRefresh = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  const handleProductDetails = useCallback((item: Product) => {
    router.push(`/Product/${item._id}`);
  }, []);

  // Organize products by category and prioritize Electronics
  const renderContent = () => {
    if (isLoading) {
      return <Text style={styles.loadingText}>Loading products...</Text>;
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (products.length === 0) {
      return <Text style={styles.emptyText}>No products available</Text>;
    }

    // Group products by category
    const categorizedProducts = products.reduce((acc, product) => {
      const categoryName = product.category?.category || "Other";
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(product);
      return acc;
    }, {} as Record<string, Product[]>);

    // Prioritize Electronics first
    const sortedCategories = Object.keys(categorizedProducts).sort((a, b) =>
      a === "Electronics" ? -1 : b === "Electronics" ? 1 : 0
    );

    return (
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {sortedCategories.map((category) => (
          <View key={category}>
            <TouchableOpacity><Text style={styles.categoryTitle}>{category}</Text></TouchableOpacity>
            
            <View style={styles.categoryContainer}>
              {categorizedProducts[category].map(renderProductItem)}
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderProductItem = useCallback(
    (item: Product) => (
      <TouchableOpacity
        key={item._id}
        style={styles.productItem}
        onPress={() => handleProductDetails(item)}
        activeOpacity={0.7}
      >
        <ImageBackground
          source={{ uri: item.images[0]?.url || PLACEHOLDER_IMAGE }}
          style={styles.productImage}
        >
          <View style={styles.productInfo}>
            {item.stock < 5 && (
              <Text style={styles.lowStock}>Only {item.stock} left!</Text>
            )}
            <Text numberOfLines={2} style={styles.productName}>
              {item.name}
            </Text>
            <Text style={styles.productPrice}>
              XAF{item.price.toLocaleString()}
            </Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    ),
    [handleProductDetails]
  );

  return <SafeAreaView>{renderContent()}</SafeAreaView>;
};

// Styles
const styles = StyleSheet.create({
  scrollViewContent: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 10,
    textAlign: "center",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productItem: {
    width: ITEM_WIDTH,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  productImage: {
    width: "100%",
    height: ITEM_WIDTH,
    resizeMode: "cover",
  },
  productInfo: {
    paddingHorizontal: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    width: "100%",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    position: "absolute", // Position it at the bottom
    bottom: 0, // Align to the bottom of the ImageBackground
    justifyContent: "flex-end", // Ensure content is aligned to the bottom
    paddingVertical: 8, // Add padding for spacing
  },
  productName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  productPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0066cc",
    marginTop: 1,
  },
  lowStock: {
    fontSize: 12,
    color: "#ff3b30",
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 300,
    marginTop: 20,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
  errorText: {
    color: "#ff3b30",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#0066cc",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});

export default Catalog;
