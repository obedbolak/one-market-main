import { useAuth } from "@/context/AuthContext";
import { useProduct } from "@/context/ProductContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image as RNImage,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Boost from "../Product/Boost";
import Boosts from "../Services/Boosts";
const { width: screenWidth } = Dimensions.get("window");
const CONTAINER_PADDING = 2; // 2px padding on each side

const CATEGORIES = [
  {
    text: "All Categories",
    image: require("@/assets/images/gif/Imagecat.png"),
    backgroundColor: "#FFA500",
  },
  // {
  //   text: "All Sellers",
  //   image: require("@/assets/images/gif/Imagebuis.png"),
  //   backgroundColor: "#0000FF",
  // },
  {
    text: "Lost Items",
    image: require("../../assets/images/prodimg/lost.png"),
    backgroundColor: "#FFA500",
  },
  {
    text: "Services",
    image: require("../../assets/images/prodimg/service.png"),
    backgroundColor: "green",
  },
  {
    text: "Jobs",
    image: require("../../assets/images/prodimg/hire.png"),
    backgroundColor: "#FFA500",
  },
];

// const dummyLostItems = [
//   {
//     id: 1,
//     title: "Lost Wallet",
//     description: "Black leather wallet found near the park.",
//     image:
//       "https://images.pexels.com/photos/915915/pexels-photo-915915.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
//   },
//   {
//     id: 2,
//     title: "Missing Bicycle",
//     description: "Red mountain bike missing from the bike rack.",
//     image:
//       "https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
//   },
//   {
//     id: 3,
//     title: "Lost Keys",
//     description: "Set of keys found at the library entrance.",
//     image:
//       "https://images.pexels.com/photos/14721/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
//   },
//   {
//     id: 4,
//     title: "Hand bag ",
//     description: "Handbag found around Mispa restaurant.",
//     image: "https://ericaharel.com/wp-content/uploads/2016/12/booth.jpg",
//   },
// ];

interface ProfilePic {
  public_id: string;
  url: string;
}
// Type for the user object
interface User {
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
}

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

const allCategories = [
  {
    id: 1,
    text: "Clothing",
    image:
      "https://cdn.pixabay.com/photo/2017/08/05/12/19/dress-2583113_960_720.jpg",
  },
  {
    id: 2,
    text: "Electronics",
    image:
      "https://cdn.pixabay.com/photo/2019/12/27/01/49/samsung-4721550_960_720.jpg",
  },
  {
    text: "Jewelery",
    image:
      "https://cdn.pixabay.com/photo/2016/02/02/15/54/jewellery-1175532_960_720.jpg",
  },
  {
    id: 3,
    text: "Home",
    image:
      "https://www.pngitem.com/pimgs/m/61-612748_home-appliances-background-home-appliances-images-png-transparent.png",
  },
  {
    id: 4,
    text: "Sport",
    image:
      "https://www.pngitem.com/pimgs/m/20-202915_png-sport-transparent-png.png",
  },
  {
    id: 5,
    text: "Automobile",
    image:
      "https://www.pngitem.com/pimgs/m/280-2804288_autos-chevrolet-spark-ng-harga-mobil-merk-toyota.png",
  },
  {
    id: "66fb27ea4dd7e644d9ec42d9",
    text: "Arts & Crafts",
    image:
      "https://www.pngitem.com/pimgs/m/30-300954_monarch-paint-brush-rollers-and-other-accessories-paint.png",
  },
  {
    id: "66fb26e54dd7e644d9ec42d5",
    text: "Pet Supplies",
    image:
      "https://www.pngitem.com/pimgs/m/325-3259002_discount-pet-supplies-pets-supplies-hd-png-download.png",
  },
];

// Image interface
interface Image {
  public_id: string;
  url: string;
  _id: string;
}

// Main Service Interface
interface Service {
  _id: string;
  name: string;
  description: string;
  location: string;
  contactInfo: string;
  email: string;
  images: Image[];
  status: "active" | "inactive"; // assuming status can only be 'active' or 'inactive'
  createdAt: string; // ISO string
  __v: number;
}

