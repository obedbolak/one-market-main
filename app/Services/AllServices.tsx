import { useAuth } from "@/context/AuthContext";
import { useOthers } from "@/context/OthersContext";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ListRenderItem,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Dropdown from "../components/Dropdown";
import RealEstateSelector from "../components/RealEstateSelector";

// Image interface
interface IImage {
  public_id: string;
  url: string;
  _id: string;
}

// Main Service Interface
interface Service {
  _id: string;
  locationCity: string;
  name: string;
  description: string;
  location: string;
  contactInfo: string;
  email: string;
  images: IImage[];
  status: "active" | "inactive";
  createdAt: string;
  __v: number;
}

interface Job {
  id: string;
  title: string;
  rate: string;
  description: string;
}

interface NewService {
  name: string;
  rate: string;
  description: string;
  location: string;
  contactInfo: string;
  email: string;
  locationCity: string;
  postType: string;
  postName: string;
  propertyState: string;
}

interface PropertyImage {
  _id: string;
  public_id: string;
  url: string;
}

interface Property {
  _id: string;
  postName: string;
  postType: string;
  propertyState: string;
  description: string;
  location: string;
  contactInfo: string;
  email: string;
  images: PropertyImage[];
  status: string;
  isApproved: boolean;
  locationCity: string;
  createdAt: string;
}

interface ServiceCardProps {
  item: Service;
}
interface PropertiesCardProps {
  item: Property;
}

interface JobCardProps {
  item: Job;
}

type Mode = "AllServices" | "createaservice" | "jobs" | undefined;

// Sample data
const dummyJobs = [
  {
    id: "1",
    title: "Software Developer",
    rate: "30",
    description:
      "Looking for a skilled developer to build and maintain web applications.",
  },
  {
    id: "2",
    title: "Graphic Designer",
    rate: "25",
    description:
      "A creative designer needed to work on branding and marketing materials.",
  },
  {
    id: "3",
    title: "Project Manager",
    rate: "40",
    description:
      "Manage teams and coordinate various stages of a project from start to finish.",
  },
  {
    id: "4",
    title: "Content Writer",
    rate: "15",
    description:
      "We need a content writer for blogs, articles, and other web content.",
  },
  {
    id: "5",
    title: "SEO Specialist",
    rate: "35",
    description:
      "Help businesses optimize their websites for search engines to increase traffic.",
  },
];

const categories = [
  "All",
  "Health",
  "Mechanic",
  "Plumber",
  "Construction",
  "Transportation",
  "Education",
  "Entertainment",
  "Beauty",
  "Home Services",
  "Event Planning",
  "Finance",
  "Technology",
  "Marketing",
  "Legal",
  "Research",
  "Retail",
  "Fashion",
  "Photography",
  "Graphic Design",
  "Writing",
  "Translation",
  "Interior Design",
  "Real Estate",
  "Nonprofit",
  "Consulting",
  "Management",
  "Engineering",
  "Accounting",
  "Car rental services",
];

