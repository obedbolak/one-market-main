import { useAuth } from "@/context/AuthContext";
import { useProduct } from "@/context/ProductContext";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
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

interface Item {
  title: string;
  description: string;
  image: any;
}
interface ProfilePic {
  public_id: string;
  url: string;
}
interface Category {
  _id: string;
  category: string;
}
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  answer: string;
  role: string;
  profilePic?: ProfilePic;
  createdAt: string;
  updatedAt: string;
  __v: number;
  storeName: string;
  businessAddress: string;
  businessDescription: string;
  businessPhone: string;
  productPayments: number;
  USSDCode: string;
}

const NEW_ARRIVALS: Item[] = [
  {
    title: "Item for Sale",
    description: "Versatile products designed for various applications",
    image: require("../../assets/images/gif/createproduct.png"),
  },
  {
    title: "Property Rent/sale",
    description: "Property",
    image: require("../../assets/images/gif/property.png"),
  },
  {
    title: "Cars for Sale",
    description: "Customizable vehicles that combine performance",
    image: require("../../assets/images/gif/car.png"),
  },
];

const CreateProduct: React.FC = () => {
  // const [categories, setCategories] = useState<Category[]>([]);
const{categories} = useProduct()
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [category, setCategory] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [stock, setStock] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [sku, setSku] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const { getUserProfile, signout, tokenAvailable, userProfile } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [ViewCategory, setViewCategoryId] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentProductCount, setCurrentProductCount] = useState<number>(0);

  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     try {
  //       const response = await fetch(
  //         "https://onemarketapi.xyz/api/v1/cat/get-all"
  //       );
  //       const data = await response.json();
  //       if (data.success) {
  //         setCategories(data.categories);
  //       } else {
  //         console.error("Failed to fetch categories:", data.message);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching categories:", error);
  //     }
  //   };

  //   fetchCategories();
  // }, []);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category.category);
    setCategory(category._id);
    setModalVisible(false);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await getUserProfile();
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchProfile();
  }, []);

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

  if (!userProfile) {
    return <Text>Loading profile...</Text>;
  }

  const Uid = userProfile?._id;

  const handleSubmit = async () => {
    if (images.length === 0) {
      Alert.alert("Error", "Please select at least one image.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("stock", stock);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("sellerId", Uid);

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
        "https://onemarketapi.xyz/api/v1/product/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const responseText = await response.text();
      if (response.ok) {
        const responseData = JSON.parse(responseText);
        if (responseData.success) {
          Alert.alert("Success", "Product created successfully!");
        } else {
          Alert.alert(
            "Error",
            responseData.message || "Failed to create product."
          );
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      Alert.alert("Error", "There was an error while submitting the product.");
    }
  };

  // Add this to your component's state

  // Fetch the count when component mounts or when needed
  useEffect(() => {
    const fetchUserDataAndSetLimit = async () => {
      try {
        // 1. Fetch all users
        const response = await fetch(
          "https://onemarketapi.xyz/api/v1/user/getusers"
        );
        const data = await response.json();

        // 2. Find the current user
        const currentUser = data.find(
          (user: UserProfile) => user._id === userProfile?._id
        );

        if (currentUser) {
          // 3. Set product count based on payment plan
          switch (currentUser.productPayments) {
            case 1:
              setCurrentProductCount(10); // Plan 1 = 10 products
              break;
            case 2:
              setCurrentProductCount(20); // Plan 2 = 20 products
              break;
            case 3:
              setCurrentProductCount(40); // Plan 3 = 40 products
              break;
            case 4:
              setCurrentProductCount(50); // Plan 4 = 50 products
              break;
            default:
              setCurrentProductCount(0); // Free/unrecognized plan
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Optional: Set default values on error
        setCurrentProductCount(0);
      }
    };

    if (userProfile?._id) {
      fetchUserDataAndSetLimit();
    }
  }, [userProfile?._id]); // Only re-run if userProfile._id changes
  console.log(currentProductCount);

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

  const renderImages = () => (
    <View style={styles.imageGridContainer}>
      {images.map((uri, index) => (
        <View key={index} style={styles.imageContainer}>
          <Image source={{ uri }} style={styles.image} />
          <TouchableOpacity
            onPress={() => {
              const newImages = [...images];
              newImages.splice(index, 1);
              setImages(newImages);
            }}
            style={styles.deleteButton}
          >
            <MaterialIcons name="delete" size={20} color="white" />
          </TouchableOpacity>
        </View>
      ))}
      {images.length < 5 && (
        <TouchableOpacity
          onPress={pickImages}
          style={[styles.imageContainer, styles.addImageButton]}
        >
          <MaterialIcons name="add-photo-alternate" size={32} color="#007bff" />
          <Text style={styles.addImageText}>Add Image</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.title}>Choose Product Type</Text>
      </View> */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.productList}>
          {/* {NEW_ARRIVALS.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.productItem}
              onPress={() => setSelectedItem(item)}
            >
              <View style={styles.productCard}>
                <Image source={item.image} style={styles.productImage} />
                <Text style={styles.productTitle}>{item.title}</Text>
                <Text
                  style={styles.productDescription}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))} */}
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ top: 19, left: 20, position: "absolute", zIndex: 1 }}
        >
          <Ionicons name="arrow-back" size={24} color="green" />
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Create Product</Text>
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.label}>
              Selected Category:
              {selectedCategory !== null ? (
                <Text>{selectedCategory || " None"}</Text>
              ) : (
                <Text>No Category selecte</Text>
              )}
            </Text>

            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setViewCategoryId(!ViewCategory)}
            >
              <Text style={styles.buttonText}>Select Category</Text>
            </TouchableOpacity>
            {
              <View style={{}}>
                {ViewCategory !== false && (
                  <View>
                    {categories.map((item) => (
                      <TouchableOpacity
                        key={item._id}
                        style={styles.item}
                        onPress={() => {
                          handleCategorySelect(item);
                          setViewCategoryId(!ViewCategory);
                        }}
                      >
                        <Text style={styles.itemText}>{item.category}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            }
          </View>

          <TextInput
            placeholder="Product Title"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <TextInput
            placeholder="Product Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            multiline
          />
          <TextInput
            placeholder="Stock"
            value={stock}
            onChangeText={setStock}
            style={styles.input}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Price"
            value={price}
            onChangeText={setPrice}
            style={styles.input}
            keyboardType="decimal-pad"
          />
          <TextInput
            placeholder="Tags (comma separated)"
            value={tags}
            onChangeText={setTags}
            style={styles.input}
          />
          <TextInput
            placeholder="SKU"
            value={sku}
            onChangeText={setSku}
            style={styles.input}
          />

          {/* <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Category</Text>

                <FlatList
                  data={categories}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.item}
                      onPress={() => handleCategorySelect(item)}
                    >
                      <Text style={styles.itemText}>{item.category}</Text>
                    </TouchableOpacity>
                  )}
                />

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal> */}

          <View style={{ marginBottom: 12, marginTop: 12 }}>
            {renderImages()}

            <TouchableOpacity style={styles.closeButton} onPress={handleSubmit}>
              <Text style={{ color: "white", fontWeight: "bold" }}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  productList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  productItem: {
    width: "33%",
    padding: 8,
  },
  productCard: {
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    padding: 8,
  },
  productImage: {
    width: "100%",
    height: 80,
    borderRadius: 8,
  },
  productTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 8,
  },
  productDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  formContainer: {
    marginTop: 16,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    alignSelf: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  categoryLabel: {
    marginBottom: 8,
    fontSize: 16,
  },
  picker: {
    marginBottom: 16,
  },
  imageGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  imageContainer: {
    width: (Dimensions.get("window").width - 52) / 4,
    height: (Dimensions.get("window").width - 52) / 4,
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  deleteButton: {
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
  },
  addImageButton: {
    borderWidth: 2,
    borderColor: "#007bff",
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  addImageText: {
    color: "#007bff",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  selectButton: {
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 15,
    textAlign: "center",
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  itemText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#FF5733",
    borderRadius: 5,
    alignItems: "center",
  },
});

export default CreateProduct;
