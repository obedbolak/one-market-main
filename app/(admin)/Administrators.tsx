import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ProductImage {
  public_id: string;
  url: string;
}

interface OrderItem {
  image: string;
  name: string;
  price: number;
  product: string;
  quantity: number;
  sellerId: string;
  _id: {
    $oid: string;
  };
}

interface ShippingInfo {
  address: string;
  city: string;
  country: string;
  postalCode: string;
}

interface PaymentInfo {
  mobileMoneyName: string;
  mobileMoneyNumber: string;
  mobileMoneyProvider: string;
  status: string;
}

interface Order {
  orderStatus: string;
  _id: string;
  Uid: string;
  itemPrice: number;
  orderItems: OrderItem[];
  paymentInfo: PaymentInfo;
  paymentMethod: string;
  shippingCharges: number;
  shippingInfo: ShippingInfo;
  tax: number;
  totalAmount: number;
  createdAt: string;
}

interface IImage {
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
  images: IImage[];
  status: "active" | "inactive";
  createdAt: string;
  __v: number;
}

// Interfaces remain the same...
interface LostItemImage {
  public_id: string;
  url: string;
}

interface LostItem {
  isApproved: boolean;
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
  isApproved: boolean;
}

interface ProfilePic {
  public_id: string;
  url: string;
}

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
  isApproved: boolean;

  __v: number;
}

interface ImageData {
  public_id: string;
  url: string;
  _id: string;
}

interface JobApplication {
  isApproved: boolean;
  _id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  jobType: string;
  briefWhy: string;
  yearsExperience: string;
  email: string;
  phone: string;
  images: ImageData[];
}

interface FetchConfig {
  endpoint: string;
  dataKey?: string;
  fallbackValue?: any[];
  filterFn?: (data: any) => any[];
}