const CategoryButton = ({
  category,
  isSelected,
  onPress,
}: {
  category: any;
  isSelected: boolean;
  onPress: () => void;
}) => {
  const bgColor = isSelected ? "#FFFFFF" : category.backgroundColor;
  const textColor = isSelected ? "#A0A0A0" : "#FFFFFF";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: bgColor,
        borderRadius: 10,
        paddingVertical: 8,
        height: 50, // Fixed height for consistency
      }}
    >
      <View
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <Text
          style={{
            color: textColor,
            fontSize: 12,
            fontWeight: "bold",
            textAlign: "center",
            paddingHorizontal: 4,
          }}
        >
          {category.text}
        </Text>
        <RNImage
          source={category.image}
          style={{ width: 28, height: 28, marginTop: 4 }}
        />
      </View>
    </TouchableOpacity>
  );
};

const Services = () => {
  const { services } = useProduct();

  // Use the first 3 services from context
  const displayedServices = services.slice(0, 3);

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 15, fontWeight: "bold", marginBottom: 8 }}>
        Services
      </Text>
      <FlatList
        data={displayedServices}
        keyExtractor={(item: Service) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/Services/${item._id}`)}
          >
            <View style={{ marginRight: 16 }}>
              <RNImage
                source={{ uri: item.images[0].url }}
                style={{ width: 100, height: 100, borderRadius: 50 }}
              />
              <Text style={{ textAlign: "center", marginTop: 8 }}>
                {item.name}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          marginTop: 10,
          gap: 2,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "orange",
            width: "25%",
            padding: 6,
            borderRadius: 10,
          }}
          onPress={() =>
            router.push({
              pathname: "/Services/AllServices",
              params: { mode: "AllServices" },
            })
          }
        >
          <Text style={{ color: "white" }}>All Services </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: "green",
            width: "40%",
            padding: 6,
            borderRadius: 10,
          }}
          onPress={() =>
            router.push({
              pathname: "/Services/AllServices",
              params: { mode: "createaservice" },
            })
          }
        >
          <Text style={{ color: "white", alignSelf: "center" }}>
            Create a Service
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Jobs = () => {
  const categoryData = [
    {
      id: "1",
      title: "Job Seekers",

      image: require("../../assets/images/prodimg/cv.png"),
    },
    {
      id: "2",
      title: "Create a Job",

      image: require("../../assets/images/prodimg/plus3.png"),
    },

    {
      id: "3",
      title: "Search for a Job",
      image: require("../../assets/images/prodimg/search.png"),
    },
  ];

  return (
    <View style={{ padding: 5, marginTop: 10 }}>
      <FlatList
        data={categoryData}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: `/Jobs/[id]`, // Navigate to the category details page
                params: { id: item.id, title: item.title, image: item.image }, // Passing the full category object as params
              });
            }}
          >
            <View
              style={{
                width: 130,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <RNImage
                source={item.image} // Load image from the provided URL
                style={{ width: 80, height: 80, borderRadius: 10 }}
              />
              <Text style={{ textAlign: "center", marginTop: 8 }}>
                {item.title}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const TopSellers = () => {
  const [sellers, setSellers] = useState<User[]>([]);
  const { userProfile, getUserProfile } = useAuth();

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await fetch(
          "https://onemarketapi.xyz/api/v1/user/getusers"
        );
        const data = await response.json();

        // Ensure you check the API response

        if (Array.isArray(data)) {
          const adminUsers = data.filter(
            (user: { role: string }) => user.role === "admin"
          );
          setSellers(adminUsers.slice(0, 3));
        } else {
          console.error("Unexpected data structure:", data);
        }
      } catch (error) {
        console.error("Error fetching sellers:", error);
      }
    };

    fetchSellers();
  }, []);

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

  if (!userProfile) {
    return <Text>Loading profile...</Text>;
  }

  const handlesellerRegister = () => {
    router.push("/Merchant/BecomeSeller");
  };

  const handleSellerPush = (item: User) => {
    router.push(`/Seller/${item._id}`); // Navigate to the seller's details page with the seller's ID
  };

  const handleViewSellers = () => {
    router.push("/Seller/ViewSellers");
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 15, fontWeight: "bold", marginBottom: 8 }}>
        Top Sellers
      </Text>
      <FlatList
        data={sellers}
        keyExtractor={(item: User) => item._id}
        horizontal
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item.name}
            onPress={() => handleSellerPush(item)}
          >
            <View style={{ marginRight: 16 }}>
              {item.profilePic?.url ? (
                <RNImage
                  source={{ uri: item.profilePic.url }}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                />
              ) : (
                <RNImage
                  source={require("../../assets/images/prodimg/user.png")}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                />
              )}
              <Text style={{ textAlign: "center", marginTop: 8 }}>
                {item.name.replace(/\b\w/g, (char) => char.toUpperCase())}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />
      <View
        style={{ flexDirection: "row", gap: 3, justifyContent: "flex-end" }}
      >
        {userProfile?.role !== "admin" && userProfile?.role !== "user" ? (
          userProfile?.role === "guest" ? (
            <TouchableOpacity
              style={{
                backgroundColor: "skyblue",
                paddingBottom: 6,
                paddingHorizontal: 5,
                paddingVertical: 5,
                borderRadius: 6,
              }}
              onPress={() => router.push("/(auth)/AuthScreen")}
            >
              {/* If the role is "guest", show the sign-in link */}
              <TouchableOpacity
                onPress={() => router.push("/(auth)/AuthScreen")}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Sign In
                </Text>
              </TouchableOpacity>
              {/* Otherwise, show 'Sell on (1M)' */}
              {userProfile?.role !== "guest" && <Text> Sell on (1M)</Text>}
            </TouchableOpacity>
          ) : null
        ) : null}

        {userProfile?.role === "user" ? (
          <TouchableOpacity
            onPress={handlesellerRegister}
            style={{
              backgroundColor: "orange",
              paddingBottom: 6,
              paddingHorizontal: 5,
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "bold",
                marginTop: 8,
                color: "white",
              }}
            >
              <>
                Sell on
                <Text style={{ color: "white", fontWeight: "bold" }}>(1M)</Text>
              </>
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const AllCategories = () => {
  const handldeCategories = (item: { text: string }) => {
    router.push(`/Categories/${item.text}`);
  };

  return (
    <View style={{ padding: 16 }}>
      <FlatList
        data={allCategories}
        keyExtractor={(item) => item.text}
        horizontal
        renderItem={({ item, index }) => (
          <TouchableOpacity key={index} onPress={() => handldeCategories(item)}>
            <View style={{ marginRight: 16, alignItems: "center" }}>
              <RNImage
                source={{ uri: item.image }}
                style={{ width: 50, height: 50, borderRadius: 10 }}
              />
              <Text style={{ textAlign: "center", marginTop: 8 }}>
                {item.text}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const Category = () => {
  const { width } = useWindowDimensions();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const handlePress = (category: string) => {
    setSelectedCategory((prevCategory) =>
      prevCategory === category ? null : category
    );

    if (category === "Lost Items") {
      flatListRef.current?.scrollToIndex({ index: 0, animated: true });
    }
  };

  const handleLostItems = (item: { _id: string }) => {
    router.push(`/LostItem/${item._id}`);
  };

  const renderLostItem = ({ item }: { item: LostItem }) => (
    <TouchableOpacity
      style={{ marginTop: 12 }}
      onPress={() => handleLostItems(item)}
    >
      <View
        style={{
          borderBottomWidth: 2,
          borderBottomColor: "#ffffff",
          width: 250,

          alignItems: "center",
        }}
      >
        <RNImage
          source={{ uri: item.images[0]?.url }}
          style={{ width: "60%", height: 120, borderRadius: 10 }}
          resizeMode="cover"
        />
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            marginTop: 8,
            maxWidth: "60%",
          }}
        >
          {item.itemName}
        </Text>
        <Text
          style={{
            color: "#A0A0A0",
            marginTop: 4,
            maxWidth: "80%",
            fontWeight: "bold",
          }}
        >
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    const { lostItems } = useProduct();

    if (selectedCategory === "Lost Items") {
      if (!lostItems || lostItems.length === 0) {
        return <ActivityIndicator size="large" color="#0000ff" />;
      }
      return (
        <View>
          <FlatList
            ref={flatListRef}
            data={lostItems.slice(0, 3)}
            keyExtractor={(item: LostItem) => item._id}
            renderItem={renderLostItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={250}
            decelerationRate="fast"
          />
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              justifyContent: "flex-end",
              marginTop: 8,
              gap: 5,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "rgba(255, 0, 0, 0.8)",
                padding: 5,
                borderRadius: 5,
              }}
              onPress={() =>
                router.push({
                  pathname: "/LostItem/LostItem",
                  params: { mode: "lostItem" },
                })
              }
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Report Item
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: "green", padding: 5, borderRadius: 5 }}
              onPress={() =>
                router.push({
                  pathname: "/LostItem/LostItem",
                  params: { mode: "searchItem" },
                })
              }
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                More ...
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (selectedCategory === "All Categories") {
      return <AllCategories />;
    } else if (selectedCategory === "Services") {
      return <Services />;
    } else if (selectedCategory === "Jobs") {
      return <Jobs />;
    }
    return null;
  };

  return (
    <View style={{ backgroundColor: "#F0F0F0", flex: 1 }}>
      <Text
        style={{
          fontSize: 14,
          marginBottom: 8,
          marginTop: 16,

          fontWeight: "500",
          color: "gray",
          marginLeft: 8,
        }}
      >
        Business Section
      </Text>

      <View
        style={{
          flexDirection: "row",
          width: "100%", // Ensure full width
          paddingHorizontal: CONTAINER_PADDING * 2, // 2px padding on sides
        }}
      >
        {CATEGORIES.map((category, index) => (
          <View
            key={category.text.toString() + index}
            style={{
              flex: 1,
              minWidth:
                (screenWidth - CONTAINER_PADDING * 4) / CATEGORIES.length,
              paddingHorizontal: 2,
            }}
          >
            <CategoryButton
              key={category.text.toString() + index}
              category={category}
              isSelected={selectedCategory === category.text}
              onPress={() => handlePress(category.text)}
            />
          </View>
        ))}
      </View>
      <View>{renderContent()}</View>

      <View
        style={{
          flexDirection: "row",
          gap: 8,
          marginTop: 8,
          paddingHorizontal: 8,
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFA500", // Your orange
            borderRadius: 10,
            paddingVertical: 12,
            minHeight: 80,
            borderWidth: 1,
            borderColor: "#2E8B57", // Your green as border
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
          onPress={() =>
            router.push({
              pathname: "/Services/AllServices",
              params: { categoryList: "Transportation" },
            })
          }
        >
          <Ionicons name="bus" size={20} color="white" />
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: "white",
              letterSpacing: 0.5,
              marginTop: 8,
            }}
          >
            Pay Bus Ticket
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#2E8B57", // Your green
            borderRadius: 10,
            paddingVertical: 12,
            minHeight: 80,
            borderWidth: 1,
            borderColor: "#FFA500", // Your orange as border
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
          onPress={() =>
            router.push({
              pathname: "/Services/AllServices",
              params: { categoryList: "Health" },
            })
          }
        >
          <Ionicons name="medical" size={20} color="white" />
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: "white",
              letterSpacing: 0.5,
              marginTop: 8,
            }}
          >
            Pharmacies
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white", // Your white
            borderRadius: 10,
            paddingVertical: 12,
            minHeight: 80,
            borderWidth: 1,
            borderColor: "#2E8B57", // Your green as border
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
          onPress={() =>
            router.push({
              pathname: "/Services/AllServices",
              params: { categoryList: "Real Estate" },
            })
          }
        >
          <Ionicons name="home" size={20} color="#2E8B57" />
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: "#2E8B57", // Green text
              letterSpacing: 0.5,
              marginTop: 8,
            }}
          >
            House for Rent
          </Text>
        </TouchableOpacity>
      </View>
      <Text
        style={{
          marginTop: 16,
          fontSize: 14,
          fontWeight: "500",
          color: "gray",
          marginLeft: 8,
          backgroundColor: "white",
          width: "25%",
          marginBottom: 5,
          textAlign: "center",
          borderRadius: 6,
          elevation: 0.2,
        }}
      >
        Sponsored
      </Text>

      <Boost />
      <Boosts />
    </View>
  );
};

export default Category;
