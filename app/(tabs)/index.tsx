import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [visibleProductCount, setVisibleProductCount] =
    useState(PRODUCTS_PER_PAGE);
  const { userProfile, getUserProfile, tokenAvailable } = useAuth();
  const [isModalVisible, setModalVisible] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch user profile and set role on mount
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

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://onemarketapi.xyz/api/v1/product/get-all"
        );
        const data = response.data;
        if (data.success) {
          setProducts(data.products);
        } else {
          console.error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
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

  const handleOptionSelect = (option: string) => {
    if (option === "createProduct") {
      router.push("/Merchant/CreateProduct");
    } else if (option === "viewOrders") {
      router.push("/Merchant/ViewOrders");
    } else if (option === "accountSettings") {
      router.push("/Merchant/AccountSettings");
    } else if (option === "Products") {
      router.push("/Merchant/MyProduct");
    }
    setModalVisible(false);
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

  // Render the appropriate screen based on the user's role
  return (
    <>
      <SafeAreaView>
        {!tokenAvailable && (
          <View style={styles.authButtonsContainer}>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
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

        <ScrollView showsVerticalScrollIndicator={false}>
          <Header />
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

          <ScrollView
            contentContainerStyle={styles.productList}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.productGrid}>
              {loading
                ? // Show skeleton placeholders while loading
                  [...Array(6)].map((_, i) => (
                    <View key={i} style={styles.productContainer}>
                      <SkeletonPlaceholder
                        style={styles.productImageSkeleton}
                      />
                      <SkeletonPlaceholder style={styles.productTextSkeleton} />
                      <SkeletonPlaceholder
                        style={styles.productTextSkeletonShort}
                      />
                    </View>
                  ))
                : // Show actual products when loaded
                  products.slice(0, visibleProductCount).map((product) => (
                    <TouchableOpacity
                      key={product._id}
                      style={styles.productContainer}
                      onPress={() => handleProductDetails(product)}
                    >
                      <View>
                        <Image
                          source={{
                            uri:
                              product.images[0]?.url ||
                              "https://via.placeholder.com/150",
                          }}
                          style={styles.productImage}
                        />
                        <Text numberOfLines={2} style={styles.productName}>
                          {product.name}
                        </Text>
                        <Text
                          numberOfLines={2}
                          style={styles.productDescription}
                        >
                          {product.description}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
            </View>

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
          </ScrollView>
          <Footer />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
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
    paddingBottom: 20,
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
  },
  showMoreButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  authButtonsContainer: {
    position: "absolute",
    top: height * 0.85,
    right: 10,
    zIndex: 100,
    width: 170,
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