interface JobsCreated {
  isApproved: boolean;
  _id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  salary: string;
  description: string;
  jobImage: ImageData[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

interface MenuButtonProps {
  title: string;
  active: boolean;
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
}

// Add new interface for action buttons
interface ActionButtonsProps {
  onApprove: () => void;
  onDelete: () => void;
  showApprove?: boolean;
  approveText?: string;
  deleteText?: string;
}

// API configuration
const API_BASE_URL = "https://onemarketapi.xyz/api/v1";
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Reusable action buttons component
const ActionButtons = ({
  onApprove,
  onDelete,
  showApprove = true,
  approveText = "Approve",
  deleteText = "Delete",
}: ActionButtonsProps) => {
  const [isApproveClicked, setIsApproveClicked] = useState(false);
  const [isDeleteClicked, setIsDeleteClicked] = useState(false);
  

  const handleApprovePress = () => {
    if (!isApproveClicked) {
      onApprove();
      setIsApproveClicked(true);
    }
  };

  const handleDeletePress = () => {
    if (!isDeleteClicked) {
      onDelete();
      setIsDeleteClicked(true);
    }
  };

  return (
    <View style={styles.actionButtons}>
      {showApprove && (
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.approveButton,
            isApproveClicked && styles.disabledButton,
          ]}
          onPress={handleApprovePress}
          disabled={isApproveClicked} // Disable button after it's clicked
        >
          <Text
            style={[
              styles.actionButtonText,
              isApproveClicked && styles.disabledText,
            ]}
          >
            {approveText}
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[
          styles.actionButton,
          styles.deleteButton,
          isDeleteClicked && styles.disabledButton,
        ]}
        onPress={handleDeletePress}
        disabled={isDeleteClicked} // Disable button after it's clicked
      >
        
        <Ionicons name="trash-outline" size={16} color="#fff" />
        <Text
          style={[
            styles.actionButtonText,
            isDeleteClicked && styles.disabledText,
          ]}
        >
          {deleteText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
// Component Definitions remain the same...

const StatCard = ({ title, value, icon, onPress }: StatCardProps) => (
  <TouchableOpacity onPress={onPress} style={[styles.statCard]}>
    <View
      style={[
        styles.statIcon,
        { flexDirection: "row", alignItems: "center", gap: 8 },
      ]}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Ionicons name={icon} size={24} color="#4CAF50" />
    </View>
    <Text style={styles.statTitle}>{title}</Text>
  </TouchableOpacity>
);

const MenuButton = ({ title, active, onPress, icon }: MenuButtonProps) => (
  <TouchableOpacity
    style={[styles.menuButton, active && styles.menuButtonActive]}
    onPress={onPress}
  >
    <Ionicons
      name={icon}
      size={20}
      color={active ? "#4CAF50" : "#fff"}
      style={styles.menuIcon}
    />
    <Text style={[styles.menuText, active && styles.menuTextActive]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const UserCard = ({
  onDelete,
  onApprove,
  user, // Correctly define user as an argument
}: {
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  user: User; // Type user with the User interface
}) => (
  <View style={styles.userCard}>
    <View style={styles.userAvatar}>
      <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
    </View>
    <View style={styles.userInfo}>
      <Text style={styles.userName}>{user?.name}</Text>
      {user?.email?.endsWith("example.com") ? (
        <Text style={styles.userEmail}>{user?.phone}</Text>
      ) : (
        <Text style={styles.userEmail}>{user?.email}</Text>
      )}
    </View>
    <View style={{}}>
      <View
        style={[
          styles.roleTag,
          {
            backgroundColor: user?.role === "admin" ? "#4CAF50" : "#2196F3",
            paddingHorizontal: user?.role === "admin" ? 10 : 20,
            paddingVertical: user?.role === "admin" ? 2 : 4,
            borderRadius: 4,
            alignSelf: "flex-start",
            marginLeft: 10,
            marginTop: 10,
            marginBottom: 10,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        {user?.role === "admin" ? (
          <Text style={styles.roleText}>Vendor</Text>
        ) : (
          <Text style={styles.roleText}>{user?.role}</Text>
        )}
      </View>

      {user?.isApproved === true ? (
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          {/* <Text style={{ color: "green", paddingHorizontal: 20 }}>
            Verified
          </Text> */}
          <Ionicons name="checkmark-circle" size={20} color={"green"} />
        </View>
      ) : (
        <ActionButtons
          onApprove={() => onApprove(user._id)}
          onDelete={() => onDelete(user._id)}
          deleteText="Delete"
          approveText="Verify"
        />
      )}
    </View>
  </View>
);

const ProductCard = ({
  product,
  deleteProduct,
  approveProduct,
}: {
  product: Product;
  deleteProduct: (productId: string) => void;
  approveProduct: (productId: string) => void;
}) => (
  <View style={styles.productCard}>
    <Text style={styles.productName}>{product.name}</Text>
    <Text style={styles.productPrice}>${product.price}</Text>
    <Text style={styles.productStock}>Stock: {product.stock}</Text>
    <Text style={styles.productCategory}>
      {product.category?.category || "No Category"}
    </Text>

    <View
      style={{
        flexDirection: "row",
        justifyContent: product.isApproved ? "flex-end" : "flex-start",
      }}
    >
      {product.isApproved === true ? (
        <>
          <Text style={{ color: "green" }}>Approved</Text>
          <Ionicons name="checkmark-circle" size={20} color={"green"} />
        </>
      ) : (
        <>
          <TouchableOpacity
            style={{
              backgroundColor: "#4CAF50",
              maxWidth: "23%",
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 4,
              padding: 4,
            }}
            onPress={() => approveProduct(product._id)}
          >
            <Text style={{ color: "white", alignSelf: "center" }}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: "#F44336",
              maxWidth: "15%",
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 4,
              padding: 4,
            }}
            onPress={() => deleteProduct(product._id)}
          >
            <Ionicons name="trash" size={15} color={"white"} />
          </TouchableOpacity>
        </>
      )}
    </View>
  </View>
);

// Other component definitions (Products, LostItems, Jobs, SalesReports) remain the same...
const Products = ({
  products,
  fetchData,
}: {
  products: Product[];
  fetchData: () => void;
}) => {
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);


  const totalProducts = products.length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter((p) => p.stock < 10 && p.stock > 0).length;

  const getFilteredProducts = () => {
    switch (selectedStat) {
      case "outOfStock":
        return products.filter((p) => p.stock === 0);
      case "lowStock":
        return products.filter((p) => p.stock < 10 && p.stock > 0);
      default:
        return products;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      setLoading(true);
      const response = await axiosInstance.delete(`/product/${productId}`);
      if (response.status === 200) {
        fetchData();
        Alert.alert("Success", "Product deleted successfully", [
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]);
       setLoading(false);
      } else {
        Alert.alert("Error", "Failed to delete product", [
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to delete product", [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
    }
  };

  const approveProduct = async (productId: string) => {
    try {
      const response = await axiosInstance.put(`product/approve/${productId}`);

      if (response.status === 200) {
        Alert.alert("Success", "Product Approval successfully", [
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]);
        // reload products
        fetchData();
      } else {
        Alert.alert("Error", "Failed to delete product", [
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to patch product", [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
    }
  };

  return (
    <View style={styles.overviewContainer}>
      <Text style={styles.sectionTitle}>Products Overview</Text>
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon="cube-outline"
          onPress={() => {
            setSelectedStat("all");
            setModalVisible(true);
          }}
        />
        <StatCard
          title="Out of Stock"
          value={outOfStock}
          icon="alert-circle-outline"
          onPress={() => {
            setSelectedStat("outOfStock");
            setModalVisible(true);
          }}
        />
        <StatCard
          title="Low Stock"
          value={lowStock}
          icon="warning-outline"
          onPress={() => {
            setSelectedStat("lowStock");
            setModalVisible(true);
          }}
        />
      </View>
      {/* 
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedStat === "outOfStock"
                  ? "Out of Stock Products"
                  : selectedStat === "lowStock"
                  ? "Low Stock Products"
                  : "All Products"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal> */}
      {selectedStat === "all" ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              deleteProduct={deleteProduct}
              approveProduct={approveProduct}
            />
          )}
          style={styles.productList}
          ListEmptyComponent={<Text>No products found</Text>}
          showsVerticalScrollIndicator={false} // This will hide the vertical scroll indicator
        />
      ) : (
        <FlatList
          data={getFilteredProducts()}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              deleteProduct={deleteProduct}
              approveProduct={approveProduct}
            />
          )}
          style={styles.productList}
          ListEmptyComponent={<Text>No products found</Text>}
          showsVerticalScrollIndicator={false} // This will hide the vertical scroll indicator
        />
      )}
    </View>
  );
};

const LostItems = ({
  items,
  onDelete,
  onApprove,
}: {
  items: LostItem[];
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
}) => {
  const totalItems = items.length;
  const lostItems = items.filter(
    (item: { status: string }) => item.status === "lost"
  ).length;
  const foundItems = items.filter(
    (item: { status: string }) => item.status === "found"
  ).length;

  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  // Filter items based on selectedStat
  const filteredItems =
    selectedStat === "lostItems"
      ? items.filter((item: { status: string }) => item.status === "lost")
      : selectedStat === "foundItems"
      ? items.filter((item: { status: string }) => item.status === "found")
      : items; // default to all items when "all" is selected

  return (
    <View style={styles.overviewContainer}>
      <Text style={styles.sectionTitle}>Lost Items Overview</Text>
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Items"
          value={totalItems}
          icon="folder-outline"
          onPress={() => setSelectedStat("all")}
        />
        <StatCard
          title="Lost Items"
          value={lostItems}
          icon="search-outline"
          onPress={() => setSelectedStat("lostItems")}
        />
        <StatCard
          title="Found Items"
          value={foundItems}
          icon="checkmark-circle-outline"
          onPress={() => setSelectedStat("foundItems")}
        />
      </View>

      {/* Render filtered items */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.lostItemCard}>
            <Text style={styles.itemName}>{item.itemName}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <Text style={styles.itemLocation}>{item.location}</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <ActionButtons
                onApprove={() => onApprove(item._id)}
                onDelete={() => onDelete(item._id)}
                approveText="Approve"
                showApprove={
                  item.isApproved === false &&
                  item.status.toLowerCase() == "lost"
                }
              />
              <View
                style={{
                  backgroundColor:
                    item.status === "Found" ? "#4CAF50" : "#FFA000",
                  flexDirection: "row",

                  alignItems: "center",
                  borderRadius: 4,
                  // height: "60%",
                  padding: 6,
                  // marginTop: 15,
                  maxWidth: "20%",
                }}
              >
                <Text style={styles.statusText}>{item.status}</Text>
                <Ionicons name="filter-circle" size={10} color={"white"} />
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const Jobs = ({
  fetchData,
  onDelete,
  onApprove,
  applications,
  created,
}: {
  applications: JobApplication[];
  created: JobsCreated[];
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  fetchData: () => void;
}) => {
  const totalJobs = created.length;
  const totalApplications = applications.length;
  const averageApplications =
    totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0;

  const handleJobApprove = async (id: string) => {
    try {
      await axiosInstance.patch(`/job/${id}/approve`, {
        isApproved: true,
      });
      Alert.alert("Success", "Job approved");
      fetchData();
    } catch (error) {
      Alert.alert("Error", "Failed to update item status");
    }
  };

  const handleJobDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/job/delete/${id}`);
      Alert.alert("Success", "Job deleted Successfully ");
      fetchData();
    } catch (error) {
      Alert.alert("Error", "Failed to update item status");
    }
  };

  // Filter out logic based on jobstate selection

  const [selectedStat, setSelectedStat] = useState<string | null>(
    created.length > 0 ? "Jobs" : "appications"
  );

  return (
    <View style={styles.overviewContainer}>
      <Text style={styles.sectionTitle}>Jobs Overview</Text>
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Jobs"
          value={totalJobs}
          icon="briefcase-outline"
          onPress={() => setSelectedStat("Jobs")}
        />
        <StatCard
          title="Applications"
          value={totalApplications}
          icon="document-text-outline"
          onPress={() => setSelectedStat("appications")}
        />
        <StatCard
          title="Avg. Applications"
          value={averageApplications}
          icon="analytics-outline"
          onPress={() => setSelectedStat("")}
        />
      </View>

      {/* Render Applications if jobstate is "applications" */}
      {selectedStat === "appications" && (
        <FlatList
          data={applications}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.jobApplicationCard}>
              <Text style={styles.jobApplicationName}>
                {item.firstName} {item.lastName}
              </Text>
              <Text style={styles.jobApplicationEmail}>{item.email}</Text>
              <Text style={styles.jobApplicationPhone}>{item.phone}</Text>

              <ActionButtons
                onApprove={() => onApprove(item._id)}
                onDelete={() => onDelete(item._id)}
                approveText="Approve"
                showApprove={item.isApproved === false}
              />
            </View>
          )}
        />
      )}

      {/* Render Created Jobs if jobstate is "createdJobs" */}
      {selectedStat === "Jobs" && (
        <FlatList
          data={created}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.jobCreatedCard}>
              <Text style={styles.jobCreatedTitle}>{item.jobTitle}</Text>
              <Text style={styles.jobCreatedCompany}>{item.companyName}</Text>
              <Text style={styles.jobCreatedLocation}>{item.location}</Text>
              <ActionButtons
                onApprove={() => handleJobApprove(item._id)}
                onDelete={() => handleJobDelete(item._id)}
                approveText="Approve"
                showApprove={item.isApproved === false}
              />
            </View>
          )}
        />
      )}
    </View>
  );
};

// Updated components for Services and Orders
const Services = ({
  services,
  onDelete,
  onApprove,
  fetchData,
}: {
  services: Service[];
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  fetchData: () => void;
}) => {
  const [selectedStat, setSelectedStat] = useState<String | null>(
    "total-services"
  );
  const totalServices = services.length;
  const activeServices = services.filter((s) => s.status === "active").length;
  const inactiveServices = services.filter(
    (s) => s.status === "inactive"
  ).length;
  const recentServices = services.filter((s) => {
    const daysAgo =
      (Date.now() - new Date(s.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 30;
  }).length;

  const handleServiceApprove = async (id: string) => {
    try {
      await axiosInstance.put(`/service/${id}/toggle-status`);
      Alert.alert("Success", "Service status changed successfully");
      fetchData();
    } catch (error) {
      Alert.alert("Error", "Failed to approve service");
    }
  };

  return (
    <View style={styles.overviewContainer}>
      <Text style={styles.sectionTitle}>Services Overview</Text>
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Services"
          value={totalServices}
          icon="briefcase-outline"
          onPress={() => {
            setSelectedStat("total-services");
          }}
        />
        <StatCard
          title="Active Services"
          value={activeServices}
          icon="checkmark-circle-outline"
          onPress={() => {}}
        />
        <StatCard
          title="Inactive Services"
          value={inactiveServices}
          icon="close-circle-outline"
          onPress={() => {}}
        />
      </View>
      {selectedStat === "total-services" && (
        <FlatList
          data={services}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <TouchableOpacity
                  onPress={() => {
                    handleServiceApprove(item._id);
                  }}
                  style={[
                    styles.statusTag,
                    {
                      backgroundColor:
                        item.status === "active" ? "#4CAF50" : "#F44336",
                    },
                  ]}
                >
                  <Text style={styles.statusText}>{item.status}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.serviceLocation}>{item.location}</Text>
              <Text style={styles.serviceEmail}>{item.email}</Text>
              <Text style={styles.serviceContact}>{item.contactInfo}</Text>

              <ActionButtons
                onApprove={() => onApprove(item._id)}
                onDelete={() => onDelete(item._id)}
                approveText="Approve"
                showApprove={item.status !== "active"}
              />
            </View>
          )}
          style={styles.list}
        />
      )}
    </View>
  );
};

const Orders = ({
  orders,
  onDelete,
  onApprove,
}: {
  orders: Order[];
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
}) => {
  const totalOrders = orders.length;
  const completedOrders = orders.filter(
    (o) => o.orderStatus === "completed"
  ).length;
  const pendingOrders = orders.filter(
    (o) => o.orderStatus === "pending"
  ).length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <View style={styles.overviewContainer}>
      <Text style={styles.sectionTitle}>Orders Overview</Text>
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon="cart-outline"
          onPress={() => Alert.alert("Total Orders: " + totalOrders)}
        />
        <StatCard
          title="Completed"
          value={completedOrders}
          icon="checkmark-circle-outline"
          onPress={() => Alert.alert("completedOrders")}
        />
        <StatCard
          title="Pending"
          value={pendingOrders}
          icon="time-outline"
          onPress={() => Alert.alert("pendingOrders")}
        />
        {/* <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon="cash-outline"
          onPress={() => Alert.alert("totalRevenue")}
        /> */}
        {/* <StatCard
          title="Avg. Order Value"
          value={`$${averageOrderValue.toFixed(2)}`}
          icon="trending-up-outline"
          onPress={() => {}}
        /> */}
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>Order #{item._id.slice(-6)}</Text>
              <View
                style={[
                  styles.statusTag,
                  {
                    backgroundColor:
                      item.orderStatus === "completed" ? "#4CAF50" : "#FFA000",
                  },
                ]}
              >
                <Text style={[styles.statusText, { fontWeight: "bold" }]}>
                  {item.orderStatus.charAt(0).toUpperCase() +
                    item.orderStatus.slice(1)}
                </Text>
              </View>
            </View>
            <Text style={styles.orderAmount}>
              Total: ${item.totalAmount.toLocaleString()}
            </Text>
            <Text style={styles.orderItems}>
              Items: {item.orderItems.length}
            </Text>
            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text style={styles.shippingAddress}>
                    {item.shippingInfo.address}, {item.shippingInfo.city}
                  </Text>
                  <Text style={styles.paymentMethod}>
                    Payment: {item.paymentMethod}
                  </Text>
                </View>

                <View>
                  <Text style={{ fontWeight: "400", color: "gray" }}>
                    {item.paymentInfo.mobileMoneyName
                      .split(" ") // Split the string into words by spaces
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      ) // Capitalize the first letter of each word
                      .join(" ")}
                    {/* Join the words back with spaces */}
                  </Text>
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: "orange",
                      letterSpacing: 1,
                    }}
                  >
                    {item.paymentInfo.mobileMoneyNumber}
                  </Text>
                </View>
              </View>

              <Text style={{}}>
                Ordered on: {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <ActionButtons
                onApprove={() => onApprove(item._id)}
                onDelete={() => onDelete(item._id)}
                approveText="Approve"
                showApprove={item.orderStatus === "processing"}
              />
              {item.paymentInfo.status === "paid" && (
                <View style={{ alignItems: "center", marginTop: 12 }}>
                  <TouchableOpacity
                    style={{
                      padding: 5,
                      backgroundColor: "#4CAF50",
                      borderRadius: 6,
                      flexDirection: "row",
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      Paid
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
};

const SalesReports = () => (
  <View>
    <Text style={styles.sectionTitle}>Sales Reports</Text>
    <View style={[styles.statsGrid, { flexWrap: "wrap" }]}>
      <StatCard
        title="Total Revenue"
        value="$125,430"
        icon="cash-outline"
        onPress={() => {}}
      />
      <StatCard
        title="Monthly Growth"
        value="+12.5%"
        icon="trending-up-outline"
        onPress={() => {}}
      />
      <StatCard
        title="Orders"
        value="1,234"
        icon="cart-outline"
        onPress={() => {}}
      />
      {/* <StatCard
        title="Average Order"
        value="$102"
        icon="calculator-outline"
        onPress={() => {}}
      /> */}
    </View>
  </View>
);

// Main Component
const Administrators = () => {
  const { userProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState("userManagement");
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<User[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [jobsCreated, setJobsCreated] = useState<JobsCreated[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDeleteUser = async (id: string) => {
    try {
      await axiosInstance.delete(`/user/users/${id}`);
      Alert.alert("Success", "User deleted successfully");
      fetchData();
    } catch (error) {
      Alert.alert("Error", "Failed to delete user");
    }
  };

  const handleApproveUser = async (id: string) => {
    try {
      // Send a PATCH request to update the user's approval status to true
      const response = await axios.put(
        `https://onemarketapi.xyz/api/v1/user/${id}/approve`, // Correct URL format using template literals
        { isApproved: true }, // We are passing the request body as JSON
        {
          headers: {
            "Content-Type": "application/json", // Ensure it's sending JSON
          },
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", "User verified successfully");
        fetchData(); // Refresh data after successful approval
      }
    } catch (error) {
      // Handle error and show appropriate message
      console.error(error); // Log the error for debugging
      Alert.alert("Error", "Failed to verify user");
    }
  };

  const handleDeleteLostItem = async (id: string) => {
    try {
      await axiosInstance.delete(`/lost/item/${id}`);
      Alert.alert("Success", "Item deleted successfully");
      fetchData();
    } catch (error) {
      Alert.alert("Error", "Failed to delete item");
    }
  };

  const handleMarkItemFound = async (id: string) => {
    try {
      // Send PATCH request to update the item
      await axiosInstance.patch(`/lost/${id}/status`, {
        // Change the status to "found"
        status: "found", // Optionally, set the item to approved (if needed)
      });

      // Show success alert
      Alert.alert("Success", "Item marked as found");

      // Refetch the data after updating
      fetchData();
    } catch (error) {
      // Show error alert if the request fails
      Alert.alert("Error", "Failed to update item status");
    }
  };
  const handleMarkItemapprove = async (id: string) => {
    try {
      // Send PATCH request to update the item
      await axiosInstance.put(`/lost/${id}/status`, {
        // Change the status to "found"
        isApproved: true, // Optionally, set the item to approved (if needed)
      });

      // Show success alert
      Alert.alert("Success", "Item marked as found");

      // Refetch the data after updating
      fetchData();
    } catch (error) {
      // Show error alert if the request fails
      Alert.alert("Error", "Failed to update item status");
    }
  };

  const handleJobsdelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/job/${id}`);
      Alert.alert("Success", "Item deleted successfully");
      fetchData();
    } catch (error) {
      Alert.alert("Error", "Failed to update item status");
    }
  };
  const handleJobApprove = async (id: string) => {
    try {
      await axiosInstance.patch(`/job/${id}/app-status`, { isApproved: true });
      Alert.alert("Success", "Application approved");
      fetchData();
    } catch (error) {
      Alert.alert("Error", "Failed to update item status");
    }
  };
  const handleJobcreateApprove = async (id: string) => {
    try {
      await axiosInstance.patch(`/job/${id}/approve`, { isApproved: true });
      Alert.alert("Success", "Item marked as found");
      fetchData();
    } catch (error) {
      Alert.alert("Error", "Failed to update item status");
    }
  };

  const handleServicesdelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/service/services/${id}`);
      Alert.alert("Success", "Service deleted successfully");
      fetchData();
    } catch (error) {
      Alert.alert("Error", "Failed to delete service");
    }
  };
  const handleServiceApprove = async (id: string) => {
    try {
      await axiosInstance.put(`/service/${id}/approval`, {
        isApproved: true,
      });
      await axiosInstance.put(`/service/${id}/toggle-status`);

      Alert.alert("Success", "Service approved successfully");
      fetchData();
    } catch (error) {
      Alert.alert("Error", "Failed to approve service");
    }
  };
  const handleOrdersdelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/orders/orders/${id}`);
      Alert.alert("Success", "Order deleted successfully");
      fetchData();
    } catch (error) {
      Alert.alert("Error", "Failed to delete order");
    }
  };
  const handleOrdersApprove = async (id: string) => {
    try {
      await axiosInstance.put(`/orders/update-payment-status/${id}`);
      Alert.alert("Success", "Order approved successfully");
      fetchData();
    } catch (error) {
      Alert.alert("Error", "Failed to approve order");
    }
  };
  const handleDeleteJobApplication = async (id: string) => {
    try {
      await axiosInstance.delete(`/job/${id}`);
      Alert.alert("Success", "Job Application deleted successfully");
      fetchData();
    } catch (error) {
      Alert.alert("Error", "Failed to delete job application");
    }
  };
  const handleDeleteJobCreation = async (id: string) => {
    try {
      await axiosInstance.delete(`/job/${id}`);
      Alert.alert("Success", "Job Creation deleted successfully");
      fetchData();
    } catch (error) {
      Alert.alert("Error", "Failed to delete job creation");
    }
  };

  const fetchData = async () => {
    const fetchConfigs: FetchConfig[] = [
      {
        endpoint: "/job/all",
        dataKey: "jobApplications",
        fallbackValue: [],
      },
      {
        endpoint: "/job/all-jobs",
        dataKey: "jobCreations",
        fallbackValue: [],
      },
      {
        endpoint: "/product/get-all",
        dataKey: "products",
        fallbackValue: [],
        filterFn: (data) => (data.success ? data.products : []),
      },
      {
        endpoint: "/user/getusers",
        fallbackValue: [],
        filterFn: (data) =>
          Array.isArray(data)
            ? data.filter((user: User) => user.role !== "guest")
            : [],
      },
      {
        endpoint: "/lost/lost-items",
        dataKey: "items",
        fallbackValue: [],
      },
      {
        endpoint: "/service/services",
        dataKey: "services",
        fallbackValue: [],
      },
      {
        endpoint: "/orders/all-orders",
        fallbackValue: [],
      },
    ];

    setLoading(true);

    try {
      const results = await Promise.allSettled(
        fetchConfigs.map((config) => axiosInstance.get(config.endpoint))
      );

      const processedData = results.map((result, index) => {
        const config = fetchConfigs[index];

        if (result.status === "fulfilled") {
          const data = result.value.data;

          // If filterFn exists, use it first
          if (config.filterFn) {
            return config.filterFn(data);
          }

          // If dataKey exists, extract data using it
          if (config.dataKey) {
            return data[config.dataKey] || config.fallbackValue;
          }

          // If no specific processing, return data or fallback
          return data || config.fallbackValue;
        }

        // If fetch failed, return fallback
        return config.fallbackValue || [];
      });

      // Update state with processed data
      setJobApplications(processedData[0]);
      setJobsCreated(processedData[1]);
      setProducts(processedData[2]);
      setSellers(processedData[3]);
      setLostItems(processedData[4]);
      setServices(processedData[5]);
      setOrders(processedData[6]);

      // Error handling
      const failedRequests = results.filter(
        (result) => result.status === "rejected"
      );

      // if (failedRequests.length > 0) {
      //   const errorMessages = failedRequests.map(
      //     (failed) => (failed as PromiseRejectedResult).reason.message
      //   );

      //   Alert.alert(
      //     "Partial Data Fetch Error",
      //     `Some data could not be retrieved: ${errorMessages.join(", ")}`
      //   );
      // }
    } catch (error) {
      Alert.alert(
        "Error",
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Network error occurred"
          : "An unexpected error occurred"
      );
      console.error("Data fetching error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

 

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setOpen(!open)}>
          <Ionicons
            name={open ? "chevron-back" : "menu"}
            size={24}
            color="#333"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Welcome, {userProfile?.name}</Text>
        <View>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </View>
      </View>

      {open && (
        <View style={styles.sidebar}>
          <MenuButton
            title="User Management"
            icon="people-outline"
            active={openSection === "userManagement"}
            onPress={() => {
              setOpen(!open);
              setOpenSection("userManagement");
            }}
          />
          <MenuButton
            title="Products Overview"
            icon="stats-chart-outline"
            active={openSection === "Products"}
            onPress={() => {
              setOpen(!open);
              setOpenSection("Products");
            }}
          />
          <MenuButton
            title="Lost Items Overview"
            icon="stats-chart-outline"
            active={openSection === "lostItems"}
            onPress={() => {
              setOpen(!open);
              setOpenSection("lostItems");
            }}
          />
          <MenuButton
            title="Jobs Overview"
            icon="stats-chart-outline"
            active={openSection === "Jobs"}
            onPress={() => {
              setOpen(!open);
              setOpenSection("Jobs");
            }}
          />

          <MenuButton
            title="Orders Overview"
            icon="stats-chart-outline"
            active={openSection === "Orders"}
            onPress={() => {
              setOpen(!open);
              setOpenSection("Orders");
            }}
          />
          <MenuButton
            title="Services Overview"
            icon="stats-chart-outline"
            active={openSection === "Services"}
            onPress={() => {
              setOpen(!open);
              setOpenSection("Services");
            }}
          />

          <MenuButton
            title="Sales Reports"
            icon="cash-outline"
            active={openSection === "salesReports"}
            onPress={() => {
              setOpen(!open);
              setOpenSection("salesReports");
            }}
          />
        </View>
      )}

      <View style={[styles.content, open && styles.contentWithSidebar]}>
        {openSection === "userManagement" && (
          <>
            <Text style={styles.sectionTitle}>User Management</Text>
            <View style={styles.statsContainer}>
              <StatCard
                title="Total Users"
                value={sellers.length}
                icon="people"
                onPress={() => {}}
              />
              <StatCard
                title="Active Users"
                value={Math.floor(sellers.length * 0.8)}
                icon="checkmark-circle"
                onPress={() => {}}
              />
              <StatCard
                title="New Users"
                value={Math.floor(sellers.length * 0.2)}
                icon="person-add"
                onPress={() => {}}
              />
            </View>
            <FlatList
              data={sellers}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <UserCard
                  user={item}
                  onDelete={handleDeleteUser}
                  onApprove={handleApproveUser}
                />
              )}
            />
          </>
        )}

        {openSection === "Products" && (
          <Products products={products} fetchData={fetchData} />
        )}
        {openSection === "salesReports" && <SalesReports />}
        {openSection === "lostItems" && (
          <LostItems
            items={lostItems}
            onDelete={handleDeleteLostItem}
            onApprove={handleMarkItemFound}
          />
        )}
        {openSection === "Jobs" && (
          <Jobs
            applications={jobApplications}
            created={jobsCreated}
            onDelete={handleJobsdelete}
            onApprove={handleJobApprove}
            fetchData={fetchData}
          />
        )}
        {openSection === "Orders" && (
          <Orders
            orders={orders}
            onDelete={handleOrdersdelete}
            onApprove={handleOrdersApprove}
          />
        )}
        {openSection === "Services" && (
          <Services
            services={services}
            onDelete={handleServicesdelete}
            onApprove={handleServiceApprove}
            fetchData={fetchData}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

// Styles remain the same...
const styles = StyleSheet.create({
  approveButton: {
    backgroundColor: "#4CAF50", // Green background for approve button
  },
  deleteButton: {
    backgroundColor: "#f44336", // Red background for delete button
  },
  actionButtonText: {
    color: "#fff",
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.5, // Reduced opacity when disabled
  },
  disabledText: {
    color: "#ccc", // Change text color when disabled
  },
  overviewContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  jobApplicationCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  jobApplicationName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  jobApplicationEmail: {
    fontSize: 14,
    color: "#555",
  },
  jobApplicationPhone: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  jobCreatedCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  jobCreatedTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  jobCreatedCompany: {
    fontSize: 14,
    color: "#555",
  },
  jobCreatedLocation: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  actionButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  sidebar: {
    position: "absolute",
    top: 95,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#333",
    padding: 16,
    zIndex: 100,
    borderTopRightRadius: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contentWithSidebar: {
    marginLeft: 280,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    width: "30%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statTitle: {
    fontSize: 14,
    color: "#666",
  },
  productCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "500",
    marginBottom: 4,
  },
  productStock: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: "#666",
  },
  productList: {
    marginTop: 16,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },

  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },

  lostItemCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  itemLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  serviceCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  serviceLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  serviceEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  serviceContact: {
    fontSize: 14,
    color: "#666",
  },
  orderCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 5,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 8,
  },
  orderItems: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
  shippingAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  paymentMethod: {
    fontSize: 14,
    color: "#666",
  },
  list: {
    marginTop: 16,
  },

  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  menuButtonActive: {
    backgroundColor: "#fff",
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    color: "#fff",
    fontSize: 16,
  },
  menuTextActive: {
    color: "#333",
  },

  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  userCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  roleTag: {
    alignItems: "center",

    borderRadius: 16,
  },
  roleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default Administrators;
