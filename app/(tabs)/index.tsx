import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";

import { useProduct } from "@/context/ProductContext";

import {
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Banner from "../Main/Banner";
import Footer from "../Main/Footer";
import Header from "../Main/Header";
import List from "../Main/List";


interface ProductImage {
  public_id: string;
  url: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: ProductImage[];
}

const { width, height } = Dimensions.get("window");
const PRODUCTS_PER_PAGE = 6;


// Skeleton component
const SkeletonPlaceholder = ({ style }: { style: object }) => (
  <View style={[styles.skeleton, style]} />
);

const TABS = [
  { key: "products", label: "Products" },
  { key: "services", label: "Services" },
  { key: "jobs", label: "Jobs" },
  { key: "jobApps", label: "Job Seekers" },
  { key: "lostItems", label: "Lost Items" },
];

interface TabBarProps {
  activeTab: string;
  setActiveTab: (tabKey: string) => void;
  counts: { [key: string]: number };
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, setActiveTab, counts }) => (
  <View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 10 }}>
    {TABS.map((tab) => (
      <TouchableOpacity
        key={tab.key}
        onPress={() => setActiveTab(tab.key)}
        style={{
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderBottomWidth: activeTab === tab.key ? 2 : 0,
          borderBottomColor: "#007BFF",
        }}
      >
        <Text style={{ fontWeight: activeTab === tab.key ? "bold" : "normal" }}>
          {tab.label} ({counts[tab.key]})
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default function HomeScreen() {
  // const [products, setProducts] = useState<Product[]>([]);
  const [visibleProductCount, setVisibleProductCount] =
    useState(PRODUCTS_PER_PAGE);
  const { userProfile, getUserProfile, tokenAvailable } = useAuth();
  const { products, loading, error, refreshData,services, jobs, jobApps, lostItems } = useProduct();
    const [activeTab, setActiveTab] = useState("products");

  const [isModalVisible, setModalVisible] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  // const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const filteredProducts = products.filter(
  (product) =>
    (product.name?.toLowerCase() || "").includes(debouncedSearchQuery.toLowerCase()) ||
    (product.description?.toLowerCase() || "").includes(debouncedSearchQuery.toLowerCase())
);

const filteredServices = services.filter(
  (service) =>
    (service.name?.toLowerCase() || "").includes(debouncedSearchQuery.toLowerCase()) ||
    (service.description?.toLowerCase() || "").includes(debouncedSearchQuery.toLowerCase())
);

const filteredJobs = jobs.filter(
  (job) =>
    (job.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (job.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
);

const filteredJobApps = jobApps.filter(
  (jobApp) =>
    (jobApp.firstName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (jobApp.jobType?.toLowerCase() || "").includes(searchQuery.toLowerCase())
);

const filteredLostItems = lostItems.filter(
  (lostItem) =>
    (lostItem.itemName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (lostItem.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
);

const counts = {
  products: filteredProducts.length,
  services: filteredServices.length,
  jobs: filteredJobs.length,
  jobApps: filteredJobApps.length,
  lostItems: filteredLostItems.length,
};

  const getTabData = () => {
    switch (activeTab) {
      case "products":
        return { data: filteredProducts, label: "Products" };
      case "services":
        return { data: filteredServices, label: "Services" };
      case "jobs":
        return { data: filteredJobs, label: "Jobs" };
      case "jobApps":
        return { data: filteredJobApps, label: "Job Seekers" };
      case "lostItems":
        return { data: filteredLostItems, label: "Lost Items" };
      default:
        return { data: filteredProducts, label: "Products" };
    }
  };

  const { data: tabData, label: tabLabel } = getTabData();

  useEffect(() => {
  if (!searchQuery && activeTab !== "products") {
    setActiveTab("products");
  }
}, [searchQuery]);

useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedSearchQuery(searchQuery);
  }, 350); // 350ms debounce

  return () => clearTimeout(handler);
}, [searchQuery]);

const handleResultPress = useCallback((item: Product) => {
    router.push(`/Product/${item._id}`);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        await getUserProfile();
        if (userProfile) {
          setRole(userProfile.role);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  

  const handleShowMore = () => {
    setVisibleProductCount((prev) =>
      Math.min(prev + PRODUCTS_PER_PAGE, products.length)
    );
  };

  const handleShowLess = () => {
    setVisibleProductCount(PRODUCTS_PER_PAGE);
  };

  const handleProductDetails = (product: Product) => {
    router.push(`/Product/${product._id}`);
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };



  const handlesignup = () => {
    router.push({ pathname: "/(auth)/AuthScreen", params: { mode: "signup" } });
  };

  const handlesignin = () => {
    router.push({ pathname: "/(auth)/AuthScreen", params: { mode: "signin" } });
  };

  const allProductsShown = visibleProductCount >= products.length;

  // Show skeleton loading while user profile is being fetched
  if (profileLoading) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        {/* Header Skeleton */}
        <View style={styles.headerSkeleton}>
          <SkeletonPlaceholder style={styles.logoSkeleton} />
          <View style={styles.headerRightSkeleton}>
            <SkeletonPlaceholder style={styles.iconSkeleton} />
            <SkeletonPlaceholder style={styles.iconSkeleton} />
          </View>
        </View>

        {/* Banner Skeleton */}
        <SkeletonPlaceholder style={styles.bannerSkeleton} />

        {/* Categories Skeleton */}
        <View style={styles.categoriesContainer}>
          {[...Array(4)].map((_, i) => (
            <View key={i} style={styles.categorySkeleton}>
              <SkeletonPlaceholder style={styles.categoryImageSkeleton} />
              <SkeletonPlaceholder style={styles.categoryTextSkeleton} />
            </View>
          ))}
        </View>

        {/* Products Title Skeleton */}
        <SkeletonPlaceholder style={styles.titleSkeleton} />

        {/* Products Grid Skeleton */}
        <View style={styles.productsGridSkeleton}>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={styles.productSkeleton}>
              <SkeletonPlaceholder style={styles.productImageSkeleton} />
              <SkeletonPlaceholder style={styles.productTextSkeleton} />
              <SkeletonPlaceholder style={styles.productTextSkeletonShort} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  const renderItemForActiveTab = ({ item }: { item: any }) => {
    switch (activeTab) {
      case "products":
        return (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleResultPress(item as Product)}
          >
            <Image
              source={{ uri: (item as Product).images?.[0]?.url || "https://via.placeholder.com/60" }}
              style={styles.resultImage}
            />
            <View style={styles.resultTextContainer}>
              <Text style={styles.resultText} numberOfLines={2}>
                {(item as Product).name}
              </Text>
              <Text style={styles.resultDescription} numberOfLines={2}>
                {(item as Product).description}
              </Text>
            </View>
          </TouchableOpacity>
        );
      case "services":
        return (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => {/* handle service press if needed */
               router.push({
                              pathname: `/Services/[ViewServices]`,
                              params: {
                                id: item._id,
                                category: item.name,
                              },
                            })
            }}
          >
            <Image
              source={{ uri: item.images?.[0]?.url || "https://via.placeholder.com/60" }}
              style={styles.resultImage}
            />
            <View style={styles.resultTextContainer}>
              <Text style={styles.resultText} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.resultDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </TouchableOpacity>
        );
      case "jobs":
        return (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => {/* handle job press if needed */}}
          >
            <View style={styles.resultTextContainer}>
              <Text style={styles.resultText} numberOfLines={2}>
                {item.jobTitle || item.title}
              </Text>
              <Text style={styles.resultDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </TouchableOpacity>
        );
      case "jobApps":
        return (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => {/* handle job application press if needed */
              router.push(`/Jobs/${item._id}`)
            }}
          >
            <View style={styles.resultTextContainer}>
              <Text style={styles.resultText} numberOfLines={2}>
                {item.firstName} {item.lastName}
              </Text>
              <Text style={styles.resultDescription} numberOfLines={2}>
                {item.jobType}
              </Text>
            </View>
          </TouchableOpacity>
        );
      case "lostItems":
        return (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => {/* handle lost item press if needed */
              router.push(`/LostItem/${item._id}`)
            }}
          >
            <Image
              source={{ uri: item.images?.[0]?.url || "https://via.placeholder.com/60" }}
              style={styles.resultImage}
            />
            <View style={styles.resultTextContainer}>
              <Text style={styles.resultText} numberOfLines={2}>
                {item.itemName}
              </Text>
              <Text style={styles.resultDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      key={item._id}
      style={styles.productContainer}
      onPress={() => handleProductDetails(item)}
    >
      <View>
        <Image
          source={{
            uri: item.images[0]?.url || "https://via.placeholder.com/150",
          }}
          style={styles.productImage}
        />
        <Text numberOfLines={2} style={styles.productName}>
          {item.name}
        </Text>
        <Text numberOfLines={2} style={styles.productDescription}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Render the appropriate screen based on the user's role
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {!tokenAvailable && (
        <View style={styles.authButtonsContainer}>
          <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
            <TouchableOpacity
              onPress={handlesignup}
              style={styles.authButton}
            >
              <Text style={styles.authButtonText}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlesignin}
              style={styles.authButton}
            >
              <Text style={styles.authButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {debouncedSearchQuery  ? (
        <FlatList
          key="search-list" // <-- Add a unique key for search results
          data={tabData}
          keyExtractor={(item) => item._id}
          renderItem={renderItemForActiveTab}
          ListHeaderComponent={
            <>
              <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <TabBar activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />
              <Text style={styles.resultHeaderText}>
                {tabData.length} result{tabData.length !== 1 ? "s" : ""}
              </Text>
            </>
          }
          ListEmptyComponent={
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No results found</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <FlatList
          key="products-list" // <-- Add a unique key for products grid
          data={products.slice(0, visibleProductCount)}
          keyExtractor={(item) => item._id}
          renderItem={renderProductItem}
          numColumns={2}
          ListHeaderComponent={
            <>
              <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <Banner />
              <List />
              <View style={styles.titleContainer}>
                <ThemedText type="title" style={{ fontSize: 20, paddingLeft: 20 }}>
                  {loading ? (
                    <SkeletonPlaceholder style={styles.titleSkeleton} />
                  ) : (
                    `All Products (${products.length})`
                  )}
                </ThemedText>
              </View>
            </>
          }
          ListFooterComponent={
            <>
              {!loading && products.length > PRODUCTS_PER_PAGE && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={allProductsShown ? handleShowLess : handleShowMore}
                >
                  <Text style={styles.showMoreButtonText}>
                    {allProductsShown ? "Show Less" : "Show More"}
                  </Text>
                </TouchableOpacity>
              )}
              <Footer />
            </>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productList}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

    resultItem: {
    padding: 15,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  resultDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  resultHeaderText: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    color: "#888",
    fontWeight: "bold",
    borderRadius: 8,
    marginBottom: 8,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  noResultsText: {
    color: "#888",
    fontSize: 16,
  },
  // Existing styles...
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    width: "100%",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 14,
    color: "#007BFF",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  productList: {
    marginTop: 20,
    paddingBottom: 0,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  productContainer: {
    width: "48%",
    marginBottom: 16,
    padding: 10,
    backgroundColor: "rgba(166, 176, 180, 0.2)",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    marginHorizontal: 5,
    
  },
  productImage: {
    height: 150,
    width: "100%",
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 13,
    fontWeight: "bold",
    paddingBottom: 3,
  },
  productDescription: {
    fontSize: 10,
    color: "gray",
  },
  showMoreButton: {
    backgroundColor: "rgba(211, 211, 211, .3)",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    marginHorizontal: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  showMoreButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  authButtonsContainer: {
    position: "absolute",
  top: height * 0.91,
    right: 10,
    zIndex: 100,
    width: 160,
    backgroundColor: "rgba(0,0,0, .1)",
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  authButton: {
    backgroundColor: "skyblue",
    padding: 12,
    borderRadius: 10,
  },
  authButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  adminButton: {
    position: "absolute",
    bottom: -3,
    right: "5%",
    backgroundColor: "rgba(255, 255, 255, .5)",
    padding: 8,
    borderRadius: 15,
  },
  adminButtonImage: {
    height: 40,
    width: 40,
  },

  // Skeleton styles
  skeleton: {
    backgroundColor: "#e1e1e1",
    borderRadius: 4,
  },
  headerSkeleton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logoSkeleton: {
    width: 120,
    height: 40,
    borderRadius: 8,
  },
  headerRightSkeleton: {
    flexDirection: "row",
    gap: 15,
  },
  iconSkeleton: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  bannerSkeleton: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginBottom: 20,
  },
  categoriesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  categorySkeleton: {
    alignItems: "center",
    width: "23%",
  },
  categoryImageSkeleton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  categoryTextSkeleton: {
    width: 50,
    height: 12,
  },
  titleSkeleton: {
    width: 200,
    height: 24,
    marginBottom: 20,
    marginLeft: 20,
  },
  productsGridSkeleton: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  productSkeleton: {
    width: "48%",
    marginBottom: 16,
    padding: 10,
    backgroundColor: "rgba(166, 176, 180, 0.2)",
    borderRadius: 8,
  },
  productImageSkeleton: {
    height: 150,
    width: "100%",
    borderRadius: 8,
    marginBottom: 8,
  },
  productTextSkeleton: {
    width: "100%",
    height: 16,
    marginBottom: 6,
  },
  productTextSkeletonShort: {
    width: "80%",
    height: 12,
  },
});
