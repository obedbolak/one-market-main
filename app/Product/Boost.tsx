import { useProduct } from "@/context/ProductContext";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  boosted?: number; // Make boosted optional in case it's missing in some products
}

// Constants
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/150";
const WINDOW_WIDTH = Dimensions.get("window").width;
const ITEM_WIDTH = WINDOW_WIDTH * 0.4; // 40% of screen width
const INITIAL_ITEMS_TO_SHOW = 3;

// Skeleton component
const SkeletonPlaceholder = ({ style }: { style: object }) => (
  <View style={[styles.skeleton, style]} />
);

const Boost: React.FC = () => {
  const { products, loading, error, refreshData } = useProduct();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);

  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  const boostedProducts = useMemo(
    () => products.filter(product => product.boosted >= 1),
    [products]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  }, [refreshData]);

  const handleProductDetails = useCallback((item: Product) => {
    router.push(`/Product/${item._id}`);
  }, []);

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
            <Text numberOfLines={2} style={styles.productName}>
              {item.name}
            </Text>
            <Text style={styles.productPrice}>
              XAF{item.price.toLocaleString()}
            </Text>
            {item.stock < 5 && (
              <Text style={styles.lowStock}>Only {item.stock} left!</Text>
            )}
          </View>
        </ImageBackground>
      </TouchableOpacity>
    ),
    [handleProductDetails]
  );

  const handleShowMore = () => {
    setShowAllProducts(true);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            {/* Skeleton placeholders for loading state */}
            {[...Array(INITIAL_ITEMS_TO_SHOW)].map((_, index) => (
              <View key={`skeleton-${index}`} style={styles.productItem}>
                <SkeletonPlaceholder style={styles.productImage} />
                <View style={styles.productInfo}>
                  <SkeletonPlaceholder style={styles.skeletonProductName} />
                  <SkeletonPlaceholder style={styles.skeletonProductPrice} />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      );
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

    if (boostedProducts.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No boosted products available</Text>
        </View>
      );
    }

    const displayedProducts = showAllProducts
      ? boostedProducts
      : boostedProducts.slice(0, INITIAL_ITEMS_TO_SHOW);

    return (
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {(displayedProducts as Product[]).map(renderProductItem)}
          {!showAllProducts &&
            boostedProducts.length > INITIAL_ITEMS_TO_SHOW && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={handleShowMore}
              >
                <Text style={styles.showMoreText}>Show More</Text>
                <Text style={styles.showMoreCount}>
                  +{boostedProducts.length - INITIAL_ITEMS_TO_SHOW} items
                </Text>
              </TouchableOpacity>
            )}
        </ScrollView>
      </View>
    );
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={["#0066cc"]}
        />
      }
    >
      {renderContent()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingHorizontal: 3,
    paddingVertical: 2,
  },
  productItem: {
    width: ITEM_WIDTH * 0.7,
    marginRight: 15,
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
    height: ITEM_WIDTH * 0.7,
    resizeMode: "cover",
  },
  productInfo: {
    bottom: 0,
    position: "absolute",
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    width: "100%",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  productName: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  productPrice: {
    fontSize: 10,
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
  },
  errorText: {
    color: "#ff3b30",
    textAlign: "center",
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
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
  showMoreButton: {
    width: ITEM_WIDTH * 0.8,
    height: ITEM_WIDTH,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#0066cc",
  },
  showMoreText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0066cc",
    marginBottom: 8,
  },
  showMoreCount: {
    fontSize: 14,
    color: "#666",
  },
  // Skeleton styles
  skeleton: {
    backgroundColor: "#e1e1e1",
    borderRadius: 4,
  },
  skeletonProductName: {
    width: "100%",
    height: 12,
    marginBottom: 6,
  },
  skeletonProductPrice: {
    width: "60%",
    height: 12,
  },
});

export default Boost;
