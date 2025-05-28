import { useAuth } from "@/context/AuthContext";
import { useProduct } from "@/context/ProductContext";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Card, Paragraph, Snackbar, Title } from "react-native-paper";
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
  status: string;
  _id: string;
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
  orderStatus: string;
}

interface OrderModalProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
  onMarkDelivered: (orderId: string, itemId: string) => Promise<void>;
}

const OrderModal: React.FC<OrderModalProps> = ({
  visible,
  order,
  onClose,
  onMarkDelivered,
}) => {
  if (!order) return null;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderText}>Order Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Title>Order #{order._id}</Title>
            <View style={styles.orderStatusContainer}>
              <Text style={styles.sectionHeader}>Items:</Text>
              <View style={styles.statusContainer}>
                <Text style={styles.sectionHeader}>Status:</Text>
                <Text style={[styles.sectionHeader, styles.statusText]}>
                  {order.orderStatus.toUpperCase()}
                </Text>
              </View>
            </View>

            {order.orderItems.map((item: OrderItem) => (
              <Card key={item._id} style={styles.itemCard}>
                <Card.Content>
                  <View style={styles.itemHeader}>
                    <Title>{item.name}</Title>
                    <Text>{item.status}</Text>
                  </View>

                  {item.image && (
                    <Card.Cover
                      source={{ uri: item.image }}
                      style={styles.itemImage}
                    />
                  )}

                  <Paragraph>Quantity: {item.quantity}</Paragraph>
                  <Paragraph>Price: XAF{item.price.toFixed(2)}</Paragraph>
                  <Paragraph>
                    Total: XAF{(item.price * item.quantity).toFixed(2)}
                  </Paragraph>

                  {item.status === "processing" && (
                    <Button
                      mode="contained"
                      onPress={() => onMarkDelivered(order._id, item._id)}
                      style={styles.deliveredButton}
                    >
                      Mark as Delivered
                    </Button>
                  )}
                </Card.Content>
              </Card>
            ))}

            <Text style={styles.sectionHeader}>Shipping Information:</Text>
            <Card style={styles.infoCard}>
              <Card.Content>
                <Paragraph>{order.shippingInfo.address}</Paragraph>
                <Paragraph>
                  {order.shippingInfo.city}, {order.shippingInfo.country}
                </Paragraph>
                <Paragraph>
                  Postal Code: {order.shippingInfo.postalCode}
                </Paragraph>
              </Card.Content>
            </Card>

            <Text style={styles.sectionHeader}>Payment Information:</Text>
            <Card style={styles.infoCard}>
              <Card.Content>
                <Paragraph>Method: {order.paymentMethod}</Paragraph>
                {order.paymentMethod === "Mobile Money" && (
                  <>
                    <Paragraph>
                      Provider: {order.paymentInfo.mobileMoneyProvider}
                    </Paragraph>
                    <Paragraph>Status: {order.paymentInfo.status}</Paragraph>
                  </>
                )}
                <Paragraph>
                  Total Amount: ${order.totalAmount.toFixed(2)}
                </Paragraph>
                <Paragraph>Tax: ${order.tax.toFixed(2)}</Paragraph>
                <Paragraph>
                  Shipping: ${order.shippingCharges.toFixed(2)}
                </Paragraph>
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const VendorDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const { orders } = useProduct();
  const [createdOrders, setCreatedOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  const filterCreatedOrders = useCallback(async () => {
    if (!userProfile?._id) return;

    try {
      
      // First refresh orders from server
     
      
      // Then filter locally
      const sellerOrders = (orders as Order[]).filter((order: Order) => 
        order.orderItems.some((item: OrderItem) => item.sellerId === userProfile._id)
      );
      
      setCreatedOrders(sellerOrders);
      setFilteredOrders(sellerOrders);
    } catch (error) {
      console.error("Error filtering orders:", error);
      setSnackbarMessage("Failed to load orders");
      setSnackbarVisible(true);
    } finally {
      
    }
  }, [orders, userProfile?._id]);

  useEffect(() => {
    filterCreatedOrders();
  }, [filterCreatedOrders]);
  const markAsDelivered = async (
    orderId: string,
    itemId: string
  ): Promise<void> => {
    try {
      setIsLoadingOrders(true);
      await axios.put(
        `https://onemarketapi.xyz/api/v1/orders/${orderId}/deliver/${itemId}`
      );
      filterCreatedOrders(); // Refresh orders after update
      setSnackbarMessage("Order marked as delivered successfully");
      setSnackbarVisible(true);
    } catch (error) {
      console.error("Error marking order as delivered:", error);
      setSnackbarMessage("Failed to mark order as delivered");
      setSnackbarVisible(true);
    } finally {
      setIsLoadingOrders(false);
      setModalVisible(false);
    }
  };

  const filterOrdersByStatus = (status: string): void => {
    setFilterStatus(status);

    if (status === "") {
      setFilteredOrders(createdOrders);
    } else {
      const filtered = createdOrders.filter((order) => {
        if (status === "processing") {
          return (
            order.orderStatus === "processing" ||
            order.orderStatus === "shipped"
          );
        } else if (status === "delivered") {
          return order.orderStatus === "delivered";
        } else if (status === "failed") {
          return order.paymentInfo.status === "failed";
        }
        return false;
      });
      setFilteredOrders(filtered);
    }
  };

  const updateOrderStatus = async (orderId: string, orderStatus: string) => {
    try {
      setIsLoadingOrders(true);
      const response = await axios.put(
        `https://onemarketapi.xyz/api/v1/orders/orders/${orderId}/status`,
        { orderStatus }
      );

      if (response.status === 200) {
        filterCreatedOrders(); // Refresh orders after update
        setSnackbarMessage(`Order status updated to ${orderStatus}`);
        setSnackbarVisible(true);
      } else {
        setSnackbarMessage("Failed to update order status");
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      setSnackbarMessage("Error updating order status");
      setSnackbarVisible(true);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleMarkAsShipped = (orderId: string) => {
    updateOrderStatus(orderId, "shipped");
  };

  const handleMarkAsDelivered = (orderId: string) => {
    updateOrderStatus(orderId, "delivered");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "" && styles.activeFilter,
            ]}
            onPress={() => filterOrdersByStatus("")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === "" && styles.activeFilterText,
              ]}
            >
              All Orders
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "processing" && styles.activeFilter,
            ]}
            onPress={() => filterOrdersByStatus("processing")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === "processing" && styles.activeFilterText,
              ]}
            >
              Processing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "delivered" && styles.activeFilter,
            ]}
            onPress={() => filterOrdersByStatus("delivered")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === "delivered" && styles.activeFilterText,
              ]}
            >
              Delivered
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "failed" && styles.activeFilter,
            ]}
            onPress={() => filterOrdersByStatus("failed")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === "failed" && styles.activeFilterText,
              ]}
            >
              Failed
            </Text>
          </TouchableOpacity>
        </View>

        {isLoadingOrders && (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.loader}
          />
        )}

        {!isLoadingOrders && !ordersError && filteredOrders.length === 0 && (
          <Text style={styles.noOrdersText}>
            No orders available for the selected status.
          </Text>
        )}

        {filteredOrders.map((order) => (
          <Card
            key={order._id}
            style={styles.card}
            onPress={() => {
              setSelectedOrder(order);
              setModalVisible(true);
            }}
          >
            <Card.Content>
              <Title>Order #{order._id.slice(0, 8)}...</Title>
              <View style={styles.orderInfo}>
                <Paragraph style={styles.orderStatus}>
                  Status: {order.orderStatus.toUpperCase()}
                </Paragraph>
                <Paragraph style={styles.orderAmount}>
                  Amount: ${order.totalAmount.toFixed(2)}
                </Paragraph>
              </View>
              <Paragraph style={styles.orderDate}>
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </Paragraph>
              <View style={styles.actionButtonsContainer}>
                {order.orderStatus === "processing" && (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      order.paymentMethod !== "Payment_On_Delivery" &&
                        styles.disabledButton,
                    ]}
                    onPress={() => handleMarkAsShipped(order._id)}
                    disabled={order.paymentMethod !== "Payment_On_Delivery"}
                  >
                    <Text style={styles.buttonText}>
                      {order.paymentMethod === "Payment_On_Delivery"
                        ? "Mark As Shipped"
                        : "Waiting For Payment"}
                    </Text>
                  </TouchableOpacity>
                )}

                {order.orderStatus === "shipped" && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deliverButton]}
                    onPress={() => handleMarkAsDelivered(order._id)}
                  >
                    <Text style={styles.buttonText}>Mark as Delivered</Text>
                  </TouchableOpacity>
                )}

                {order.orderStatus === "delivered" && (
                  <View style={styles.successIcon}>
                    <Ionicons name="checkmark-circle" size={24} color="green" />
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        ))}

        <OrderModal
          visible={modalVisible}
          order={selectedOrder}
          onClose={() => {
            setModalVisible(false);
            setSelectedOrder(null);
          }}
          onMarkDelivered={markAsDelivered}
        />

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          {snackbarMessage}
        </Snackbar>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    
    backgroundColor: "#fff",
  },
  container: {
    padding: 1,
    backgroundColor: "#fff",
    marginTop: -40,
  },
  filterButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 1,
  },
  filterButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
    minWidth: "23%",
    alignItems: "center",
  },
  activeFilter: {
    backgroundColor: "#007AFF",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#ffffff",
  },
  card: {
    marginVertical: 10,
    elevation: 2,
  borderRadius: 8,
  },
  loader: {
    marginTop: 20,
  },
  noOrdersText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalHeaderText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  modalContent: {
    padding: 16,
  },
  orderStatusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusText: {
    color: "green",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  itemCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemImage: {
    height: 200,
    marginVertical: 8,
    borderRadius: 4,
  },
  deliveredButton: {
    marginTop: 8,
    backgroundColor: "#007AFF",
  },
  infoCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  orderInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  orderStatus: {
    fontWeight: "500",
    color: "#666",
  },
  orderAmount: {
    fontWeight: "500",
  },
  orderDate: {
    color: "#666",
    fontSize: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  actionButtonsContainer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "green",
  },
  disabledButton: {
    backgroundColor: "lightgray",
  },
  deliverButton: {
    backgroundColor: "orange",
  },
  successIcon: {
    alignSelf: "flex-end",
  },
});

export default VendorDashboard;