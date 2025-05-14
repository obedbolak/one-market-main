import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
interface IImage {
  public_id: string;
  url: string;
  _id: string;
}

interface Service {
  _id: string;
  name: string;
  description: string;
  location: string;
  contactInfo: string;
  email: string;
  images: IImage[];
  status: "active" | "inactive";
  createdAt: string;
  __v: number;
  boosted: number;
}

// Constants
const API_URL = "https://onemarketapi.xyz/api/v1/service/services";
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/150";
const windowWidth = Dimensions.get("window").width;
const ITEM_WIDTH = windowWidth * 0.4; // 40% of screen width
const INITIAL_ITEMS_TO_SHOW = 3;
const CACHE_KEY = "boostedServicesCache";
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

// Skeleton component
const SkeletonPlaceholder = ({ style }: { style: object }) => (
  <View style={[styles.skeleton, style]} />
);

const Boosts: React.FC = () => {
  const [boostedServices, setBoostedServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);

  // Fetch services from the API
  const fetchServices = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch services");
      }

      const filteredServices = data.services.filter(
        (service: Service) => service.boosted >= 1
      );
      setBoostedServices(filteredServices);
      setError(null);

      // Cache the fetched data with a timestamp
      const cacheData = {
        data: filteredServices,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      setError(
        `Error fetching services: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  // Load cached data if it exists and is not expired
  const loadCachedData = useCallback(async () => {
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const isCacheValid = Date.now() - timestamp < CACHE_EXPIRY_TIME;

        if (isCacheValid) {
          setBoostedServices(data);
          setIsLoading(false);
          return true; // Cache is valid and used
        }
      }
    } catch (error) {
      console.error("Error loading cached data:", error);
    }
    return false; // Cache is invalid or unavailable
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      const isCacheValid = await loadCachedData();
      if (!isCacheValid) {
        await fetchServices(); // Fetch fresh data if cache is invalid
      }
    };
    initializeData();
  }, [fetchServices, loadCachedData]);

  const handleRefresh = useCallback(async () => {
    await fetchServices(); // Always fetch fresh data on refresh
  }, [fetchServices]);

  const handleServiceDetails = useCallback((item: Service) => {
    router.push({
      pathname: `/Services/[ViewServices]`,
      params: {
        id: item._id,
        category: item.name,
        ViewServices: item._id,
      },
    });
  }, []);

  const renderServiceItem = useCallback(
    (item: Service) => (
      <TouchableOpacity
        key={item._id}
        style={styles.productItem}
        onPress={() => handleServiceDetails(item)}
        activeOpacity={0.7}
      >
        <ImageBackground
          source={{
            uri: item.images[0]?.url || PLACEHOLDER_IMAGE,
          }}
          style={styles.productImage}
        >
          <View style={styles.productInfo}>
            <Text numberOfLines={2} style={styles.productName}>
              {item.name}
            </Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    ),
    [handleServiceDetails]
  );

  const handleShowMore = () => {
    setShowAllProducts(true);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View>
          <SkeletonPlaceholder style={styles.sectionTitleSkeleton} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            {[...Array(INITIAL_ITEMS_TO_SHOW)].map((_, index) => (
              <View key={`skeleton-${index}`} style={styles.productItem}>
                <SkeletonPlaceholder style={styles.productImage} />
                <View style={styles.productInfo}>
                  <SkeletonPlaceholder style={styles.skeletonServiceName} />
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

    if (boostedServices.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No boosted services available</Text>
        </View>
      );
    }

    const displayedServices = showAllProducts
      ? boostedServices
      : boostedServices.slice(0, INITIAL_ITEMS_TO_SHOW);

    return (
      <View>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "300",
            marginHorizontal: 0,
            marginTop: 10,
            marginLeft: 14,
          }}
        >
          Services
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {displayedServices.map(renderServiceItem)}
          {!showAllProducts &&
            boostedServices.length > INITIAL_ITEMS_TO_SHOW && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={handleShowMore}
              >
                <Text style={styles.showMoreText}>Show More</Text>
                <Text style={styles.showMoreCount}>
                  +{boostedServices.length - INITIAL_ITEMS_TO_SHOW} items
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
    marginTop: 10,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    minHeight: 30,
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
  skeletonServiceName: {
    width: "100%",
    height: 12,
    marginBottom: 6,
  },
  sectionTitleSkeleton: {
    width: 80,
    height: 16,
    marginLeft: 14,
    marginTop: 10,
    marginBottom: 5,
  },
});

export default Boosts;