const AllServices: React.FC = () => {
  const { mode, categoryList } = useLocalSearchParams<{
    mode?: Mode;
    categoryList?: string;
  }>();
  const { userProfile, tokenAvailable } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [active, setActive] = useState<Boolean>(false);
  const [viewCat, setViewCat] = useState<Boolean>(false);
  const [viewRealCat, setViewRealCat] = useState<Boolean>(false);
  const [searchlocation, setSearchLocation] = useState<Boolean>(false);
  const [location, setLocation] = useState<string>("");
  const [locationCity, setLocationCity] = useState("");
  const [viewProperty, setViewProperty] = useState(false);
  const [viewDrugs, setViewDrugs] = useState(false);
  const [ViewTrasnports, setViewTransports] = useState(false);
  const [itemToView, setItemToView] = useState<Property | null>(null);
  const [newService, setNewService] = useState<NewService>({
    name: "Health",
    rate: "",
    description: "",
    contactInfo: "",
    location: "",
    email: "",
    locationCity: "",
    postName: "",
    postType: "",
    propertyState: "",
  });
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryList ? categoryList : "All"
  );
  const { services, refreshAll, fetchServices } = useOthers();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [filteredServices, setFilteredServices] = useState(services);
  const [createLocation, setCreateLocation] = useState<boolean>(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState(properties);
  const [viewProperties, setViewProperties] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<string>("mtn");
  const [realPrice, setRealPrice] = useState<Number>(0);
  const [momoNumber, setMomoNumber] = useState<string>("");
  const isPlanDisabled = (planNumber: number) => {
    return userProfile?.productPayments === planNumber;
  };

  const fetchServiceItems = async () => {
    try {
      const response = await axios.get(
        "https://onemarketapi.xyz/api/v1/service/services"
      );
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch lost items");
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await axios.get(
        "https://onemarketapi.xyz/api/v1/prop/properties"
      );
      setProperties(response.data.properties);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchDrugs = async () => {
    try {
      const response = await axios.get(
        "https://onemarketapi.xyz/api/v1/prop/properties"
      );
      setProperties(response.data.properties);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransport = async () => {
    try {
      const response = await axios.get(
        "https://onemarketapi.xyz/api/v1/prop/properties"
      );
      setProperties(response.data.properties);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetchServiceItems();
    fetchProperties();
    fetchDrugs();
    fetchTransport();
    console.log(services);
  }, []);

  const ServiceCard: React.FC<ServiceCardProps> = ({ item }) => (
    <TouchableOpacity>
      <View style={styles.serviceCard}>
        <Image
          source={{ uri: item.images[0].url }}
          style={styles.serviceImage}
        />
        <View style={{}}>
          <View>
            <View>
              <Text style={styles.serviceTitle}>{item.name}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                width: "95%",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={[styles.serviceTitle, { color: "green", fontSize: 12 }]}
              >
                {item.location}
              </Text>
              <View style={{ flexDirection: "row" }}>
                <Ionicons name="location" size={18} color={"orange"} />
                <Text
                  style={[
                    styles.serviceTitle,
                    { color: "green", fontSize: 12 },
                  ]}
                >
                  {item.contactInfo}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.serviceDescription}>{item.description}</Text>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() =>
              router.push({
                pathname: `/Services/[ViewServices]`,
                params: {
                  id: item._id,
                  category: item.name,
                },
              })
            }
          >
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Handles showing property details when clicked
  const handleViewProperty = (item: any) => {
    setItemToView(item);
  };

  const PropertiesCard: React.FC<PropertiesCardProps> = ({ item }) => (
    <View style={styles.propertyCardContainer}>
      <TouchableOpacity>
        <View style={styles.propertyCard}>
          <Image
            source={{ uri: item.images[0].url }}
            style={styles.serviceImageProperties}
          />
          <View style={styles.propertyContent}>
            <Text style={styles.propertyTitle} numberOfLines={1}>
              {item.postName}
            </Text>
            <Text style={styles.propertyType} numberOfLines={1}>
              {item.postType}
            </Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={14} color="orange" />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.locationCity}
              </Text>
              <Text style={styles.contactText} numberOfLines={1}>
                {item.contactInfo}
              </Text>
            </View>
            <Text style={styles.propertyDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <TouchableOpacity
              onPress={() => {
                handleViewProperty(item);
                setViewProperty(true);
                setItemToView(item);
              }}
              style={styles.detailsButton}
            >
              <Text style={styles.detailsButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const JobCard: React.FC<JobCardProps> = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardRate}>Rate: ${item.rate}/hr</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => alert(`Applied for ${item.title}`)}
      >
        <Text style={styles.applyButtonText}>Apply Now</Text>
      </TouchableOpacity>
    </View>
  );

  // const filteredServices = service.filter(
  //   (item) =>
  //     item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     item.contactInfo.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  useEffect(() => {
    if (categoryList) {
      setSelectedCategory(categoryList);
    }
  }, [categoryList]);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    const updatedFilteredServices = services.filter((item) => {
      const categoryMatch =
        selectedCategory === "All" || item.name === selectedCategory;
      const locationMatch = location
        ? item.locationCity.toLowerCase() === location.toLowerCase()
        : true;

      const searchMatch =
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.contactInfo.toLowerCase().includes(query) ||
        item.locationCity.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query);

      return categoryMatch && locationMatch && searchMatch;
    });

    setFilteredServices(updatedFilteredServices);
  }, [services, searchQuery, selectedCategory, location]);

  const renderService: ListRenderItem<Service> = ({ item }) => (
    <ServiceCard item={item} />
  );

  const renderProperties: ListRenderItem<Property> = ({ item }) => (
    <PropertiesCard item={item} />
  );

  const renderJob: ListRenderItem<Job> = ({ item }) => <JobCard item={item} />;

  const filteredServicesCat = services.filter((item) => {
    if (selectedCategory === "All") {
      return (
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      return (
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        item.name.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }
  });

  const catToggle = () => {
    setViewCat(!viewCat);
  };

  const categoryFilterCreate = (
    <View
      style={[
        styles.categoryContainer,
        {
          flexWrap: "wrap",
          flexDirection: "row",
          backgroundColor: "white",
          width: "100%",
          marginTop: 23,
          padding: 5,
          borderRadius: 10,
        },
      ]}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryItem,
            selectedCategory === category && styles.selectedCategory,
          ]}
          onPress={() => {
            setNewService({ ...newService, name: category });
            setViewCat(false);
          }}
        >
          <Text style={styles.categoryText}>{category}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const categoryFilter = (
    <View
      style={[
        styles.categoryContainer,
        {
          flexWrap: "wrap",
          flexDirection: "row",
          backgroundColor: "rgba(0,0,0,0.2)",
          width: "100%",
          marginTop: 23,
          padding: 10,
          borderRadius: 10,
        },
      ]}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryItem,
            selectedCategory === category && styles.selectedCategory,
          ]}
          onPress={() => {
            setSelectedCategory(category);
            setViewCat(false);
          }}
        >
          <Text style={styles.categoryText}>{category}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const getSubscriptionAmount = (): number => {
    switch (newService.name) {
      case "Real Estate":
        if (newService.postType === "1 Room") return 1500;
        if (newService.postType.trim() === "Studio Apartments") return 2000;
        if (newService.postType.trim() === "1+1 Apartments") return 2000;
        if (newService.postType.trim() === "2+1 Apartments") return 2000;
        if (newService.postType.trim() === "3+1 Apartments") return 2000;
        if (newService.postType.trim() === "Duplexes") return 3000;
        if (newService.postType.trim() === "Office Space") return 5000;
        if (newService.postType.trim() === "Land") return 5000;
        return 0;
      case "Transportation":
        return 3000;
      case "Health":
        return 4000;
      default:
        return 2000;
    }
  };

  // const getSubscriptionAmount = () => {
  //   switch (newService.name) {
  //     case "Real Estate":
  //       return realPrice;

  //     case "Transportation":
  //       return "XAF 3000";

  //     case "Health":
  //       return "XAF 4000";

  //     default:
  //       return "XAF 2000";
  //   }
  // };

  const getSubscriptionTitle = (): string => {
    switch (newService.name) {
      case "Real Estate":
        return `${newService.postType} ${newService.propertyState}`;
      case "Transportation":
        return "Transport Subscription";
      case "Health":
        return "Health Subscription";
      default:
        return "Service Subscription";
    }
  };

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

  const handleCreateService = async () => {
    if (images.length === 0) {
      Alert.alert("Error", "Please select at least one image.");
      return;
    }
    setActive(true);

    const formData = new FormData();

    // Common fields for all services
    formData.append("name", newService.name);
    formData.append("description", newService.description);
    formData.append("location", newService.location);
    formData.append("contactInfo", newService.contactInfo);
    formData.append("email", newService.email);
    formData.append("locationCity", newService.locationCity);

    // Add specific fields based on service type
    if (newService.postType) { // This indicates it's a property

      formData.append("postType", newService.postType);
      formData.append("postName", newService.postName);
      formData.append("propertyState", newService.propertyState);
      console.log("Property state:", formData);
    }
     
    // Add images
    images.forEach((uri, index) => {
      const type = uri.endsWith(".jpg") ? "image/jpeg" : "image/png";
      formData.append("files", {
        uri,
        name: `service_image${index + 1}.${type === "image/jpeg" ? "jpg" : "png"}`,
        type,
      } as any);
    });

    try {
      // Determine the correct endpoint based on service type
      const endpoint = newService.postType
        ? "https://onemarketapi.xyz/api/v1/prop/property"
        : "https://onemarketapi.xyz/api/v1/service/services";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const responseData = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Service created successfully!");
        resetForm();
      } else {
        Alert.alert("Error", responseData.message || "Failed to create service.");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setActive(false);
    }
  };

  const resetForm = () => {
    setNewService({
      name: "",
      rate: "",
      description: "",
      location: "",
      email: "",
      contactInfo: "",
      locationCity: "",
      postName: "",
      postType: "",
      propertyState: "",
    });
    setImages([]);
    setCreateLocation(false);
  };

  const allServicesContent = (
    <TouchableWithoutFeedback
      onPress={() => {
        setSearchLocation(false);
        setLocation(location);
        setViewProperties(false);
      }}
    >
      <View style={styles.container}>
        {/* <View>
        <TouchableOpacity
          onPress={() => catToggle()}
          style={{
            paddingHorizontal: 8,
            paddingVertical: 5,
            borderRadius: 5,
            backgroundColor: "#007AFF",
            width: "40%",
            marginBottom: 10,
            flexDirection: "row",
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>
            Category Options
          </Text>
          {viewCat ? (
            <Ionicons name="chevron-down" size={20} color="white" />
          ) : (
            <Ionicons name="chevron-forward" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View> */}
        <View
          style={{
            flexDirection: "row",
            borderWidth: 1,
            borderColor: "#d1d1d1", // lighter border color for a subtle effect
            borderRadius: 8,
            backgroundColor: "#fff", // clean white background for a more professional look
            padding: 10,
            alignItems: "center", // center align the items vertically
            shadowColor: "#000", // adding a shadow for depth
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 5, // for Android shadow
            marginBottom: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => catToggle()}
            style={{ flexDirection: "row" }}
          >
            <TextInput
              placeholder="All"
              editable={false}
              value={selectedCategory}
              onChangeText={(text) => {
                setSelectedCategory(text);
                setLocation(location);
                setViewProperties(false);
              }}
              style={{
                fontWeight: "bold",
                fontSize: 14,
                color: "gray", // darker text color for better contrast
                marginRight: 10, // spacing between the first and second input
              }}
            />
            {viewCat ? (
              <Ionicons name="chevron-down" size={17} color={"orange"} />
            ) : (
              <Ionicons name="chevron-forward" size={17} color={"orange"} />
            )}
          </TouchableOpacity>

          <View
            style={{
              flex: 3,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TextInput
              style={{
                flex: 3,
                backgroundColor: "#f7f7f7", // subtle background to separate it from the border
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 2,
                fontSize: 14,
                color: "#333",
              }}
              placeholder={
                selectedCategory === "Health"
                  ? `Search for Drugs, Pharmacies `
                  : `Search In ${selectedCategory}`
              }
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#888" // making the placeholder color lighter
            />
            <Ionicons
              name="search"
              size={20}
              color="#888"
              style={{ marginLeft: 10 }}
            />
          </View>
        </View>
        {viewCat && (
          <View
            style={{
              position: "absolute",
              top: 55,

              zIndex: 100,
              width: "105%",
            }}
          >
            <View>{categoryFilter}</View>
          </View>
        )}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: "96%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              width: 150,
              marginBottom: 20,
            }}
          >
            <TouchableOpacity
              style={{ flexDirection: "row" }}
              onPress={() => setSearchLocation(!searchlocation)}
            >
              <Text> Select</Text>
              <Ionicons name="location" size={20} color={"orange"} />
              <TextInput
                value={location || "Location"}
                editable={false}
                style={{ color: "green" }}
              />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", gap: 5 }}>
            <TouchableOpacity
              onPress={() => {
                setViewProperties(true);
                setViewProperties(!viewProperties);
              }}
              style={{
                backgroundColor:
                  selectedCategory === "Real Estate" ? "orange" : "transparent",
                borderRadius: 5,
                height: 25,
                alignItems: "center",
                paddingHorizontal: 5,
                justifyContent: "center",
              }}
              disabled={selectedCategory !== "Real Estate"}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                {selectedCategory === "Real Estate"
                  ? " Properties"
                  : selectedCategory === "Health"
                  ? null
                  : selectedCategory === "Transportation"
                  ? null
                  : ""}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setNewService({ ...newService, name: selectedCategory });
                router.push({
                  pathname: "/Services/AllServices",
                  params: { mode: "createaservice" },
                });
              }}
            >
              <Text style={{ color: "skyblue", fontWeight: "bold" }}>
                Create Post
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {searchlocation && (
          <View
            style={{
              position: "absolute",
              zIndex: 1007,
              top: 100,
              flexWrap: "wrap",
              flexDirection: "row",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              width: "100%",

              padding: 10,
              borderRadius: 10,
            }}
          >
            {[
              "Yaoundé",
              "Douala",
              "Bamenda",
              "Bafoussam",
              "Garoua",
              "Maroua",
              "Buea",
              "Limbe",
              "Kumba",
              "Bertoua",
              "Ngaoundéré",
              "Kribi",
            ].map((city) => (
              <TouchableOpacity
                key={city}
                style={{
                  padding: 5,
                  borderRadius: 5,
                  marginTop: 2,
                  width: "30%",
                }}
                onPress={() => {
                  setLocation(city);
                  setSearchLocation(false);
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {searchQuery !== "" || location !== "" || viewProperties ? (
          <>
            {viewProperties ? (
              <>
                {!viewProperty ? (
                  <FlatList<Property>
                    data={properties}
                    renderItem={renderProperties}
                    keyExtractor={(item) => item._id}
                    numColumns={2} // Set to 2 columns
                    columnWrapperStyle={styles.propertyRow}
                    contentContainerStyle={styles.propertiesContainer}
                    showsVerticalScrollIndicator={false}
                  />
                ) : (
                  <ScrollView>
                    <View>
                      {/* Main Property Image */}
                      <View style={styles.mainImageContainer}>
                        <Image
                          source={{ uri: itemToView?.images[0].url }}
                          style={styles.mainImage}
                          resizeMode="cover"
                        />
                      </View>

                      {/* Image Gallery */}
                      <View style={styles.galleryContainer}>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.galleryScroll}
                        >
                          {itemToView?.images.map((image, index) => (
                            <Image
                              key={index}
                              source={{ uri: image.url }}
                              style={styles.thumbnailImage}
                              resizeMode="cover"
                            />
                          ))}
                        </ScrollView>
                      </View>

                      {/* Property Information */}
                      <ScrollView style={styles.detailsContainer}>
                        <Text style={styles.propertyName}>
                          {itemToView?.postName.trim()}
                        </Text>

                        <View style={styles.ViewlocationContainer}>
                          <View>
                            <Text style={styles.ViewpropertyType}>
                              {itemToView?.postType.trim()}
                            </Text>
                          </View>
                          <View></View>

                          <Text style={styles.locationText}>
                            {itemToView?.locationCity.trim()},
                            {itemToView?.propertyState.trim()}
                          </Text>
                        </View>

                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>
                          {itemToView?.description.trim()}
                        </Text>

                        <Text style={styles.sectionTitle}>
                          Contact Information
                        </Text>
                        <Text style={styles.contactInfo}>
                          {itemToView?.contactInfo.trim()}
                        </Text>
                      </ScrollView>

                      {/* Back Button */}
                      <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => {
                          setViewProperties(true);
                          setViewProperty(false);
                        }}
                      >
                        <Ionicons
                          name="chevron-back"
                          size={30}
                          color="orange"
                        />
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                )}
              </>
            ) : (
              <FlatList<Service>
                data={filteredServices}
                renderItem={renderService}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        ) : (
          <FlatList<Service>
            data={filteredServicesCat}
            renderItem={renderService}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );

  const createServiceContent = (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <TouchableWithoutFeedback
        onPress={() => {
          setCreateLocation(false);
          setViewCat(false);
          setViewRealCat(false);
        }}
      >
        <View style={styles.container}>
          <View style={styles.formContainer}>
            <Text style={styles.formLabel}>Select A Service Category</Text>
            {/* <RealEstateSelector
              onSelectionChange={(transaction, property) => {
                setNewService({
                  ...newService,
                  name: transaction,
                });

                if (transaction === "rent") {
                  setNewService({
                    ...newService,
                    postType: property,
                  });
                } else if (transaction === "sale") {
                  setNewService({
                    ...newService,
                    postType: property,
                  });
                } else {
                  setNewService({
                    ...newService,
                    postType: "",
                  });
                }
              }}
              initialTransactionType="rent"
              initialPropertyType="apartment"
            /> */}
            <Dropdown
              items={categories.map((category) => ({
                label: category,
                value: category,
              }))}
              onSelect={(category) => {
                setNewService({ ...newService, name: category });
                setViewCat(false);
              }}
              selectedValue={newService.name}
              placeholder="Select a category"
              width={200}
            />
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <View style={{ flexDirection: "row", flex: 2 }}>
                {/* <TouchableOpacity
                  style={{
                    flex: 2,
                    backgroundColor: "#f9f9f9",
                    padding: 12,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: "#e0e0e0",
                    marginBottom: 16,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                  onPress={() => {
                    setViewCat(!viewCat);
                    setViewRealCat(false);
                    setNewService({ ...newService, propertyState: "" });
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setViewCat(!viewCat);
                      setViewRealCat(false);
                      setNewService({
                        ...newService,
                        propertyState: "",
                      });
                    }}
                  >
                    <Text style={{ color: "orange", fontWeight: "bold" }}>
                      {newService.name}
                    </Text>
                  </TouchableOpacity>
                  {viewCat ? (
                    <TouchableOpacity
                      style={{ paddingHorizontal: "7%" }}
                      onPress={() => {
                        setViewCat(!viewCat);
                        setViewRealCat(false);
                        setNewService({
                          ...newService,
                          propertyState: "",
                        });
                      }}
                    >
                      <Ionicons name="chevron-down" size={20} color="orange" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={{ paddingHorizontal: "7%" }}
                      onPress={() => {
                        setViewCat(!viewCat);
                        setViewRealCat(false);
                        setNewService({
                          ...newService,
                          propertyState: "",
                        });
                      }}
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="orange"
                      />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity> */}
                {/* {newService.name === "Real Estate" && (
                  <TouchableOpacity
                    style={{
                      marginLeft: 10,
                      flex: 2,
                      backgroundColor: "#f9f9f9",
                      padding: 12,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: "#e0e0e0",
                      marginBottom: 16,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                    onPress={() => {
                      setViewRealCat(!viewRealCat);
                      setViewCat(false);
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setViewRealCat(!viewRealCat);
                        setViewCat(false);
                        setNewService({
                          ...newService,
                          propertyState: "",
                        });
                      }}
                    >
                      <Text style={{ color: "orange", fontWeight: "bold" }}>
                        {newService.postType || "Create Property Post"}
                      </Text>
                    </TouchableOpacity>
                    {viewRealCat ? (
                      <TouchableOpacity
                        style={{ paddingHorizontal: "7%" }}
                        onPress={() => {
                          setViewRealCat(!viewRealCat);
                          setViewCat(false);
                          setNewService({ ...newService, propertyState: "" });
                        }}
                      >
                        <Ionicons
                          name="chevron-down"
                          size={20}
                          color="orange"
                        />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={{ paddingHorizontal: "7%" }}
                        onPress={() => {
                          setViewRealCat(!viewRealCat);
                          setNewService({
                            ...newService,
                            propertyState: "",
                          });
                        }}
                      >
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="orange"
                        />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                )} */}

                {newService.name === "Real Estate" && (
                  <RealEstateSelector
                    onSelectionChange={(transaction, property) => {
                     

                      if (transaction === "rent") {
                        setNewService({
                          ...newService,
                          postType: property,
                        });
                        setNewService({
                        ...newService,
                        propertyState: transaction,
                      });
                      } else if (transaction === "sale") {
                        setNewService({
                          ...newService,
                          postType: property,
                        });
                        setNewService({
                        ...newService,
                        propertyState: transaction,
                      });
                      } else {
                        setNewService({
                          ...newService,
                          postType: "",
                        });
                      }
                    }}
                    initialTransactionType="rent"
                    initialPropertyType="1 Room"
                  />
                )}
              </View>

              {viewCat && (
                <View
                  style={{
                    position: "absolute",
                    top: 25,
                    left: -6,
                    zIndex: 100,
                    width: "103%",
                  }}
                >
                  <View>{categoryFilterCreate}</View>
                </View>
              )}

              {viewRealCat && (
                <View
                  style={{
                    position: "absolute",
                    top: 50,
                    left: 90,
                    zIndex: 100,
                    width: "103%",
                  }}
                >
                  <View>
                    <View
                      style={{
                        backgroundColor: "#f9f9f9",
                        padding: 12,
                        flexDirection: "row",
                        gap: 20,
                        marginLeft: 92,
                        borderRadius: 6,
                        borderColor: "#e0e0e0",
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          padding: 10,
                          backgroundColor:
                            newService.propertyState === "Rent"
                              ? "lightgray"
                              : "orange",
                          borderRadius: 6,
                          paddingHorizontal: 20,
                        }}
                        onPress={() =>
                          setNewService({
                            ...newService,
                            propertyState: "Rent",
                          })
                        }
                      >
                        <Text style={{ color: "white", fontWeight: "bold" }}>
                          Rent
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          padding: 10,
                          backgroundColor:
                            newService.propertyState === "Sale"
                              ? "lightgray"
                              : "orange",
                          borderRadius: 6,
                          paddingHorizontal: 20,
                        }}
                        onPress={() =>
                          setNewService({
                            ...newService,
                            propertyState: "Sale",
                          })
                        }
                      >
                        <Text style={{ color: "white", fontWeight: "bold" }}>
                          Sale
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: "row" }}>
                      {newService.propertyState !== "" ? (
                        <>
                          <View>
                            {[
                              "1 Room",
                              " Studio Apartments",
                              " 1+1 Apartments",
                              " 2+1 Apartments",
                              " 3+1 Apartments",
                            ].map((item, index) => (
                              <View key={item.length - index}>
                                <TouchableOpacity>
                                  <Text
                                    style={{
                                      backgroundColor: "#f9f9f9",
                                      padding: 12,
                                      borderRadius: 6,

                                      borderColor: "#e0e0e0",

                                      flexDirection: "row",
                                      justifyContent: "space-between",
                                    }}
                                    onPress={() => {
                                      setNewService({
                                        ...newService,
                                        postType: item,
                                      });
                                      setViewRealCat(!viewRealCat);
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: "orange",
                                        fontWeight: "bold",
                                        fontSize: 12,
                                      }}
                                    >
                                      {item}
                                    </Text>
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            ))}
                          </View>
                          <View>
                            {[
                              "Duplexes",
                              "Office Space ",
                              "Commercial Properties",
                              "Land ",
                            ].map((item, index) => (
                              <View key={item.length - index}>
                                <TouchableOpacity>
                                  <Text
                                    style={{
                                      backgroundColor: "#f9f9f9",
                                      padding: 12,
                                      borderRadius: 6,

                                      borderColor: "#e0e0e0",

                                      flexDirection: "row",
                                      justifyContent: "space-between",
                                    }}
                                    onPress={() => {
                                      setNewService({
                                        ...newService,
                                        postType: item,
                                      });
                                      setViewRealCat(!viewRealCat);
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: "orange",
                                        fontWeight: "bold",
                                        fontSize: 12,
                                      }}
                                    >
                                      {item}
                                    </Text>
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            ))}
                          </View>
                        </>
                      ) : null}
                    </View>
                  </View>
                </View>
              )}
            </View>
            {newService.name === "Others" && (
              <>
                <Text style={styles.formLabel}>Name of Service</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Your Category"
                  value={newService.name === "Others" ? "" : newService.name}
                  onChangeText={(text: string) =>
                    setNewService({ ...newService, name: text })
                  }
                />
              </>
            )}
            <Text style={styles.formLabel}>
              {newService.postType !== "" ? "Property Title" : "Service Name"}
            </Text>
            <TextInput
  style={styles.input}
  placeholder={
    newService.postType 
      ? "Enter Property Title" 
      : "Enter service name (e.g., Pharmacy, Car-Repairs)"
  }
  value={newService.postType ? newService.postName : newService.location}
  onChangeText={(text) =>
    newService.postType
      ? setNewService({ ...newService, postName: text })
      : setNewService({ ...newService, location: text })
  }
/>
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1, marginBottom: 10 }}>  
                <Text style={styles.formLabel}>City</Text>
                <TouchableOpacity
                  style={{
                    borderWidth: 0.8,
                    borderColor: "#e0e0e0",
                    borderRadius: 6,
                    backgroundColor: "#f9f9f9",
                    padding: 12,
                    marginRight: 4,
                  }}
                  onPress={() => setCreateLocation(!createLocation)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text>{locationCity ? locationCity : "Select City"}</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={"orange"}
                    />
                  </View>
                </TouchableOpacity>
              </View>
              
              {createLocation && (
                <View
                  style={{
                    position: "absolute",
                    zIndex: 1007,
                    top: 80,
                    flexWrap: "wrap",
                    flexDirection: "row",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    width: "100%",

                    padding: 10,
                    borderRadius: 10,
                  }}
                >
                  {[
                    "Yaoundé",
                    "Douala",
                    "Bamenda",
                    "Bafoussam",
                    "Garoua",
                    "Maroua",
                    "Buea",
                    "Limbe",
                    "Kumba",
                    "Bertoua",
                    "Ngaoundéré",
                    "Kribi",
                  ].map((city) => (
                    <TouchableOpacity
                      key={city}
                      style={{
                        padding: 5,
                        borderRadius: 5,
                        marginTop: 2,
                      }}
                      onPress={() => {
                        setLocationCity(city);
                        setNewService({ ...newService, locationCity: city });
                        setCreateLocation(false);
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "bold" }}>
                        {city}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <View style={{}}>
                <Text style={styles.formLabel}>
                  {newService.postType === newService.postType
                    ? `${newService.postType} Address`
                    : "Service Address"}
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder={
                    newService.postType !== ""
                      ? "Enter Property Address"
                      : "Enter service (etug-ebe round-about)"
                  }
                  value={newService.contactInfo}
                  onChangeText={(text: string) =>
                    setNewService({ ...newService, contactInfo: text })
                  }
                />
              </View>
            <Text style={styles.formLabel}> Email or Phone</Text>
            <TextInput
              style={styles.input}
              placeholder={
                newService.postType !== ""
                  ? "Enter Property Contact e-mails/ phone"
                  : "Enter service email/phone"
              }
              value={newService.email}
              onChangeText={(text: string) =>
                setNewService({ ...newService, email: text })
              }
            />
            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={
                newService.postType !== ""
                  ? "Enter Property description"
                  : "Enter service description"
              }
              multiline
              numberOfLines={4}
              value={newService.description}
              onChangeText={(text: string) =>
                setNewService({ ...newService, description: text })
              }
            />
            <View style={{ marginBottom: 10 }}>
              <Text>Maximum of 6 images</Text>
            </View>
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
                  <MaterialIcons
                    name="add-photo-alternate"
                    size={32}
                    color="#007bff"
                  />
                  <Text style={styles.addImageText}>Add Image</Text>
                </TouchableOpacity>
              )}
            </View>

            {active ? (
              <ActivityIndicator size="large" color="#007AFF" />
            ) : (
              <>
                {tokenAvailable ? (
                  <>
                    {newService.postType !== "" ? (
                      <>
                        <TouchableOpacity
                          style={styles.submitButton}
                          onPress={() => handleCreateService()} // Directly call the service creation function
                        >
                          <Text style={styles.submitButtonText}>
                            Create Property
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <TouchableOpacity
                          style={styles.submitButton}
                          onPress={() => handleCreateService()} // Directly call the service creation function
                        >
                          <Text style={styles.submitButtonText}>
                            Create Service
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Text style={{ color: "lightblue", fontWeight: "bold" }}>
                      Register to continue ..
                    </Text>
                    <View
                      style={{ flexDirection: "row", gap: 15, marginTop: 5 }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          router.push({
                            pathname: "/(auth)/AuthScreen",
                            params: { mode: "signup" },
                          })
                        }
                        style={{
                          padding: 10,
                          backgroundColor: "blue",
                          borderRadius: 7,
                          width: "40%",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "white", fontWeight: "bold" }}>
                          Sign Up
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );

  const jobsContent = (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search jobs..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList<Job>
        data={dummyJobs.filter((job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        renderItem={renderJob}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const getPageTitle = (mode: Mode): string => {
    switch (mode) {
      case "AllServices":
        return "Available Services";
      case "createaservice":
        return "Create a Service";
      case "jobs":
        return "Available Jobs";
      default:
        return "Services";
    }
  };

  const getContent = (mode: Mode): React.ReactElement => {
    switch (mode) {
      case "AllServices":
        return allServicesContent;
      case "createaservice":
        return createServiceContent;
      case "jobs":
        return jobsContent;
      default:
        return allServicesContent;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <View style={[styles.mainContainer, { flex: 1 }]}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: "absolute",
              top: 20,
              zIndex: 100,
              padding: 5,
              backgroundColor: "transparent",
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
            <Ionicons name="arrow-back" size={23} color={"black"} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{getPageTitle(mode)}</Text>
          {getContent(mode)}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  Viewcontainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mainImageContainer: {
    width: "100%",
    height: 300,
    backgroundColor: "#f0f0f0",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  galleryContainer: {
    marginVertical: 10,
  },
  galleryScroll: {
    paddingHorizontal: 10,
  },
  thumbnailImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  detailsContainer: {
    flex: 1,
    padding: 15,
  },
  propertyName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  ViewpropertyType: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  ViewlocationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
    marginBottom: 15,
  },
  contactInfo: {
    fontSize: 14,
    color: "#333",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 15,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 5,
  },
  propertiesContainer: {
    padding: 8,
  },
  propertyRow: {
    justifyContent: "space-between",
  },
  propertyCardContainer: {
    width: "48%", // Slightly less than 50% to account for spacing
    marginBottom: 16,
  },
  propertyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: "auto",
  },
  propertyContent: {
    padding: 12,
  },
  serviceImageProperties: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  propertyType: {
    fontSize: 14,
    color: "orange",
    fontWeight: "500",
    marginBottom: 4,
  },
  categoryContainer: {
    flexDirection: "row",
    marginBottom: 16,
    flex: 1,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "white",
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  selectedCategory: {
    backgroundColor: "#0056b3",
  },
  categoryText: {
    color: "orange",
    fontWeight: "bold",
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
  mainContainer: {
    backgroundColor: "#f5f5f5",
    flex: 1,
  },
  container: {
    padding: 10,
    flex: 1,
  },
  pageTitle: {
    paddingHorizontal: 80,
    fontSize: 24,
    fontWeight: "bold",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchInput: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  listContainer: {
    paddingBottom: 150, // Reduced from 750 to improve scrolling
  },
  listContainerProperties: {
    padding: 10,
  },
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  serviceImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },

  serviceTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  serviceDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  detailsButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  detailsButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  locationText: {
    fontSize: 12,
    color: "green",
    marginLeft: 4,
    flex: 1,
  },
  contactText: {
    fontSize: 12,
    color: "green",
    marginLeft: 4,
  },
  propertyDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    lineHeight: 16,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardRate: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#444",
    marginBottom: 12,
  },
  applyButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 24,
  },

  propertyImage: {
    width: "100%",
    height: 200,
    // your styles
  },

  propertyContact: {
    fontSize: 14,
    color: "gray",
    // your styles
  },
});

export default AllServices;
